import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.database import SessionLocal, engine
from app.db import models
from sqlalchemy import text

def verify():
    # 1. Create tables if not exist (This simulates what main.py does)
    print("Ensuring tables exist...")
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 2. Check if table exists
        print("Checking for activity_logs table...")
        # SQLite specific check, might need adjustment for other DBs but assuming SQLite for dev
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_logs'"))
        if not result.first():
            print("ERROR: activity_logs table does not exist!")
            return

        print("Table exists.")

        # 3. Create dummy activity
        print("Creating dummy activity...")
        # Use first user
        user = db.query(models.User).first()
        if not user:
            print("No users found, creating temp user...")
            user = models.User(email="test@test.com", password_hash="hash")
            db.add(user)
            db.commit()
            db.refresh(user)
        
        from app.services.scheduler import ActivityLog # Ensure we can import it or use models.ActivityLog
        
        log = models.ActivityLog(
            user_id=user.id,
            action="verification_test",
            details="Verifying activity log functionality",
        )
        db.add(log)
        db.commit()
        print("Activity logged.")

        # 4. Query it back
        print("Querying recent activity...")
        recent = db.query(models.ActivityLog).filter(models.ActivityLog.user_id == user.id).order_by(models.ActivityLog.created_at.desc()).first()
        
        if recent and recent.action == "verification_test":
            print(f"SUCCESS: Found activity log: {recent.details}")
        else:
            print("ERROR: Could not find the logged activity.")

    except Exception as e:
        print(f"FAILED: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify()
