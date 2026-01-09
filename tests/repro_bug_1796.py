import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
ADMIN_EMAIL = "admin@admin.com"
ADMIN_PASSWORD = "password123"

def test_invalid_phone():
    print("--- Testing Bug #1796: Invalid Phone Number ---")
    
    # 1. Authenticate
    print("1. Authenticating...")
    login_data = {
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "grant_type": "password"
    }
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    if response.status_code != 200:
        print(f"   [FAIL] Authentication failed: {response.status_code} {response.text}")
        return
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   Authenticated.")

    # 2. Try to create contact with invalid phone (abcd123, too short, etc.)
    # The new regex is /^\+?[\d]{10,15}$/
    invalid_phones = ["abcd123", "123456789", "1234567890123456", "+12345abcd", " ", "++1234567890"]
    
    for phone in invalid_phones:
        print(f"\n2. Creating Contact with invalid phone: '{phone}'...")
        contact_data = {
            "name": f"Invalid Phone Test {phone}",
            "email": f"test_{hash(phone)}@example.com",
            "relationship": "Friend",
            "phone": phone
        }
        
        response = requests.post(f"{BASE_URL}/contacts", json=contact_data, headers=headers)
        
        if response.status_code == 422:
            print(f"   [PASS] API correctly rejected '{phone}' with status 422.")
            detail = response.json().get('detail')
            print(f"   Error Detail: {detail}")
        else:
            print(f"   [FAIL] API outcome for '{phone}': Status {response.status_code}.")
            print(f"   Response: {response.text}")

    # 3. Try valid phones
    valid_phones = ["+1234567890", "1234567890", "+919876543210"]
    for phone in valid_phones:
        print(f"\n3. Creating Contact with valid phone: '{phone}'...")
        contact_data = {
            "name": f"Valid Phone Test {phone}",
            "email": f"valid_{hash(phone)}@example.com",
            "relationship": "Friend",
            "phone": phone
        }
        response = requests.post(f"{BASE_URL}/contacts", json=contact_data, headers=headers)
        if response.status_code == 200:
            print(f"   [PASS] API accepted valid phone '{phone}'.")
            # Cleanup
            cid = response.json().get('id')
            if cid:
                requests.delete(f"{BASE_URL}/contacts/{cid}", headers=headers)
        else:
            print(f"   [FAIL] API rejected valid phone '{phone}' with status {response.status_code}.")
            print(f"   Response: {response.text}")

if __name__ == "__main__":
    test_invalid_phone()
