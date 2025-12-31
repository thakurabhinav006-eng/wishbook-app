
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import ScheduledWish
from app.services.llm import generate_wish_text
from datetime import datetime, timedelta
import asyncio

scheduler = BackgroundScheduler(job_defaults={'misfire_grace_time': 15*60})

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from app.services.email_templates import create_email_message
from app.services.email_templates import create_email_message
# from app.services.telegram_service import send_telegram_message
# from app.services.whatsapp_service import send_whatsapp_message

def send_email(to_email: str, subject: str, body: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"Skipping email to {to_email} (SMTP credentials missing)")
        return

    try:
        # The original send_email function is no longer used for wish sending,
        # but kept for general purpose if needed elsewhere.
        # The new logic for sending wishes is directly in process_scheduled_wish.
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def process_scheduled_wish(wish_id: int):
    db: Session = SessionLocal()
    wish = None # Initialize wish to None
    try:
        wish = db.query(ScheduledWish).filter(ScheduledWish.id == wish_id).first()
        if not wish or wish.status != "pending":
            return

        print(f"Processing scheduled wish for {wish.recipient_name}...")
        
        # Create a mock request object for the generator
        class MockRequest:
            def __init__(self, occasion, recipient_name, tone, extra_details, length="short"):
                self.occasion = occasion
                self.recipient_name = recipient_name
                self.tone = tone
                self.extra_details = extra_details
                self.length = length

        req = MockRequest(wish.occasion, wish.recipient_name, wish.tone, wish.extra_details)
        
        # Run async generation in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        generated_text = loop.run_until_complete(generate_wish_text(req))
        loop.close()

        wish.generated_wish = generated_text
        wish.status = "sent"
        
        
        # Route based on platform
        # if wish.platform == "telegram" and wish.telegram_chat_id:
        #     send_telegram_message(wish.telegram_chat_id, generated_text)
            
        # elif wish.platform == "whatsapp" and wish.phone_number:
        #     send_whatsapp_message(wish.phone_number, generated_text)
            
        if wish.platform == "email" and wish.recipient_email:
            # Generate the email message (HTML + Image)
            msg = create_email_message(
                to_email=wish.recipient_email,
                occasion=wish.occasion,
                recipient_name=wish.recipient_name,
                wish_text=generated_text,
                sender_email=settings.SMTP_USER
            )

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
        db.commit()
        
        db.commit()
        
        print(f"SUCCESS: Wish generated and 'sent' to {wish.recipient_name}: \n{generated_text}")

        # --- Recursion Logic ---
        # --- Recursion Logic ---
        # 0=None, 1=Daily, 2=Weekly, 3=Monthly, 4=Yearly
        if wish.is_recurring and wish.is_recurring > 0:
            try:
                from dateutil.relativedelta import relativedelta
                original_date = wish.scheduled_time
                next_date = None

                if wish.is_recurring == 1: # Daily
                    next_date = original_date + timedelta(days=1)
                elif wish.is_recurring == 2: # Weekly
                    next_date = original_date + timedelta(weeks=1)
                elif wish.is_recurring == 3: # Monthly
                    next_date = original_date + relativedelta(months=1)
                elif wish.is_recurring == 4: # Yearly
                    next_date = original_date + relativedelta(years=1)

                if next_date:
                    print(f"Recursion: Scheduling next wish for {next_date}")
                    
                    new_wish = ScheduledWish(
                        recipient_name=wish.recipient_name,
                        recipient_email=wish.recipient_email,
                        occasion=wish.occasion,
                        tone=wish.tone,
                        extra_details=wish.extra_details,
                        scheduled_time=next_date,
                        status="pending",
                        platform=wish.platform,
                        phone_number=wish.phone_number,
                        telegram_chat_id=wish.telegram_chat_id,
                        is_recurring=wish.is_recurring, # Keep recursing
                        user_id=wish.user_id
                    )
                    db.add(new_wish)
                    db.commit()
                    db.refresh(new_wish)
                    
                    scheduler.add_job(
                        process_scheduled_wish, 
                        'date', 
                        run_date=next_date, 
                        args=[new_wish.id]
                    )
                    print(f"Created recurring wish ID: {new_wish.id}")
            except Exception as e:
                print(f"Failed to schedule recurring wish: {e}")
        # -----------------------

    except Exception as e:
        print(f"FAILED to process wish {wish_id}: {e}")
        if wish:
            wish.status = "failed"
            db.commit()
    finally:
        db.close()

def start_scheduler():
    scheduler.start()
    print("Scheduler started...")
