from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship as orm_relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user") # user, admin
    
    # Profile Fields
    full_name = Column(String, nullable=True)
    mobile_number = Column(String, nullable=True)
    timezone = Column(String, default="UTC")
    language = Column(String, default="en")
    profile_photo_url = Column(String, nullable=True)
    notification_preferences = Column(Text, default="{}") # JSON string
    is_google_user = Column(Integer, default=0) # 0=False, 1=True (using Integer for SQLite boolean)
    
    contacts = orm_relationship("Contact", back_populates="owner")
    wishes = orm_relationship("ScheduledWish", back_populates="owner")

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
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    owner = orm_relationship("User", back_populates="wishes")
