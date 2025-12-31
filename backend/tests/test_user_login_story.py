import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def create_user(email, password):
    # Helper to create a user for login tests
    client.post("/api/register", json={
        "email": email, 
        "password": password, 
        "full_name": "Login Test User",
        "terms_accepted": 1
    })

# Test Case 1: Successful Login
# AC: User enters valid credentials and receives an access token.
def test_login_success():
    email = f"login_success_{uuid.uuid4()}@example.com"
    password = "StrongPassword123!"
    create_user(email, password)
    
    response = client.post("/api/token", data={
        "username": email,
        "password": password
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

# Test Case 2: Login with Unregistered Email
# AC: System validates that the email exists.
def test_login_unregistered_email():
    email = f"unregistered_{uuid.uuid4()}@example.com"
    # User NOT created
    
    response = client.post("/api/token", data={
        "username": email,
        "password": "AnyPassword"
    })
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

# Test Case 3: Login with Invalid Password
# AC: System validates that the password matches.
def test_login_invalid_password():
    email = f"wrong_pass_{uuid.uuid4()}@example.com"
    password = "CorrectPassword123!"
    create_user(email, password)
    
    response = client.post("/api/token", data={
        "username": email,
        "password": "WrongPassword!"
    })
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

# Test Case 4: Login with Missing Username (Email)
# AC: Mandatory fields check.
def test_login_missing_username():
    response = client.post("/api/token", data={
        "password": "SomePassword"
    })
    # OAuth2PasswordRequestForm requires username, returns 422 if missing
    assert response.status_code == 422

# Test Case 5: Login with Missing Password
# AC: Mandatory fields check.
def test_login_missing_password():
    response = client.post("/api/token", data={
        "username": "some@email.com"
    })
    # OAuth2PasswordRequestForm requires password, returns 422 if missing
    assert response.status_code == 422
