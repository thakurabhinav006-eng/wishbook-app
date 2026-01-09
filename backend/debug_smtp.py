import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
import smtplib

def test_smtp():
    print(f"SMTP Config:")
    print(f"Host: {settings.SMTP_HOST}")
    print(f"Port: {settings.SMTP_PORT}")
    print(f"User: {'*' * 5 if settings.SMTP_USER else 'NOT SET'}")
    print(f"Pass: {'*' * 5 if settings.SMTP_PASSWORD else 'NOT SET'}")

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("\nERROR: SMTP Credentials missing in settings.")
        return

    try:
        print(f"\nConnecting to {settings.SMTP_HOST}:{settings.SMTP_PORT}...")
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        print("Logging in...")
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        print("SUCCESS: SMTP Login successful!")
        server.quit()
    except Exception as e:
        print(f"\nFAILURE: Could not connect/login to SMTP server.\nError: {e}")

if __name__ == "__main__":
    test_smtp()
