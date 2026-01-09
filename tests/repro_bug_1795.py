import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
ADMIN_EMAIL = "admin@admin.com"
ADMIN_PASSWORD = "password123"

def test_invalid_email():
    print("--- Testing Bug #1795: Invalid Email Format ---")
    
    # 1. Authenticate
    print("1. Authenticating...")
    login_data = {
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "grant_type": "password"
    }
    # endpoints.py has @router.post("/token")
    # Included with prefix "/api" -> /api/token
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    if response.status_code != 200:
        print(f"   [FAIL] Authentication failed: {response.status_code} {response.text}")
        return
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   Authenticated.")

    # 2. Try to create contact with invalid email (test@com)
    invalid_emails = ["test@com", "invalid-email", "test@@example.com", "test@example..com", "@example.com", "test@.com"]
    
    for email in invalid_emails:
        print(f"\n2. Creating Contact with invalid email: '{email}'...")
        contact_data = {
            "name": f"Invalid Email Test {email}",
            "email": email,
            "relationship": "Friend",
            "phone": "+1234567890"
        }
        
        # Proper URL: BASE_URL is ".../api", endpoints is "/contacts" -> /api/contacts
        response = requests.post(f"{BASE_URL}/contacts", json=contact_data, headers=headers)
        
        if response.status_code == 422:
            print(f"   [PASS] API correctly rejected '{email}' with status 422.")
            detail = response.json().get('detail')
            print(f"   Error Detail: {detail}")
        else:
            print(f"   [FAIL] API outcome for '{email}': Status {response.status_code}.")
            print(f"   Response: {response.text}")

    # 3. Try a valid email to ensure we didn't break everything
    print("\n3. Creating Contact with valid email: 'test@example.com'...")
    valid_email = "test@example.com"
    contact_data = {
        "name": "Valid Email Test",
        "email": valid_email,
        "relationship": "Friend",
        "phone": "+9876543210" 
    }
    response = requests.post(f"{BASE_URL}/contacts", json=contact_data, headers=headers)
    if response.status_code == 200:
        print(f"   [PASS] API accepted valid email '{valid_email}'.")
        # Cleanup
        cid = response.json().get('id')
        if cid:
            requests.delete(f"{BASE_URL}/contacts/{cid}", headers=headers)
    else:
        print(f"   [FAIL] API rejected valid email '{valid_email}' with status {response.status_code}.")
        print(f"   Response: {response.text}")

if __name__ == "__main__":
    test_invalid_email()
