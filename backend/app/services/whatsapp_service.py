
import os
from twilio.rest import Client
from app.core.config import settings

def send_whatsapp_message(to_number: str, text: str):
    sid = settings.TWILIO_ACCOUNT_SID
    token = settings.TWILIO_AUTH_TOKEN
    from_number = settings.TWILIO_FROM_WHATSPP

    if not sid or not token:
        # Mock/Debug mode
        print(f"[MOCK] Sending WhatsApp to {to_number}: {text}")
        return True

    try:
        client = Client(sid, token)
        # Ensure numbers have whatsapp: prefix
        if not to_number.startswith("whatsapp:"):
            to_number = f"whatsapp:{to_number}"
        
        message = client.messages.create(
            from_=from_number,
            body=text,
            to=to_number
        )
        print(f"WhatsApp sent to {to_number}. SID: {message.sid}")
        return True
    except Exception as e:
        print(f"Failed to send WhatsApp: {e}")
        raise e
