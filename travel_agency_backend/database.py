from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import uuid

SQLALCHEMY_DATABASE_URL = "sqlite:///./crm_travel.db"
# If you want to use PostgreSQL later, you just change this URL:
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String, unique=True, index=True, default=lambda: f"BKG-{uuid.uuid4().hex[:8].upper()}")
    
    # Customer Details
    customer_name = Column(String, index=True)
    customer_email = Column(String, index=True)
    customer_phone = Column(String)
    
    # Package Details
    package_id = Column(String)
    package_name = Column(String)
    travelers_count = Column(Integer)
    travel_date = Column(String)
    special_requests = Column(Text, nullable=True)
    
    # Billing Details
    amount_paid = Column(Float)
    payment_status = Column(String, default="COMPLETED")
    
    # Meta
    booking_date = Column(DateTime, default=datetime.datetime.utcnow)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
