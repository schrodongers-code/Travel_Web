import os
import pandas as pd

from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings


# ============================================================
# 1. Setup paths
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FLIGHTS_CSV = os.path.join(BASE_DIR, "flights.csv")
PACKAGES_CSV = os.path.join(BASE_DIR, "travel_packages.csv")

FAISS_INDEX = os.path.join(
    BASE_DIR,
    "faiss_index"
)


# ============================================================
# 2. Load FAISS database
# ============================================================

print("Loading FAISS index...")

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2"
)

vectorstore = FAISS.load_local(
    FAISS_INDEX,
    embeddings,
    allow_dangerous_deserialization=True
)

retriever = vectorstore.as_retriever(
    search_kwargs={"k": 3}
)


# ============================================================
# 3. Define Tools
# ============================================================

@tool
def search_flights(origin: str, destination: str) -> str:
    """
    Searches for flights between an origin and destination.
    Use standard airport codes such as DEL, DXB, LHR.
    """
    try:
        df = pd.read_csv(FLIGHTS_CSV)

        results = df[
            (df["origin"] == origin.upper()) &
            (df["destination"] == destination.upper())
        ]

        if results.empty:
            return f"No flights found from {origin} to {destination}."

        return results.to_string(index=False)

    except Exception as e:
        return f"Error reading flight data: {e}"


@tool
def search_packages(destination: str) -> str:
    """
    Searches for available travel packages
    for a specific destination.
    """
    try:
        df = pd.read_csv(PACKAGES_CSV)

        results = df[
            df["destination"].str.contains(
                destination,
                case=False,
                na=False
            )
        ]

        if results.empty:
            return f"No packages found for {destination}."

        return results.to_string(index=False)

    except Exception as e:
        return f"Error reading package data: {e}"


@tool
def search_hotels(location: str) -> str:
    """
    Searches for hotels in a specific location.
    """
    return (
        f"We currently do not have direct hotel bookings for "
        f"{location} outside of our pre-arranged travel packages. "
        f"Please refer to our packages for included accommodations."
    )


@tool
def get_package_details(package_name: str) -> str:
    """
    Gets specific details for a named travel package.
    """
    try:
        df = pd.read_csv(PACKAGES_CSV)

        results = df[
            df["name"].str.contains(
                package_name,
                case=False,
                na=False
            )
        ]

        if results.empty:
            return f"Package '{package_name}' not found."

        return results.to_string(index=False)

    except Exception as e:
        return f"Error reading package data: {e}"

@tool
def verify_package(package_name: str) -> str:
    """
    Verifies that an exact travel package exists.
    Returns the exact package record if found.
    """
    try:
        df = pd.read_csv(PACKAGES_CSV)

        results = df[
            df["name"].str.strip().str.casefold()
            == package_name.strip().casefold()
        ]

        if results.empty:
            return f"No exact package named '{package_name}' was found."

        return results.to_json(orient="records")

    except Exception as e:
        return f"Error verifying package: {e}"

@tool
def search_policies(query: str) -> str:
    """
    Searches official company policies such as
    cancellation, refund, terms and insurance.
    """
    docs = retriever.invoke(query)

    if not docs:
        return "No relevant policy information found."

    return "\n\n".join(
        doc.page_content for doc in docs
    )


@tool
def search_visa_info(query: str) -> str:
    """
    Searches for visa requirements and information.
    """
    docs = retriever.invoke(
        query + " visa requirements"
    )

    if not docs:
        return "No relevant visa information found."

    return "\n\n".join(
        doc.page_content for doc in docs
    )


@tool
def create_itinerary(destination: str, days: int) -> str:
    """
    Generates a suggested day-by-day itinerary
    for a destination.
    """
    return (
        f"I can help you build a custom {days}-day itinerary "
        f"for {destination}. Usually, Day 1 involves arrival "
        f"and check-in, the middle days feature guided local "
        f"sightseeing, and the final day is for departure. "
        f"Would you like me to refine this based on interests "
        f"such as adventure, culture, food, or relaxation?"
    )


# ============================================================
# 4. Register tools
# ============================================================

tools = [
    search_flights,
    search_packages,
    search_hotels,
    get_package_details,
    verify_package,
    search_policies,
    search_visa_info,
    create_itinerary
]


# ============================================================
# 5. Create Agent with Memory
# ============================================================
from langgraph.checkpoint.memory import MemorySaver
memory = MemorySaver()

SYSTEM_PROMPT = """You are a helpful AI travel assistant for a travel agency.

GENERAL RULES:
- For flights, ALWAYS use the flight search tool.
- For travel packages, ALWAYS use the package search or package details tool.
- For company policies, ALWAYS use the policy RAG tool.
- For visa requirements, ALWAYS use the visa RAG tool.
- Never answer these questions from general model knowledge when a relevant tool is available.
- Never invent flight, package, hotel, visa, price, availability, or company policy information.

BOOKING FLOW:
When a user wants to book a travel package:

1. Identify the exact package the user wants.
2. If the package is ambiguous, use the package search tool and ask the user to choose.
3. Collect ALL of these required details:
   - Customer name
   - Email
   - Phone number
   - Number of travelers
   - Expected travel date
4. Ask for special requests or notes. This field is optional.
5. Do not create a booking intent until every required field has been collected.
6. Validate that the number of travelers is greater than 0.
7. Do not assume missing information.
8. Summarize the complete booking details and ask the user to explicitly confirm them.
9. Do NOT create a booking intent before the user confirms.
10. If the user changes any booking detail, update the information and ask for confirmation again.
11. If the user cancels the booking process, do not create a booking intent.

AFTER USER CONFIRMATION:
Only after the user explicitly confirms the complete booking summary, output exactly one JSON block enclosed by these markers:

$$$BOOKING_INTENT$$$
{
  "package_name": "Exact package name",
  "customer_name": "Customer name",
  "email": "customer@email.com",
  "phone": "Phone number",
  "travelers": 2,
  "travelDate": "YYYY-MM-DD",
  "notes": "Special requests or null"
}
$$$BOOKING_INTENT$$$

IMPORTANT:
- package_name must exactly match the package name returned by the package data.
- Do not invent a package.
- Do not invent customer information.
- Do not output BOOKING_INTENT before explicit user confirmation.
- Do not claim that payment has been completed.
- Do not claim that a booking has been successfully created. The backend handles actual booking creation.
"""

def get_agent():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY or GOOGLE_API_KEY is not configured."
    )
        
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.1-flash-lite",
        temperature=0,
        api_key=api_key
    )

    # Note: create_agent here is likely using create_react_agent from langgraph if it accepts checkpointer.
    # We will pass state_modifier as the system prompt.    
    agent = create_agent(
        model=llm,
        tools=tools,
        checkpointer=memory,
        system_prompt=SYSTEM_PROMPT
    )

    return agent