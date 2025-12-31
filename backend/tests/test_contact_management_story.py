import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid
from app.db import models
from app.db.database import SessionLocal
import datetime

client = TestClient(app)

def get_auth_headers():
    # Helper: Register and Login to get token
    email = f"contact_test_{uuid.uuid4()}@example.com"
    password = "Password123!"
    client.post("/api/register", json={
        "email": email, "password": password, "full_name": "Contact Tester", "terms_accepted": 1
    })
    response = client.post("/api/token", data={"username": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, email

# Test Case 1: Edit Contact (AC 1 & 2)
def test_edit_contact_success():
    headers, _ = get_auth_headers()
    # 1. Create Contact
    create_res = client.post("/api/contacts", json={
        "name": "Original Name",
        "email": "original@example.com",
        "relationship": "Friend"
    }, headers=headers)
    contact_id = create_res.json()["id"]

    # 2. Update Contact
    update_res = client.put(f"/api/contacts/{contact_id}", json={
        "name": "Updated Name",
        "email": "updated@example.com",
        "relationship": "Family",
        "notes": "Updated notes"
    }, headers=headers)
    
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["name"] == "Updated Name"
    assert updated_data["email"] == "updated@example.com"
    assert updated_data["relationship"] == "Family"

    # 3. Verify Persistence
    get_res = client.get(f"/api/contacts/{contact_id}", headers=headers)
    assert get_res.json()["name"] == "Updated Name"

# Test Case 2: Delete Contact (AC 3)
def test_delete_contact_success():
    headers, _ = get_auth_headers()
    # 1. Create
    create_res = client.post("/api/contacts", json={
        "name": "To Delete", 
        "email": "delete@example.com",
        "relationship": "Friend"
    }, headers=headers)
    contact_id = create_res.json()["id"]

    # 2. Delete
    del_res = client.delete(f"/api/contacts/{contact_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Contact deleted"

    # 3. Verify Gone
    get_res = client.get(f"/api/contacts/{contact_id}", headers=headers)
    assert get_res.status_code == 404

# Test Case 3: Delete Removes Linked Events (AC 4)
def test_delete_contact_removes_linked_wishes():
    headers, user_email = get_auth_headers()
    contact_email = "linked@example.com"
    
    # 1. Create Contact
    create_res = client.post("/api/contacts", json={
        "name": "Linked Contact", 
        "email": contact_email,
        "relationship": "Friend"
    }, headers=headers)
    contact_id = create_res.json()["id"]

    # 2. Schedule Wish for this Contact
    wish_payload = {
        "recipient_name": "Linked Contact",
        "recipient_email": contact_email,
        "occasion": "Birthday",
        "tone": "Casual",
        "scheduled_time": (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat(),
        "recurrence": "none"
    }
    wish_res = client.post("/api/schedule", json=wish_payload, headers=headers)
    wish_id = wish_res.json()["id"]

    # 3. Verify Wish Exists
    db = SessionLocal()
    wish = db.query(models.ScheduledWish).filter(models.ScheduledWish.id == wish_id).first()
    assert wish is not None
    db.close()

    # 4. Delete Contact
    client.delete(f"/api/contacts/{contact_id}", headers=headers)

    # 5. Verify Wish is Deleted
    db = SessionLocal()
    wish_check = db.query(models.ScheduledWish).filter(models.ScheduledWish.id == wish_id).first()
    db.close()
    assert wish_check is None

# Test Case 4: Edit Non-Existent Contact
def test_edit_contact_not_found():
    headers, _ = get_auth_headers()
    # Payload must be valid to pass Pydantic check, then fail on ID check
    valid_payload = {
        "name": "Ghost",
        "email": "ghost@example.com",
        "relationship": "Friend"
    }
    res = client.put(f"/api/contacts/99999", json=valid_payload, headers=headers)
    assert res.status_code == 404
    assert res.json()["detail"] == "Contact not found"

# Test Case 5: Delete Non-Existent Contact
def test_delete_contact_not_found():
    headers, _ = get_auth_headers()
    res = client.delete(f"/api/contacts/99999", headers=headers)
    assert res.status_code == 404
    assert res.json()["detail"] == "Contact not found"
