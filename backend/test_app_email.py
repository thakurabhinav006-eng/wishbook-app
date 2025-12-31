import sys
import os
# Add backend to path so we can import app modules
sys.path.append(os.getcwd())

from app.core.config import settings
from app.services.email_templates import create_email_message
import smtplib

print("Testing Application Email Logic...")
print(f"SMTP Config: {settings.SMTP_HOST}:{settings.SMTP_PORT}")
print(f"User: {settings.SMTP_USER}")

try:
    # Use the SMTP user as both sender and recipient for testing
    to_email = settings.SMTP_USER 
    
    print(f"Generating email for {to_email}...")
    msg = create_email_message(
        to_email=to_email,
        occasion="Birthday",
        recipient_name="Test User",
        wish_text="This is a test wish from the debugging script.",
        sender_email=settings.SMTP_USER
    )
    
    print("Connecting to SMTP...")
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.set_debuglevel(1)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        print("Sending message...")
        server.send_message(msg)
        print("SUCCESS: Email sent via application logic!")

except Exception as e:
    print(f"FAILURE: {e}")
    import traceback
    traceback.print_exc()
