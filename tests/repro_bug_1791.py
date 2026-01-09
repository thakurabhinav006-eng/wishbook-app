import requests
import json

BASE_URL = "http://localhost:8000/api"
EMAIL = "admin@admin.com"
PASSWORD = "password123"

def run_test():
    print("--- Starting Reproduction Test for Bug #1791 ---")

    # 1. Login/Register
    print("1. Authenticating...")
    # OAuth2PasswordRequestForm expects username, not email
    auth_data = {"username": EMAIL, "password": PASSWORD}
    try:
        # Try login first
        res = requests.post(f"{BASE_URL}/token", data=auth_data)
        tokens = res.json()
        if 'access_token' not in tokens:
             # Register if login fails (or user doesn't exist)
             reg_res = requests.post(f"{BASE_URL}/register", json=auth_payload)
             if reg_res.status_code == 200:
                  res = requests.post(f"{BASE_URL}/login", data=auth_payload)
                  tokens = res.json()
             else:
                  print(f"Login/Register failed: {res.status_code} {res.text}")
                  return

        if 'access_token' not in tokens:
             print(f"Token missing in response: {tokens}")
             return

        token = tokens['access_token']
        headers = {"Authorization": f"Bearer {token}"}
        print("   Authenticated.")

    except Exception as e:
        print(f"   Authentication Error: {e}")
        return

    # 2. Create Contact with Custom Occasion
    print("\n2. Creating Contact with Custom Occasion...")
    contact_payload = {
        "name": "Custom Occasion Test",
        "email": "custom@occ.com",
        "relationship": "Friend",
        "custom_occasion_name": "Graduation Day",
        "custom_occasion_date": "2026-05-20T00:00:00"
    }
    
    res = requests.post(f"{BASE_URL}/contacts", json=contact_payload, headers=headers)
    if res.status_code != 200:
        print(f"   Failed to create contact: {res.status_code} {res.text}")
        return
    
    contact_data = res.json()
    contact_id = contact_data['id']
    print(f"   Contact Created: ID {contact_id}")

    # 3. Verify Response Payload
    print("\n3. Verifying Response Payload...")
    saved_name = contact_data.get('custom_occasion_name')
    saved_date = contact_data.get('custom_occasion_date')
    
    print(f"   Sent Occasion Name: {contact_payload['custom_occasion_name']}")
    print(f"   Saved Occasion Name: {saved_name}")
    print(f"   Sent Occasion Date: {contact_payload['custom_occasion_date']}")
    print(f"   Saved Occasion Date: {saved_date}")

    if saved_name == "Graduation Day" and saved_date is not None:
        print("   [PASS] Details matched in Creation Response.")
    else:
        print("   [FAIL] Details MISSING in Creation Response.")

    # 4. Verify Fetch (Get Details)
    print("\n4. Fetching Contact Details to confirm DB persistence...")
    res = requests.get(f"{BASE_URL}/contacts/{contact_id}", headers=headers)
    fetched_data = res.json()
    
    fetched_name = fetched_data.get('custom_occasion_name')
    fetched_date = fetched_data.get('custom_occasion_date')

    if fetched_name == "Graduation Day" and fetched_date is not None:
        print("   [PASS] DB Persistence confirmed.")
    else:
        print(f"   [FAIL] DB Persistence FAILED. Got: Name='{fetched_name}', Date='{fetched_date}'")

    # Cleanup
    requests.delete(f"{BASE_URL}/contacts/{contact_id}", headers=headers)

if __name__ == "__main__":
    run_test()
