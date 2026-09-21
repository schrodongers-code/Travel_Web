import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

# We will need database access for these tools
from sqlalchemy.orm import Session
from database import SessionLocal, Booking
import datetime
import resend

@tool
def get_todays_bookings() -> str:
    """
    Get a summary of all bookings made today, including confirmed, pending, and cancelled counts.
    """
    db = SessionLocal()
    try:
        today = datetime.datetime.utcnow().date()
        bookings = db.query(Booking).filter(
            Booking.booking_date >= datetime.datetime.combine(today, datetime.time.min)
        ).all()
        
        if not bookings:
            return "There are no bookings for today."
            
        total = len(bookings)
        confirmed = sum(1 for b in bookings if b.payment_status == 'COMPLETED')
        pending = sum(1 for b in bookings if b.payment_status == 'PENDING')
        cancelled = sum(1 for b in bookings if b.payment_status == 'CANCELLED')
        
        # Format explicitly for the terminal UI
        return f"You have {total} bookings today.\n{confirmed} confirmed\n{pending} pending\n{cancelled} cancelled"
    except Exception as e:
        return f"Error fetching bookings: {e}"
    finally:
        db.close()

@tool
def resend_confirmation_email(customer_name: str) -> str:
    """
    Resends the confirmation email for a given customer's booking.
    Provide the customer name or a unique part of their name.
    """
    db = SessionLocal()
    try:
        # Find the booking by name (case-insensitive)
        booking = db.query(Booking).filter(Booking.customer_name.ilike(f"%{customer_name}%")).first()
        if not booking:
            return f"Could not find any bookings for {customer_name}."
            
        # Resend email logic
        params = {
            "from": "onboarding@resend.dev",
            "to": [booking.customer_email],
            "subject": f"Jetsetter Booking Confirmed (Resent) - {booking.booking_reference}",
            "html": f"<h2>Booking Confirmed! ✈️</h2><p>Hi {booking.customer_name}, here is your resent confirmation for {booking.package_name}.</p>"
        }
        try:
            resend.api_key = os.getenv("RESEND_API_KEY")
            if resend.api_key:
                resend.Emails.send(params)
                return f"I found {booking.booking_reference} for {booking.customer_name}.\nConfirmation email sent ✓"
            else:
                return f"I found {booking.booking_reference} for {booking.customer_name}.\nError: RESEND_API_KEY not configured, cannot send email."
        except Exception as e:
            return f"I found {booking.booking_reference} for {booking.customer_name}.\nError sending email: {e}"
            
    except Exception as e:
        return f"Error searching database: {e}"
    finally:
        db.close()

@tool
def schedule_follow_up(time_and_date: str) -> str:
    """
    Schedules a follow-up call with a customer.
    Input should be the requested time and date, e.g. "tomorrow at 11 AM".
    """
    # This is a mock MCP connection to Google Calendar
    return "Follow-up scheduled ✓\nGoogle Calendar event created."

admin_tools = [
    get_todays_bookings,
    resend_confirmation_email,
    schedule_follow_up
]

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are the AI OPERATIONS ASSISTANT, an internal staff AI for a travel agency.
You are connected via MCP to the company's Database, Email Server (Resend), and Calendar.
Your responses must be extremely concise, matching a terminal style. 
Do not use markdown bolding (**) in your output. Use simple line breaks (\\n) to format lists.
Keep responses to 2-3 short lines max."""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# Use Gemini
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
agent = create_tool_calling_agent(llm, admin_tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=admin_tools, verbose=True)

store = {}
def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

admin_agent_with_history = RunnableWithMessageHistory(
    agent_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

def get_admin_agent():
    return admin_agent_with_history
