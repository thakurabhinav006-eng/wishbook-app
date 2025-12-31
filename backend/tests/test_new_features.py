import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid
import io

client = TestClient(app)

def get_auth_token():
    email = f"test_{uuid.uuid4()}@example.com"
    password = "password123"
    # Register
    client.post("/api/register", json={"email": email, "password": password, "full_name": "Test"})
    # Login
    response = client.post("/api/token", data={"username": email, "password": password})
    return response.json()["access_token"]

def test_get_plans_authenticated():
    token = get_auth_token()
    response = client.get("/api/plans", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    # Expect at least Starter and Premium seeded
    assert len(data) >= 2
    names = [p["name"] for p in data]
    assert "Starter" in names
    assert "Premium" in names

def test_upload_media_authenticated():
    token = get_auth_token()
    file_content = b"fake image content"
    files = {"file": ("test_image.jpg", file_content, "image/jpeg")}
    response = client.post("/api/upload-media", files=files, headers={"Authorization": f"Bearer {token}"})
    
    if response.status_code != 200:
        print(f"Upload failed: {response.json()}")
        
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert "media_" in data["url"]

def test_schedule_wish_with_new_fields():
    token = get_auth_token()
    payload = {
        "recipient_name": "John Doe",
        "recipient_email": "john@example.com",
        "occasion": "Birthday",
        "tone": "Funny",
        "scheduled_time": "2025-12-31T10:00:00",
        # New API fields
        "media_url": "/uploads/test.jpg",
        "template_id": "template_123",
        "event_name": "John's Bday Party", 
        "event_type": "Personal",
        "reminder_days_before": 1,
        "auto_send": 1,
        "recurrence": "none"  # Required field
    }
    response = client.post("/api/schedule", json=payload, headers={"Authorization": f"Bearer {token}"})
    
    if response.status_code != 200:
        print(f"Schedule failed: {response.json()}")
        
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
