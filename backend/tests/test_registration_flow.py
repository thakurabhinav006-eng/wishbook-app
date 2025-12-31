import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def generate_unique_email():
    return f"test_user_{uuid.uuid4()}@example.com"

def test_register_success():
    email = generate_unique_email()
    password = "securePassword123"
    payload = {
        "email": email,
        "password": password,
        "full_name": "Test User"
    }
    response = client.post("/api/register", json=payload)
    if response.status_code != 200:
        print(f"Registration failed: {response.json()}")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_register_duplicate_email():
    # First registration
    email = generate_unique_email()
    password = "securePassword123"
    payload = {
        "email": email,
        "password": password,
        "full_name": "Test User"
    }
    response1 = client.post("/api/register", json=payload)
    assert response1.status_code == 200

    # Second registration (same email)
    response2 = client.post("/api/register", json=payload)
    assert response2.status_code == 400
    assert response2.json()["detail"] == "Email already registered"

def test_register_invalid_email():
    email = "invalid-email"
    password = "securePassword123"
    payload = {
        "email": email,
        "password": password,
        "full_name": "Test User"
    }
    response = client.post("/api/register", json=payload)
    assert response.status_code == 422 # Validation error

def test_register_short_password():
    email = generate_unique_email()
    password = "123"
    payload = {
        "email": email,
        "password": password,
        "full_name": "Test User"
    }
    response = client.post("/api/register", json=payload)
    assert response.status_code == 422 # Validation error
