from app.db.database import SessionLocal
from app.db import models
from app.auth import get_password_hash

db = SessionLocal()

def create_test_user():
    email = "test_login@example.com"
    password = "password123"
    
    # Check if exists
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        db.delete(user)
        db.commit()
    
    # Create
    new_user = models.User(
        email=email,
        password_hash=get_password_hash(password),
        full_name="Test Login User",
        is_active=1,
        subscription_plan="free",
        terms_accepted=1
    )
    db.add(new_user)
    db.commit()
    print(f"User created: {email} / {password}")

if __name__ == "__main__":
    create_test_user()
