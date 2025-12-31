import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid
from app.db import models
from app.db.database import SessionLocal

client = TestClient(app)

def create_user(email, password):
    client.post("/api/register", json={
        "email": email, 
        "password": password, 
        "full_name": "Reset Test User",
        "terms_accepted": 1
    })

def get_reset_token(email):
    # Helper to fetch token from DB directly since email is mocked
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.email == email).first()
    token = user.reset_token
    db.close()
    return token

# Test Case 1: Request Password Reset (Registered Email)
# AC 2: Reset email is sent (simulated by success response)
def test_request_reset_success():
    email = f"reset_valid_{uuid.uuid4()}@example.com"
    create_user(email, "OldPassword123!")
    
    response = client.post("/api/auth/forgot-password", json={"email": email})
    
    assert response.status_code == 200
    assert response.json()["message"] == "If account exists, reset link sent"

# Test Case 2: Request Password Reset (Unregistered Email)
# Security check: Should not reveal user does not exist
def test_request_reset_unregistered():
    email = f"unknown_{uuid.uuid4()}@example.com"
    
    response = client.post("/api/auth/forgot-password", json={"email": email})
    
    assert response.status_code == 200
    assert response.json()["message"] == "If account exists, reset link sent"

# Test Case 3: Reset Password Successfully
# AC 4: User can set a new password successfully.
def test_reset_password_success():
    email = f"reset_process_{uuid.uuid4()}@example.com"
    old_pass = "OldPass1!"
    new_pass = "NewStrongPass99!"
    create_user(email, old_pass)
    
    # Trigger reset to generate token
    client.post("/api/auth/forgot-password", json={"email": email})
    token = get_reset_token(email)
    assert token is not None
    
    # Reset Password
    response = client.post("/api/auth/reset-password", json={
        "token": token,
        "new_password": new_pass
    })
    
    assert response.status_code == 200
    assert response.json()["message"] == "Password reset successfully"
    
    # Verify Login with New Password
    login_response = client.post("/api/token", data={
        "username": email,
        "password": new_pass
    })
    assert login_response.status_code == 200

# Test Case 4: Reset Password with Invalid Token
# AC 3: Implicitly covers token validation
def test_reset_password_invalid_token():
    response = client.post("/api/auth/reset-password", json={
        "token": "invalid-token-uuid",
        "new_password": "NewPass"
    })
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid or expired token"

# Test Case 5: Login with Old Password after Reset
# AC 4: Old password should no longer work
def test_login_old_password_fail():
    email = f"no_old_login_{uuid.uuid4()}@example.com"
    old_pass = "OldPass1!"
    new_pass = "NewPass2!"
    create_user(email, old_pass)
    
    client.post("/api/auth/forgot-password", json={"email": email})
    token = get_reset_token(email)
    
    client.post("/api/auth/reset-password", json={
        "token": token,
        "new_password": new_pass
    })
    
    # Try login with old password
    response = client.post("/api/token", data={
        "username": email,
        "password": old_pass
    })
    
    assert response.status_code == 401
