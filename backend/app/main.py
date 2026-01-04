from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.db import models
from app.db.database import engine
from app.services.scheduler import scheduler # Changed from start_scheduler to scheduler object
import contextlib # Added import for contextlib
from .core.firebase import init_firebase # Added import for init_firebase

models.Base.metadata.create_all(bind=engine)

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        scheduler.start()
        init_firebase() # Initialize Firebase
    except Exception as e:
        print(f"Warning: Startup failed: {e}")
    yield
    # Shutdown
    try:
        scheduler.shutdown()
    except Exception as e:
        print(f"Warning: Shutdown failed: {e}")

app = FastAPI(title="AI Wishing Tool API", version="1.0.0", lifespan=lifespan) # Added lifespan to FastAPI app

# Mount static files
# CORS Configuration
# Use Standard CORSMiddleware with Regex for Vercel Previews
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://wishbook-frontend.*\.vercel\.app", # Matches any Vercel Preview
    allow_origins=["http://localhost:3000"], # Localhost fallback
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(endpoints.router, prefix="/api")

@app.get("/health")
async def health_check():
    try:
        from sqlalchemy import text, inspect
        from sqlalchemy.orm import Session
        from app.db.models import User
        from app.auth import get_password_hash
        
        # Attempt to connect to the database
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        admin_status = "unknown"
        
        # Bootstrap Admin User
        with engine.connect() as connection:
            # We need a session for ORM operations, but for quick hack we can use the engine/connection 
            # or better, use the SessionLocal
            from app.db.database import SessionLocal
            db = SessionLocal()
            try:
                user = db.query(User).filter(User.email == "admin@admin.com").first()
                if not user:
                    print("Creating Admin User...")
                    new_user = User(
                        email="admin@admin.com",
                        password_hash=get_password_hash("password123"),
                        full_name="Admin User",
                        role="admin",
                        subscription_plan="premium",
                        is_active=1,
                        terms_accepted=1
                    )
                    db.add(new_user)
                    db.commit()
                    admin_status = "created"
                else:
                    admin_status = "exists"
            except Exception as e:
                print(f"Admin Bootstrap Error: {e}")
                admin_status = f"error: {str(e)}"
            finally:
                db.close()

        return {
            "status": "ok", 
            "database": "connected", 
            "tables": tables,
            "admin_user": admin_status
        }
    except Exception as e:
        print(f"Health Check DB Error: {e}")
        return {"status": "error", "database": "disconnected", "detail": str(e)}

@app.get("/api/seed-plans")
async def seed_plans_endpoint():
    try:
        from app.db.database import SessionLocal
        from app.db.models import SubscriptionPlan
        import json
        
        db = SessionLocal()
        try:
            # Check if plans exist
            existing_plans = db.query(SubscriptionPlan).count()
            if existing_plans > 0:
                return {"status": "skipped", "message": "Plans already exist"}

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
            return {"status": "success", "message": "Successfully seeded 3 plans"}
            
        except Exception as e:
            db.rollback()
            return {"status": "error", "detail": str(e)}
        finally:
            db.close()
    except Exception as e:
        return {"status": "error", "detail": str(e)}
