
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

# Mock Data
MOCK_GOOGLE_TOKEN = "valid_google_token_123"
MOCK_GOOGLE_USER_DATA = {
    "email": "google_test_user@example.com",
    "name": "Google Test User",
    "picture": "http://example.com/photo.jpg"
}

@pytest.fixture
def mock_google_verify():
    with patch("app.api.endpoints.verify_google_token") as mock:
        mock.return_value = MOCK_GOOGLE_USER_DATA
        yield mock

def test_google_signup_success(mock_google_verify):
    """
    Story #1642 - AC2 & AC3: Authenticate and Auto-create Profile.
    """
    response = client.post("/api/auth/google", json={"token": MOCK_GOOGLE_TOKEN})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Verify User was created in DB (via the "me" endpoint using the new token)
    token = data["access_token"]
    me_response = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == MOCK_GOOGLE_USER_DATA["email"]
    assert me_data["full_name"] == MOCK_GOOGLE_USER_DATA["name"]
    assert me_data["profile_photo_url"] == MOCK_GOOGLE_USER_DATA["picture"]

def test_google_login_existing_user(mock_google_verify):
    """
    Story #1642 - AC4: Duplicate accounts prevented (Idempotency).
    Logging in again with the same Google Creds should just return a token, not error or duplicate.
    """
    # First Login (Signup)
    client.post("/api/auth/google", json={"token": MOCK_GOOGLE_TOKEN})
    
    # Second Login
    response = client.post("/api/auth/google", json={"token": MOCK_GOOGLE_TOKEN})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_invalid_google_token():
    """
    Edge Case: Invalid Token
    """
    with patch("app.api.endpoints.verify_google_token") as mock:
        mock.return_value = None # Simulate invalid token
        response = client.post("/api/auth/google", json={"token": "invalid_token"})
        assert response.status_code == 400
        assert "Invalid Google Token" in response.json()["detail"]
