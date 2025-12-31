import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid
import io

client = TestClient(app)

def get_auth_headers_with_data():
    email = f"upload_test_{uuid.uuid4()}@example.com"
    password = "StrongPassword123!"
    client.post("/api/register", json={
        "email": email, "password": password, "full_name": "Uploader", "terms_accepted": 1
    })
    token = client.post("/api/token", data={"username": email, "password": password}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# Test Case 1: Valid CSV Upload (AC 1 & 3)
def test_import_valid_csv():
    headers = get_auth_headers_with_data()
    
    csv_content = """name,email,relationship
Alice Upload,alice.up@test.com,Friend
Bob Upload,bob.up@test.com,Colleague"""
    
    files = {
        "file": ("contacts.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    }
    
    res = client.post("/api/contacts/import", headers=headers, files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["imported"] == 2
    assert len(data["errors"]) == 0

# Test Case 2: Invalid File Format (AC 1)
def test_import_invalid_file_format():
    headers = get_auth_headers_with_data()
    
    files = {
        "file": ("contacts.txt", io.BytesIO(b"Just some text"), "text/plain")
    }
    
    res = client.post("/api/contacts/import", headers=headers, files=files)
    assert res.status_code == 400
    assert res.json()["detail"] == "Only CSV files are allowed"

# Test Case 3: Partial Import with Duplicates (AC 3)
def test_import_with_duplicates():
    headers = get_auth_headers_with_data()
    
    # Pre-existing contact
    create_res = client.post("/api/contacts", json={"name": "Existing", "email": "exists@test.com", "relationship": "Friend"}, headers=headers)
    assert create_res.status_code == 200
    
    csv_content = """name,email,relationship
New User,new@test.com,Friend
Existing,exists@test.com,Friend""" # Duplicate email
    
    files = {
        "file": ("contacts.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    }
    
    res = client.post("/api/contacts/import", headers=headers, files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["imported"] == 1 # Only new user imported
    # Duplicates are skipped silently in current implementation

# Test Case 4: Invalid Data / Parsing Error (AC 4)
def test_import_date_parsing_error():
    headers = get_auth_headers_with_data()
    
    csv_content = """name,email,birthday
Date Fail,fail@test.com,NOT-A-DATE"""
    
    files = {
        "file": ("contacts.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    }
    
    res = client.post("/api/contacts/import", headers=headers, files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["imported"] == 0
    assert len(data["errors"]) == 1
    assert "Row Date Fail" in data["errors"][0]

# Test Case 5: Empty/Malformed Rows (AC 2)
def test_import_malformed_rows():
    headers = get_auth_headers_with_data()
    
    # First row valid, second missing email (should be skipped)
    csv_content = """name,email
Valid Row,valid@test.com
Invalid Row,""" 
    
    files = {
        "file": ("contacts.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    }
    
    res = client.post("/api/contacts/import", headers=headers, files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["imported"] == 1
    # Silent skip behavior verified
