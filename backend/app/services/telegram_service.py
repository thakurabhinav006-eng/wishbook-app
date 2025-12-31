
import os
import requests
from app.core.config import settings

def send_telegram_message(chat_id: str, text: str):
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        # Mock/Debug mode
        print(f"[MOCK] Sending Telegram to {chat_id}: {text}")
        return True

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text
    }
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print(f"Telegram sent to {chat_id}")
        return True
    except Exception as e:
        print(f"Failed to send Telegram: {e}")
        raise e
