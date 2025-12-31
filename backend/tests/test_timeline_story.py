import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid
import datetime
from datetime import timedelta

client = TestClient(app)

def get_auth_headers():
    email = f"timeline_{uuid.uuid4()}@example.com"
    password = "StrongPassword123!"
    client.post("/api/register", json={
        "email": email, "password": password, "full_name": "Timeline User", "terms_accepted": 1
    })
    token = client.post("/api/token", data={"username": email, "password": password}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# Test 1: Recurring Birthday Logic
def test_timeline_recurring_birthday():
    headers = get_auth_headers()
    today = datetime.datetime.utcnow().date()
    
    # 1. Birthday TOMORROW (Should appear)
    bday_tomorrow = today + timedelta(days=1)
    # Contact born in 1990
    client.post("/api/contacts", json={
        "name": "Tomorrow Bday", 
        "email": "tm@test.com", 
        "relationship": "Friend",
        "birthday": bday_tomorrow.replace(year=1990).isoformat()
    }, headers=headers)
    
    # 2. Birthday YESTERDAY (Should assume Next Year -> Not in 30 days list unless next year is close? No, > 30 days usually)
    bday_yesterday = today - timedelta(days=1)
    client.post("/api/contacts", json={
        "name": "Yesterday Bday", 
        "email": "yd@test.com", 
        "relationship": "Friend",
        "birthday": bday_yesterday.replace(year=1990).isoformat()
    }, headers=headers)
    
    res = client.get("/api/events/upcoming?days=30", headers=headers)
    assert res.status_code == 200
    events = res.json()
    
    # Check Tomorrow is present
    found_tomorrow = any(e['contact_name'] == "Tomorrow Bday" for e in events if 'contact_name' in e)
    assert found_tomorrow
    
    # Check Yesterday is ABSENT (next year is > 30 days away)
    found_yesterday = any(e['contact_name'] == "Yesterday Bday" for e in events if 'contact_name' in e)
    assert not found_yesterday

# Test 2: Scheduled Wish Integration & Sorting
def test_timeline_sorting_mixed():
    headers = get_auth_headers()
    today = datetime.datetime.utcnow()
    
    # 1. Add Wish in 2 days
    client.post("/api/schedule", json={
        "recipient_name": "Wish Recipient", "recipient_email": "w@test.com",
        "occasion": "Bday", "tone": "Fun",
        "scheduled_time": (today + timedelta(days=2)).isoformat()
    }, headers=headers)
    
    # 2. Add Contact Birthday in 1 day
    bday_1day = today + timedelta(days=1)
    client.post("/api/contacts", json={
        "name": "Contact Bday", 
        "email": "cb@test.com", 
        "relationship": "Friend",
        "birthday": bday_1day.replace(year=2000).isoformat()
    }, headers=headers)
    
    res = client.get("/api/events/upcoming", headers=headers)
    events = res.json()
    
    assert len(events) == 2
    # Verify Order: Day 1 (Contact) before Day 2 (Wish)
    assert events[0]['type'] == 'occasion'
    assert events[0]['contact_name'] == "Contact Bday"
    assert events[1]['type'] == 'scheduled_wish'

# Test 3: Custom Occasion & Anniversary
def test_timeline_other_occasions():
    headers = get_auth_headers()
    today = datetime.datetime.utcnow().date()
    
    occ_date = today + timedelta(days=5)
    
    client.post("/api/contacts", json={
        "name": "Custom Event", 
        "email": "ce@test.com", 
        "relationship": "Friend",
        "custom_occasion_name": "Graduation",
        "custom_occasion_date": occ_date.replace(year=2020).isoformat()
    }, headers=headers)
    
    res = client.get("/api/events/upcoming", headers=headers)
    events = res.json()
    
    assert len(events) == 1
    assert "Graduation" in events[0]['title']
