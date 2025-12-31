import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def generate_email():
    return f"story_1641_{uuid.uuid4()}@example.com"

# Test Case 1: Successful Signup
# Maps to AC 4 & 5: User account is created, confirmation/success response shown.
def test_signup_success():
    email = generate_email()
    payload = {
        "email": email,
        "password": "StrongPassword123!",
        "full_name": "New User",
        "mobile_number": "1234567890",
        "terms_accepted": 1
    }
    response = client.post("/api/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

# Test Case 2: Signup with Missing Mandatory Field (Email)
# Maps to AC 3: User cannot submit with missing mandatory fields.
def test_signup_missing_email():
    payload = {
        "password": "StrongPassword123!",
        "full_name": "No Email User"
    }
    response = client.post("/api/register", json=payload)
    assert response.status_code == 422  # Validation Error

# Test Case 3: Signup with Missing Mandatory Field (Password)
# Maps to AC 3: User cannot submit with missing mandatory fields.
def test_signup_missing_password():
    email = generate_email()
    payload = {
        "email": email,
        "full_name": "No Pass User"
    }
    response = client.post("/api/register", json=payload)
    assert response.status_code == 422  # Validation Error

# Test Case 4: Signup with Invalid Email Format
# Maps to AC 2: Email format is validated.
def test_signup_invalid_email_format():
    payload = {
        "email": "not-an-email",
        "password": "StrongPassword123!",
        "full_name": "Invalid Email User"
    }
    response = client.post("/api/register", json=payload)
    assert response.status_code == 422  # Should be 422 or 400 depending on Pydantic

# Test Case 5: Signup with Weak Password (Time short)
# Maps to AC 2: Password strength validation.
def test_signup_short_password():
    email = generate_email()
    payload = {
        "email": email,
        "password": "123", # Too short
        "full_name": "Weak Pass User"
    }
    response = client.post("/api/register", json=payload)
    # Assuming backend has min length validation. 
    # Previous tests showed 422 for short password check.
    assert response.status_code == 422
