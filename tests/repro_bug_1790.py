
import requests
import json
import sys

# Functions to register/login for testing
BASE_URL = "http://localhost:8000"

def get_auth_token():
    # 1. Create a unique test user
    email = "bug1790@test.com"
    password = "password123"
    
    # Register/Login
    requests.post(f"{BASE_URL}/api/users", json={
        "email": email, "password": password, "full_name": "Bug Tester", "mobile_number": "0000000000"
    })
    
    res = requests.post(f"{BASE_URL}/api/token", data={"username": email, "password": password})
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        sys.exit(1)
        
    return res.json()["access_token"]

def cleanup_contacts(token):
    # Delete all contacts for clean slate
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/api/contacts", headers=headers)
    for c in res.json():
        if c['name'] == "Duplicate Test":
            requests.delete(f"{BASE_URL}/api/contacts/{c['id']}", headers=headers)

def test_duplicate_contact():
    print("--- Starting Regression Test for Bug #1790 ---")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    cleanup_contacts(token)
    
    contact_payload = {
        "name": "Duplicate Test",
        "email": "dup@test.com", # Email is unique per contact usually, but we check name+phone
        "phone": "9998887776",
        "relationship": "Friend"
    }

    # 1. Create First Contact
    print("\n1. Creating First Contact...")
    res1 = requests.post(f"{BASE_URL}/api/contacts", json=contact_payload, headers=headers)
    if res1.status_code == 200:
        print("   SUCCESS: First contact created.")
    else:
        print(f"   FAILURE: Could not create first contact. {res1.text}")
        sys.exit(1)

    # 2. Create Duplicate Contact
    print("\n2. Attempting to Create Duplicate (Same Name + Phone)...")
    res2 = requests.post(f"{BASE_URL}/api/contacts", json=contact_payload, headers=headers)
    
    print(f"   Response Code: {res2.status_code}")
    print(f"   Response Body: {res2.text}")

    # 3. Validation
    if res2.status_code == 400 and "already exists" in res2.text:
        print("\n[PASS] System correctly rejected duplicate contact.")
    else:
        print("\n[FAIL] System allowed duplicate contact or returned wrong error.")
        sys.exit(1)

if __name__ == "__main__":
    test_duplicate_contact()
