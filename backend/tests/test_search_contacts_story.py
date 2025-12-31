import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def get_auth_headers_with_data():
    email = f"search_test_{uuid.uuid4()}@example.com"
    password = "StrongPassword123!"
    client.post("/api/register", json={
        "email": email, "password": password, "full_name": "Searcher", "terms_accepted": 1
    })
    response = client.post("/api/token", data={"username": email, "password": password})
    if response.status_code != 200:
        raise Exception(f"Login failed: {response.json()}")
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Seed Data
    contacts = [
        {"name": "Alice Smith", "email": "alice@test.com", "relationship": "Friend"},
        {"name": "Bob Jones", "email": "bob@test.com", "relationship": "Colleague"},
        {"name": "Charlie Brown", "email": "charlie@gmail.com", "relationship": "Friend"},
        {"name": "David Smith", "email": "david@yahoo.com", "relationship": "Family"},
    ]
    for c in contacts:
        client.post("/api/contacts", json=c, headers=headers)
        
    return headers

# Test Case 1: Search by Name (AC 1)
def test_search_by_name():
    headers = get_auth_headers_with_data()
    # Search for "Smith" -> Should get Alice and David
    res = client.get("/api/contacts?search=Smith", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    names = [c["name"] for c in data]
    assert "Alice Smith" in names
    assert "David Smith" in names

# Test Case 2: Filter by Relationship (AC 2)
def test_filter_by_relationship():
    headers = get_auth_headers_with_data()
    # Filter "Friend" -> Alice and Charlie
    res = client.get("/api/contacts?relationship=Friend", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    for c in data:
        assert c["relationship"] == "Friend"

# Test Case 3: Search by Email (AC 1)
def test_search_by_email():
    headers = get_auth_headers_with_data()
    # Search "gmail" -> Charlie
    res = client.get("/api/contacts?search=gmail", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["name"] == "Charlie Brown"

# Test Case 4: Combined Search and Filter (AC 2)
def test_combined_search_filter():
    headers = get_auth_headers_with_data()
    # Search "Smith" AND Relationship "Friend" -> Alice only (David is Family)
    res = client.get("/api/contacts?search=Smith&relationship=Friend", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["name"] == "Alice Smith"

# Test Case 5: Clear Filters / No Params (AC 3)
def test_clear_filters():
    headers = get_auth_headers_with_data()
    # No params -> All 4
    res = client.get("/api/contacts", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 4
