from app.db.database import SessionLocal
from app.db import models
import json

db = SessionLocal()

def seed_plans():
    print("Seeding plans...")
    
    # Starter Plan
    starter = db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.name == "Starter").first()
    if not starter:
        starter = models.SubscriptionPlan(
            name="Starter",
            price=999, # $9.99
            contact_limit=50,
            message_limit=100,
            ai_limit=50,
            features=json.dumps({"whatsapp_enabled": True, "email_enabled": True, "ai_enabled": True}),
            is_active=1
        )
        db.add(starter)
        print("created Starter")

    # Premium Plan
    premium = db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.name == "Premium").first()
    if not premium:
        premium = models.SubscriptionPlan(
            name="Premium",
            price=2999, # $29.99
            contact_limit=500,
            message_limit=1000,
            ai_limit=500,
            features=json.dumps({"whatsapp_enabled": True, "email_enabled": True, "ai_enabled": True, "bulk_import_enabled": True}),
            is_active=1
        )
        db.add(premium)
        print("created Premium")
    
    db.commit()
    print("Plans seeded!")

if __name__ == "__main__":
    seed_plans()
