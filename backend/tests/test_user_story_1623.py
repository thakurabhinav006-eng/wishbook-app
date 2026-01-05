
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app
from app.api.endpoints import generate_wish_text

client = TestClient(app)

# Mock Data
MOCK_WISH_TEXT = "Happy Birthday, John! Hope you have a fantastic day!"
VALID_WISH_REQUEST = {
    "occasion": "Birthday",
    "recipient_name": "John",
    "tone": "Warm",
    "extra_details": "Loves hiking"
}

@pytest.fixture
def mock_llm():
    with patch("app.api.endpoints.generate_wish_text", new_callable=AsyncMock) as mock:
        mock.return_value = MOCK_WISH_TEXT
        yield mock

@pytest.fixture
def auth_headers():
    # Helper to get valid auth headers (assuming admin/user exists from health check or previous tests)
    # For unit testing isolation, we can just mock the dependency override or use a known user
    # But for story testing, let's login quickly
    login_data = {"username": "admin@admin.com", "password": "password123"}
    # Ensure admin exists first (mock/fixture usually handles this, but sticking to existing pattern)
    response = client.post("/api/token", data=login_data)
    if response.status_code != 200:
        # Fallback: create user if not exists (handling test isolation issues)
        client.post("/api/register", json={
            "email": "test_preview@example.com", 
            "password": "password123",
            "full_name": "Preview Tester",
            "terms_accepted": 1
        })
        response = client.post("/api/token", data={"username": "test_preview@example.com", "password": "password123"})
    
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_preview_generation_success(mock_llm):
    """
    Story #1623 - AC1: Generate a preview message.
    """
    response = client.post("/api/generate", json=VALID_WISH_REQUEST)
    assert response.status_code == 200
    data = response.json()
    assert "wish" in data
    assert data["wish"] == MOCK_WISH_TEXT
    mock_llm.assert_called_once()

def test_schedule_matches_preview(auth_headers):
    """
    Story #1623 - AC2: Verification that preview matches final output.
    We pass the 'previewed' text to the schedule endpoint and verify it is saved correctly.
    """
    # 1. "Preview" phase (Simulated by defined string)
    preview_text = "This is the previewed text."
    
    # 2. "Send/Schedule" phase
    schedule_payload = {
        "recipient_name": "Jane",
        "occasion": "Birthday",
        "tone": "Funny",
        "generated_wish": preview_text, # Passing the previewed text
        "recipient_email": "jane@example.com"
    }
    
    response = client.post("/api/schedule", json=schedule_payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    
    # Verify the saved wish matches the preview text
    assert data["generated_wish"] == preview_text
    assert data["recipient_name"] == "Jane"

def test_preview_generation_failure(mock_llm):
    """
    Edge Case: LLM Failure
    """
    mock_llm.side_effect = Exception("LLM Down")
    response = client.post("/api/generate", json=VALID_WISH_REQUEST)
    assert response.status_code == 500
    assert "LLM Down" in response.json()["detail"]
