from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field, field_validator
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from sqlalchemy.orm import Session
from database import engine, Base, Booking, get_db
from datetime import date
import resend


# Load environment variables explicitly from this directory
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)
# Also load from parent directory just in case
parent_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(parent_env)

resend.api_key = os.getenv("RESEND_API_KEY")


# Ensure the key is exposed
if not os.getenv("GEMINI_API_KEY") and os.getenv("GOOGLE_API_KEY"):
    os.environ["GEMINI_API_KEY"] = os.getenv("GOOGLE_API_KEY")

from agent import get_agent

# Create tables in the database (SQLite automatically handles this locally)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Travel Agency AI Chatbot Backend")


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Request model
# ============================================================

class ChatRequest(BaseModel):
    message: str
    session_id: str


# ============================================================
# Initialize AI Agent
# ============================================================

import traceback

try:
    agent = get_agent()
    print("AI Agent initialized successfully!")

except Exception as e:
    print(f"Failed to initialize agent: {e}")
    traceback.print_exc()
    agent = None


# ============================================================
# Chat endpoint
# ============================================================

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):

    print("CHAT ENDPOINT REACHED")
    print("MESSAGE:", req.message)
    print("AGENT TYPE:", type(agent))

    if agent is None:
        raise HTTPException(
            status_code=500,
            detail="AI agent is not initialized."
        )

    try:

        # Send message to LangChain agent
        config = {
            "configurable": {
                "thread_id": req.session_id
            }  
        }
        result = agent.invoke({
            "messages": [
                {
                    "role": "user",
                    "content": req.message
                }
            ]
        }, config)

        print("AGENT RESULT RECEIVED")
        print(result)

        # Get final AI message
        final_message = result["messages"][-1]

        # Get content from AI message
        content = final_message.content

        print("RAW CONTENT:")
        print(content)

        # ====================================================
        # Convert Gemini structured response into plain text
        # ====================================================

        if isinstance(content, str):

            # Normal string
            answer = content

        elif isinstance(content, list):

            # Gemini may return:
            #
            # [
            #   {
            #       "type": "text",
            #       "text": "Hello...",
            #       "extras": {}
            #   }
            # ]

            text_parts = []

            for item in content:

                if isinstance(item, str):
                    text_parts.append(item)

                elif isinstance(item, dict):

                    if item.get("type") == "text":

                        text_parts.append(
                            item.get("text", "")
                        )

            answer = "".join(text_parts)

        elif isinstance(content, dict):

            # Handle a single structured object

            if "text" in content:
                answer = content["text"]

            else:
                answer = str(content)

        else:

            answer = str(content)

        # Safety check
        if not answer:
            answer = "Sorry, I couldn't generate a response."

        print("FINAL ANSWER:")
        print(answer)

        # ====================================================
        # IMPORTANT:
        # Always send a simple string to React
        # ====================================================

        return {
            "response": answer
        }

    except Exception as e:

        print("========== CHAT ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        print(repr(e))
        print("================================")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# Health check
# ============================================================
@app.get("/test-email")
async def test_email():
    params = {
        "from": "onboarding@resend.dev",
        "to": ["sanjaysunil9214@gmail.com"],
        "subject": "Jetsetter Email Test",
        "html": """
        <h2>Jetsetter Email Test</h2>
        <p>Your Resend integration is working!</p>
        """
    }

    email = resend.Emails.send(params)

    return {
        "success": True,
        "email_id": email.get("id")
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "agent_loaded": agent is not None
    }


# ============================================================
# Booking endpoint
# ============================================================

class BookingRequest(BaseModel):
    name: str
    email: str
    phone: str
    travelers: int = Field(gt=0)
    travelDate: date
    notes: str | None = None
    package_id: str
    package_name: str
    amount_paid: float

    @field_validator("travelDate")
    @classmethod
    def validate_travel_date(cls, value):
        if value < date.today():
            raise ValueError("Travel date cannot be in the past.")
        return value

@app.post("/book")
async def create_booking(req: BookingRequest, db: Session = Depends(get_db)):
    try:
        new_booking = Booking(
            customer_name=req.name,
            customer_email=req.email,
            customer_phone=req.phone,
            package_id=req.package_id,
            package_name=req.package_name,
            travelers_count=req.travelers,
            travel_date=req.travelDate,
            special_requests=req.notes,
            amount_paid=req.amount_paid,
            payment_status="COMPLETED"
        )
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        params = {
            "from": "onboarding@resend.dev",
            "to": [req.email],
            "subject": f"Jetsetter Booking Confirmed - {new_booking.booking_reference}",
            "html": f"""
            <h2>Booking Confirmed! ✈️</h2>

            <p>Hi {req.name},</p>

            <p>Your travel package has been successfully booked.</p>

            <hr>

            <h3>Booking Details</h3>

            <p><strong>Booking Reference:</strong> {new_booking.booking_reference}</p>
            <p><strong>Package:</strong> {req.package_name}</p>
            <p><strong>Travel Date:</strong> {req.travelDate}</p>
            <p><strong>Travelers:</strong> {req.travelers}</p>
            <p><strong>Amount Paid:</strong> ₹{req.amount_paid}</p>

            <hr>

            <p>Thank you for choosing Jetsetter!</p>
            <p>We look forward to helping you have a great trip.</p>
            """
        }

        print("================================")
        print("SENDING BOOKING EMAIL")
        print("TO:", req.email)
        print("BOOKING:", new_booking.booking_reference)

        try:
            email_result = resend.Emails.send(params)

            print("RESEND SUCCESS")
            print("RESEND RESPONSE:", email_result)

        except Exception as email_error:
            print("RESEND EMAIL FAILED")
            print("ERROR:", repr(email_error))


        return {
            "status": "success",
            "booking_reference": new_booking.booking_reference,
            "message": f"Successfully booked {req.package_name}"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# Run server
# ============================================================

if __name__ == "__main__":
    import uvicorn
    import os

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000))
    )