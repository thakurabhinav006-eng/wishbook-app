import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

print(f"Testing SMTP connection to {SMTP_HOST}:{SMTP_PORT}...")
print(f"User: {SMTP_USER}")
# Mask password for logging
masked_pwd = "*" * len(str(SMTP_PASSWORD)) if SMTP_PASSWORD else "None"
print(f"Password: {masked_pwd}")

try:
    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.set_debuglevel(1)
    server.starttls()
    print("TLS started. Logging in...")
    server.login(SMTP_USER, SMTP_PASSWORD)
    print("LOGIN SUCCESSFUL!")
    server.quit()
except Exception as e:
    print(f"LOGIN FAILED: {e}")
