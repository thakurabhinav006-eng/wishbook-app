import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid
from app.db import models
from app.db.database import SessionLocal
import datetime

client = TestClient(app)

def get_auth_headers():
    email = f"stats_test_{uuid.uuid4()}@example.com"
    password = "StrongPassword123!"
    client.post("/api/register", json={
        "email": email, "password": password, "full_name": "Stat User", "terms_accepted": 1
    })
    token = client.post("/api/token", data={"username": email, "password": password}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# Test Case 1: Initial Stats (Zero) (AC 1)
def test_stats_initial_zero():
    headers = get_auth_headers()
    res = client.get("/api/dashboard/stats", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_contacts"] == 0
    assert data["messages_scheduled"] == 0
    assert data["messages_sent"] == 0
    assert data["upcoming_events"] == 0

# Test Case 2: Stats with Data (AC 1)
def test_stats_with_data():
    headers = get_auth_headers()
    
    # 1. Add 2 Contacts
    client.post("/api/contacts", json={"name": "C1", "email": "c1@test.com", "relationship": "Friend"}, headers=headers)
    client.post("/api/contacts", json={"name": "C2", "email": "c2@test.com", "relationship": "Family"}, headers=headers)
    
    # 2. Add 1 Scheduled Wish
    # Note: Need 'recipient_email' to match contact for AC logic if checked, but simple count check here
    client.post("/api/schedule", json={
        "recipient_name": "C1", "recipient_email": "c1@test.com",
        "occasion": "Bday", "tone": "Fun",
        "scheduled_time": (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat()
    }, headers=headers)
    
    # 3. Check Stats
    res = client.get("/api/dashboard/stats", headers=headers)
    data = res.json()
    assert data["total_contacts"] == 2
    assert data["messages_scheduled"] == 1
    # upcoming_events maps to messages_scheduled in current impl
    assert data["upcoming_events"] == 1 
    assert data["messages_sent"] == 0

# Test Case 3: Verify Status Change (Scheduled -> Sent)
def test_stats_status_change():
    headers = get_auth_headers()
    
    # Schedule One
    res = client.post("/api/schedule", json={
        "recipient_name": "C1", "recipient_email": "c1@test.com",
        "occasion": "Bday", "tone": "Fun",
        "scheduled_time": (datetime.datetime.utcnow() + datetime.timedelta(minutes=1)).isoformat()
    }, headers=headers)
    wish_id = res.json()["id"]
    
    # Initial Check
    stats1 = client.get("/api/dashboard/stats", headers=headers).json()
    assert stats1["messages_scheduled"] == 1
    assert stats1["messages_sent"] == 0
    
    # Simulate Sending (Update DB directly)
    db = SessionLocal()
    wish = db.query(models.ScheduledWish).filter(models.ScheduledWish.id == wish_id).first()
    wish.status = "sent"
    db.commit()
    db.close()
    
    # Final Check
    stats2 = client.get("/api/dashboard/stats", headers=headers).json()
    assert stats2["messages_scheduled"] == 0
    assert stats2["messages_sent"] == 1

# Test Case 4: Data Isolation (AC 1)
def test_stats_isolation():
    headers1 = get_auth_headers()
    headers2 = get_auth_headers() # Different user
    
    # User 1 adds contact
    client.post("/api/contacts", json={"name": "U1C1", "email": "u1@test.com", "relationship": "Friend"}, headers=headers1)
    
    # User 2 checks
    res = client.get("/api/dashboard/stats", headers=headers2)
    assert res.json()["total_contacts"] == 0
    
    # User 1 checks
    res = client.get("/api/dashboard/stats", headers=headers1)
    assert res.json()["total_contacts"] == 1

# Test Case 5: Verify Increments (AC 1)
def test_stats_increments():
    headers = get_auth_headers()
    res0 = client.get("/api/dashboard/stats", headers=headers).json()
    assert res0["total_contacts"] == 0
    
    client.post("/api/contacts", json={"name": "I1", "email": "i1@test.com", "relationship": "Friend"}, headers=headers)
    res1 = client.get("/api/dashboard/stats", headers=headers).json()
    assert res1["total_contacts"] == 1
    
    client.post("/api/contacts", json={"name": "I2", "email": "i2@test.com", "relationship": "Friend"}, headers=headers)
    res2 = client.get("/api/dashboard/stats", headers=headers).json()
    assert res2["total_contacts"] == 2
