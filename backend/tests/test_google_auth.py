import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

def test_google_login_new_user():
    # Mock verify_google_token to return valid info
    mock_idinfo = {
        'email': 'newuser@google.com',
        'name': 'New User',
        'picture': 'http://example.com/pic.jpg'
    }
    
    with patch('app.api.endpoints.verify_google_token') as mock_verify:
        mock_verify.return_value = mock_idinfo
        
        response = client.post("/api/auth/google", json={"token": "valid_token"})
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

def test_google_login_existing_user():
    # Mock verify_google_token to return same email
    mock_idinfo = {
        'email': 'newuser@google.com',
        'name': 'New User Updated',
        'picture': 'http://example.com/pic_updated.jpg'
    }
    
    with patch('app.api.endpoints.verify_google_token') as mock_verify:
        mock_verify.return_value = mock_idinfo
        
        response = client.post("/api/auth/google", json={"token": "valid_token"})
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

def test_google_login_invalid_token():
    with patch('app.api.endpoints.verify_google_token') as mock_verify:
        mock_verify.return_value = None
        
        response = client.post("/api/auth/google", json={"token": "invalid_token"})
        
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid Google Token"
