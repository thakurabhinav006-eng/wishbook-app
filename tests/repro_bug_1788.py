
import requests
import json
import sys

# Functions to register/login for testing
BASE_URL = "http://localhost:8000"

def get_auth_token():
    # 1. Create a unique test user (or reuse)
    email = "bug1788@test.com"
    password = "password123"
    
    # Try Register
    requests.post(f"{BASE_URL}/api/users", json={
        "email": email, "password": password, "full_name": "Bug Tester", "mobile_number": "0000000000"
    })
    
    # Login
    res = requests.post(f"{BASE_URL}/api/token", data={"username": email, "password": password})
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        sys.exit(1)
        
    return res.json()["access_token"]

def test_blank_name():
    print("--- Starting Regression Test for Bug #1788 ---")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test Cases
    invalid_payloads = [
        {"name": "", "phone": "1234567890", "email": "test@test.com", "relationship": "Friend"},
        {"name": "   ", "phone": "1234567891", "email": "test2@test.com", "relationship": "Friend"}
    ]

    for i, payload in enumerate(invalid_payloads):
        print(f"\nTest Case {i+1}: Name = '{payload['name']}'")
        res = requests.post(f"{BASE_URL}/api/contacts", json=payload, headers=headers)
        
        print(f"   Response Code: {res.status_code}")
        print(f"   Response Body: {res.text}")

        if res.status_code == 422:
             print("   [PASS] System rejected blank name (422 Unprocessable Entity).")
        else:
             print("   [FAIL] System accepted blank name or returned wrong error.")
             # sys.exit(1) # Don't exit immediately, verify all cases

if __name__ == "__main__":
    test_blank_name()
