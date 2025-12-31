from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship as orm_relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    role = Column(String, default="user") # user, admin
    
    # Profile Fields
    full_name = Column(String, nullable=True)
    mobile_number = Column(String, nullable=True)
    timezone = Column(String, default="UTC")
    language = Column(String, default="en")
    profile_photo_url = Column(String, nullable=True)
    notification_preferences = Column(Text, default="{}") # JSON string
    is_google_user = Column(Integer, default=0) # 0=False, 1=True (using Integer for SQLite boolean)
    is_active = Column(Integer, default=1) # 0=Inactive, 1=Active
    subscription_plan = Column(String, default="free") # free, premium
    terms_accepted = Column(Integer, default=0) # 0=False, 1=True
    
    contacts = orm_relationship("Contact", back_populates="owner")
    wishes = orm_relationship("ScheduledWish", back_populates="owner")

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # Free, Starter, Premium
    price = Column(Integer) # In cents or smallest unit
    contact_limit = Column(Integer)
    message_limit = Column(Integer)
    ai_limit = Column(Integer)
    features = Column(Text, default="{}") # JSON flags
    is_active = Column(Integer, default=1) # 0=Inactive, 1=Active


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String, nullable=True)
    birthday = Column(DateTime, nullable=True)
    
    # New Fields
    relationship = Column(String, default="Friend") # Family, Friend, Colleague
    anniversary = Column(DateTime, nullable=True)
    custom_occasion_name = Column(String, nullable=True)
    custom_occasion_date = Column(DateTime, nullable=True)
    gender = Column(String, nullable=True) # Male, Female, Other
    social_links = Column(Text, nullable=True) # JSON string
    notes = Column(Text, nullable=True)
    tags = Column(String, nullable=True) # JSON list or comma-separated
    
    user_id = Column(Integer, ForeignKey("users.id"))
    
    owner = orm_relationship("User", back_populates="contacts")

class ScheduledWish(Base):
    __tablename__ = "scheduled_wishes"

    id = Column(Integer, primary_key=True, index=True)
    recipient_name = Column(String, index=True)
    recipient_email = Column(String, nullable=True)
    occasion = Column(String)
    tone = Column(String)
    extra_details = Column(Text, nullable=True)
    scheduled_time = Column(DateTime)
    status = Column(String, default="pending") # pending, sent, failed
    generated_wish = Column(Text, nullable=True)
    platform = Column(String, default="email") # email, telegram, whatsapp
    phone_number = Column(String, nullable=True)
    telegram_chat_id = Column(String, nullable=True)
    is_recurring = Column(Integer, default=0) # 0=False, 1=True
    telegram_chat_id = Column(String, nullable=True)
    is_recurring = Column(Integer, default=0) # 0=False, 1=True
    
    # Event Creation Fields
    event_name = Column(String, nullable=True)
    event_type = Column(String, default="Custom Event") # Birthday, Anniversary, Festival, Custom Event
    reminder_days_before = Column(Integer, default=0) # 0, 1, 2
    auto_send = Column(Integer, default=1) # 0=Manual Approval, 1=Auto Send
    
    # Message & Template Fields
    media_url = Column(String, nullable=True) # URL to uploaded image/video
    template_id = Column(String, nullable=True) # ID of selected template
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    owner = orm_relationship("User", back_populates="wishes")
