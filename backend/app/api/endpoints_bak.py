
from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from cachetools import TTLCache
import csv
import io
import json
from pydantic import BaseModel
from typing import Optional, List
import uuid
import shutil
import os
from app.services.llm import generate_wish_text, generate_wish_from_words
from app.db.database import get_db
from app.db.models import ScheduledWish, Contact, User
from app.services.scheduler import scheduler, process_scheduled_wish
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordRequestForm
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user, get_current_admin, verify_google_token

router = APIRouter()

# Caching
stats_cache = TTLCache(maxsize=1, ttl=300)
history_cache = TTLCache(maxsize=100, ttl=30)

# --- Admin Endpoints ---

@router.get("/admin/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    if "stats" in stats_cache:
        return stats_cache["stats"]
    user_count = db.query(User).count()
    wish_count = db.query(ScheduledWish).count()
    
    # Calculate wishes sent today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    wishes_today = db.query(ScheduledWish).filter(ScheduledWish.created_at >= today_start).count()
    
    # Mock data for chart
    recent_signups = [
        {"name": "New User", "email": "user@example.com", "role": "user", "date": "2025-12-11"}
    ]
    result = {
        "total_users": user_count,
        "wishes_sent": wish_count,
        "wishes_today": wishes_today,
        "system_status": "Active",
        "recent_signups": recent_signups
    }
    stats_cache["stats"] = result
    return result

@router.get("/admin/users")
async def get_admin_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    users = db.query(User).all()
    # Mask password hashes
    return [{"id": u.id, "email": u.email, "role": u.role} for u in users]

@router.get("/admin/users/{user_id}")
async def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    wishes_count = db.query(ScheduledWish).filter(ScheduledWish.user_id == user_id).count()
    contacts_count = db.query(Contact).filter(Contact.user_id == user_id).count()
    
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "wishes_count": wishes_count,
        "contacts_count": contacts_count
    }

@router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == 'admin':
        raise HTTPException(status_code=400, detail="Cannot delete admin")
        
    # Delete related data first (cascade should handle, but explicit is safer)
    db.query(ScheduledWish).filter(ScheduledWish.user_id == user_id).delete()
    db.query(Contact).filter(Contact.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.post("/admin/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    temp_password = "temp1234"
    user.password_hash = get_password_hash(temp_password)
    db.commit()
    return {"message": f"Password reset to '{temp_password}'"}

@router.get("/admin/feed")
async def get_admin_feed(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # Get last 50 wishes, join with User to show who sent it
    wishes = db.query(ScheduledWish).order_by(ScheduledWish.created_at.desc()).limit(50).all()
    # Enrich with user email
    result = []
    for w in wishes:
        user = db.query(User).filter(User.id == w.user_id).first()
        user_email = user.email if user else "Unknown"
        result.append({
            "id": w.id,
            "recipient": w.recipient_name,
            "occasion": w.occasion,
            "platform": w.platform,
            "status": w.status,
            "generated_wish": w.generated_wish,
            "sender": user_email,
            "created_at": w.created_at
        })
    return result

@router.get("/admin/analytics")
async def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    total_email = db.query(ScheduledWish).filter(ScheduledWish.platform == "email").count()
    total_whatsapp = db.query(ScheduledWish).filter(ScheduledWish.platform == "whatsapp").count()
    total_telegram = db.query(ScheduledWish).filter(ScheduledWish.platform == "telegram").count()
    
    # Daily wishes for the last 7 days
    today = datetime.now()
    daily_wishes = []
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        count = db.query(ScheduledWish).filter(
            ScheduledWish.created_at >= start_of_day,
            ScheduledWish.created_at <= end_of_day
        ).count()
        
        daily_wishes.append({
            "date": date.strftime("%a"), # Mon, Tue, etc.
            "full_date": date.strftime("%Y-%m-%d"),
            "count": count
        })

    return {
        "email": total_email,
        "whatsapp": total_whatsapp,
        "telegram": total_telegram,
        "daily_wishes": daily_wishes
    }


# --- Auth Models ---
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Wish Models ---
class WishRequest(BaseModel):
    occasion: str
    recipient_name: str
    tone: str = "warm"
    extra_details: Optional[str] = None
    length: str = "short"

class ScheduleRequest(WishRequest):
    scheduled_time: datetime # ISO format
    recipient_email: Optional[str] = None
    platform: str = "email" # email, telegram, whatsapp
    phone_number: Optional[str] = None
    telegram_chat_id: Optional[str] = None

class ContactBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    birthday: Optional[datetime] = None
    relationship: Optional[str] = "Friend"
    anniversary: Optional[datetime] = None
    social_links: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
    class Config:
        from_attributes = True

class WordListRequest(BaseModel):
    words: List[str]
    mode: str = "creative" # creative, template, synonym

# --- Auth Endpoints ---

@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email, 
        password_hash=hashed_password,
        full_name=user.full_name # Save full name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

class GoogleLogin(BaseModel):
    token: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/auth/google", response_model=Token)
async def google_login(login_data: GoogleLogin, db: Session = Depends(get_db)):
    # 1. Verify Google Token
    idinfo = verify_google_token(login_data.token)
    if not idinfo:
        raise HTTPException(status_code=400, detail="Invalid Google Token")
    
    email = idinfo['email']
    name = idinfo.get('name', '')
    picture = idinfo.get('picture', '')
    
    # 2. Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Create new user
        # We set an empty password hash or a random one since they use Google
        new_user = User(
            email=email,
            full_name=name,
            profile_photo_url=picture,
            is_google_user=1,
            password_hash=get_password_hash(f"google_{uuid.uuid4()}") # Random password
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user
    else:
        # Update profile if missing
        if not user.full_name: user.full_name = name
        if not user.profile_photo_url: user.profile_photo_url = picture
        if not user.is_google_user: user.is_google_user = 1
        db.commit()
    
    # 3. Generate App Token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    notification_preferences: Optional[str] = None

@router.put("/users/me")
async def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_user = db.query(User).filter(User.id == current_user.id).first()
    
    if user_update.full_name: db_user.full_name = user_update.full_name
    if user_update.mobile_number: db_user.mobile_number = user_update.mobile_number
    if user_update.timezone: db_user.timezone = user_update.timezone
    if user_update.language: db_user.language = user_update.language
    if user_update.notification_preferences: db_user.notification_preferences = user_update.notification_preferences
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/users/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    valid_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Create unique filename
    ext = file.filename.split(".")[-1]
    filename = f"{current_user.id}_{uuid.uuid4()}.{ext}"
    file_path = f"uploads/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Update DB
    db_user = db.query(User).filter(User.id == current_user.id).first()
    # In prod, this would be a full URL
    db_user.profile_photo_url = f"/uploads/{filename}"
    db.commit()
    
    return {"url": db_user.profile_photo_url}

@router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal user existence
        return {"message": "If account exists, reset link sent"}
    
    # Mock sending email
    reset_token = f"reset_{uuid.uuid4()}"
    # In real app, store this token in DB with expiration
    print(f"--- MOCK EMAIL ---")
    print(f"To: {request.email}")
    print(f"Subject: Password Reset")
    print(f"Token: {reset_token}")
    print(f"------------------")
    
    return {"message": "If account exists, reset link sent", "mock_token": reset_token}

@router.post("/auth/reset-password")
async def reset_password(
    request: ResetPasswordRequest, 
    db: Session = Depends(get_db)
):
    # Mock verification
    if not request.token.startswith("reset_"):
        raise HTTPException(status_code=400, detail="Invalid token")
        
    # In real app, find user by token. Here we assume token is passed to identify user in a real implementation
    # For this mock, we'll just return success to simulate the flow
    return {"message": "Password reset successfully"}

@router.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "full_name": current_user.full_name,
        "mobile_number": current_user.mobile_number,
        "timezone": current_user.timezone,
        "language": current_user.language,
        "profile_photo_url": current_user.profile_photo_url,
        "notification_preferences": current_user.notification_preferences
    }

# --- Generation Endpoints (Public) ---

@router.post("/generate")
async def generate_wish(request: WishRequest):
    try:
        wish = await generate_wish_text(request)
        return {"wish": wish}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/wish-from-words")
async def wish_from_words(request: WordListRequest):
    try:
        results = await generate_wish_from_words(request.words, request.mode)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Protected Endpoints ---

@router.post("/schedule")
async def schedule_wish(
    request: ScheduleRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        new_wish = ScheduledWish(
            recipient_name=request.recipient_name,
            recipient_email=request.recipient_email,
            occasion=request.occasion,
            tone=request.tone,
            extra_details=request.extra_details,
            scheduled_time=request.scheduled_time,
            status="pending",
            platform=request.platform,
            phone_number=request.phone_number,
            telegram_chat_id=request.telegram_chat_id,
            user_id=current_user.id # Link to user
        )
        db.add(new_wish)
        db.commit()
        db.refresh(new_wish)

        # Schedule the job
        scheduler.add_job(
            process_scheduled_wish, 
            'date', 
            run_date=request.scheduled_time, 
            args=[new_wish.id]
        )

        return {"message": "Wish scheduled successfully", "id": new_wish.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheduled-wishes")
async def get_scheduled_wishes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only return wishes belonging to current user
    wishes = db.query(ScheduledWish).filter(ScheduledWish.user_id == current_user.id).all()
    return wishes

@router.post("/generate-user-wish")
async def generate_user_wish(
    request: WishRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Generate text
        wish_text = await generate_wish_text(request)
        
        # Save to DB
        new_wish = ScheduledWish(
            recipient_name=request.recipient_name,
            occasion=request.occasion,
            tone=request.tone,
            extra_details=request.extra_details,
            scheduled_time=datetime.utcnow(), # Now
            status="generated",
            generated_wish=wish_text,
            platform="web", # generated on web
            user_id=current_user.id
        )
        db.add(new_wish)
        db.commit()
        db.refresh(new_wish)
        
        return {"wish": wish_text, "id": new_wish.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/wishes/history")
async def get_wish_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id in history_cache:
        return history_cache[current_user.id]
    results = db.query(ScheduledWish).filter(
        ScheduledWish.user_id == current_user.id
    ).order_by(ScheduledWish.created_at.desc()).all()
    history_cache[current_user.id] = results
    return results

class ImagePromptRequest(BaseModel):
    wish: str

from app.services.image_prompts import generate_visual_description
import urllib.parse

@router.post("/generate-image-prompt")
async def generate_image_prompt_endpoint(req: ImagePromptRequest):
    try:
        # 1. Get visual description from LLM
        visual_prompt = await generate_visual_description(req.wish)
        
        # 2. Encode for URL
        encoded_prompt = urllib.parse.quote(visual_prompt)
        
        # 3. Construct Pollinations URL (High Quality settings)
        # width=1080, height=720, nologo=true, enhance=true
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1080&height=720&nologo=true&enhance=true"
        
        return {
            "prompt": visual_prompt,
            "url": image_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Contacts Endpoints

@router.post("/contacts", response_model=ContactResponse)
async def create_contact(
    contact: ContactCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_contact = Contact(**contact.dict(), user_id=current_user.id) # Link to user
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@router.get("/contacts", response_model=List[ContactResponse])
async def get_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only return contacts belonging to current user
    return db.query(Contact).filter(Contact.user_id == current_user.id).all()

@router.delete("/contacts/{contact_id}")
async def delete_contact(
    contact_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = db.query(Contact).filter(
        Contact.id == contact_id, 
        Contact.user_id == current_user.id # Ensure ownership
    ).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(contact)
    db.commit()
    return {"message": "Contact deleted"}

@router.get("/contacts/{contact_id}", response_model=ContactResponse)
async def get_contact_details(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.post("/contacts/import")
async def import_contacts(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        contents = await file.read()
        decoded = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded))
        
        imported_count = 0
        errors = []
        
        for row in csv_reader:
            # Basic validation
            if not row.get('name') or not row.get('email'):
                continue
                
            # Check dupes
            exists = db.query(Contact).filter(
                Contact.email == row['email'], 
                Contact.user_id == current_user.id
            ).first()
            if exists:
                continue

            try:
                # Parse dates if present
                bday = datetime.fromisoformat(row['birthday']) if row.get('birthday') else None
                anniv = datetime.fromisoformat(row['anniversary']) if row.get('anniversary') else None
                
                new_contact = Contact(
                    name=row['name'],
                    email=row['email'],
                    phone=row.get('phone'),
                    birthday=bday,
                    relationship=row.get('relationship', 'Friend'),
                    anniversary=anniv,
                    notes=row.get('notes'),
                    tags=row.get('tags'),
                    social_links=row.get('social_links'),
                    user_id=current_user.id
                )
                db.add(new_contact)
                imported_count += 1
            except Exception as e:
                errors.append(f"Row {row.get('name')}: {str(e)}")
        
        db.commit()
        return {"imported": imported_count, "errors": errors}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

@router.post("/users/change-password")
async def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(request.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
        
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}
