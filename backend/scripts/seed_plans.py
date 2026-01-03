import sys
import os
import json

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.db.models import SubscriptionPlan

def seed_plans():
    db = SessionLocal()
    try:
        # Check if plans exist
        existing_plans = db.query(SubscriptionPlan).count()
        if existing_plans > 0:
            print("Plans already exist. Skipping seed.")
            return

        print("Seeding default subscription plans...")
        
        plans = [
             {
                "name": "Free",
                "price": 0,
                "contact_limit": 5,
                "message_limit": 5,
                "ai_limit": 5,
                "features": json.dumps(["Basic Templates", "5 Contacts", "5 AI Wishes/Month"])
            },
            {
                "name": "Starter",
                "price": 499, # $4.99
                "contact_limit": 50,
                "message_limit": 50,
                "ai_limit": 50,
                "features": json.dumps(["Premium Templates", "50 Contacts", "50 AI Wishes/Month", "Email Support"])
            },
            {
                "name": "Premium",
                "price": 999, # $9.99
                "contact_limit": 999999,
                "message_limit": 999999,
                "ai_limit": 999999,
                "features": json.dumps(["All Templates", "Unlimited Contacts", "Unlimited AI Wishes", "Priority Support", "Early Access"])
            }
        ]

        for plan_data in plans:
            plan = SubscriptionPlan(**plan_data)
            db.add(plan)
        
        db.commit()
        print("Successfully seeded 3 plans.")
        
    except Exception as e:
        print(f"Error seeding plans: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_plans()
