import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
ADMIN_EMAIL = "admin@admin.com"
ADMIN_PASSWORD = "password123"

def test_duplicate_update():
    print("--- Testing Bug #1797: Duplicate Contact Details on Update ---")
    
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

    # 2. Create two contacts
    print("\n2. Creating two contacts...")
    contact1_data = {
        "name": "Contact One",
        "email": "one@example.com",
        "relationship": "Friend",
        "phone": "+1111111111"
    }
    contact2_data = {
        "name": "Contact Two",
        "email": "two@example.com",
        "relationship": "Friend",
        "phone": "+2222222222"
    }
    
    res1 = requests.post(f"{BASE_URL}/contacts", json=contact1_data, headers=headers)
    res2 = requests.post(f"{BASE_URL}/contacts", json=contact2_data, headers=headers)
    
    if res1.status_code != 200 or res2.status_code != 200:
        print(f"   [FAIL] Failed to create contacts for testing.")
        return
    
    c1 = res1.json()
    c2 = res2.json()
    print(f"   Contacts created: '{c1['name']}' (ID {c1['id']}) and '{c2['name']}' (ID {c2['id']})")

    # 3. Attempt to update Contact Two to match Contact One's Name + Phone
    print(f"\n3. Attempting to update '{c2['name']}' to match '{c1['name']}''s name and phone...")
    update_data = {
        "name": c1['name'],
        "email": c2['email'], # Keep its own email
        "relationship": c2['relationship'],
        "phone": c1['phone'] # Match contact one's phone
    }
    
    response = requests.put(f"{BASE_URL}/contacts/{c2['id']}", json=update_data, headers=headers)
    
    if response.status_code == 400:
        print(f"   [PASS] API correctly rejected duplicate update with status 400.")
        print(f"   Error Detail: {response.json().get('detail')}")
    elif response.status_code == 200:
        print(f"   [FAIL] API accepted duplicate update! '{c2['name']}' (ID {c2['id']}) now has same details as '{c1['name']}' (ID {c1['id']}).")
    else:
        print(f"   [ERROR] Unexpected status code: {response.status_code}")
        print(f"   Response: {response.text}")

    # 4. Attempt to update Contact Two to match Contact One's Name + Email
    print(f"\n4. Attempting to update '{c2['name']}' to match '{c1['name']}''s name and email...")
    update_data_email = {
        "name": c1['name'],
        "email": c1['email'], # Match contact one's email
        "relationship": c2['relationship'],
        "phone": c2['phone'] # Keep its own phone
    }
    
    response = requests.put(f"{BASE_URL}/contacts/{c2['id']}", json=update_data_email, headers=headers)
    
    if response.status_code == 400:
        print(f"   [PASS] API correctly rejected duplicate update (Email) with status 400.")
        print(f"   Error Detail: {response.json().get('detail')}")
    elif response.status_code == 200:
        print(f"   [FAIL] API accepted duplicate update (Email)!")
    else:
        print(f"   [ERROR] Unexpected status code: {response.status_code}")
        print(f"   Response: {response.text}")

    # 5. Ensure updating OWN details is still allowed
    print(f"\n5. Ensuring updating OWN details is still allowed...")
    own_update = {
        "name": c2['name'],
        "email": c2['email'],
        "relationship": "Colleague", # Changed
        "phone": c2['phone']
    }
    response = requests.put(f"{BASE_URL}/contacts/{c2['id']}", json=own_update, headers=headers)
    if response.status_code == 200:
        print(f"   [PASS] API allowed self-update.")
    else:
        print(f"   [FAIL] API rejected self-update with status {response.status_code}.")
        print(f"   Response: {response.text}")

    # Cleanup
    print("\nCleaning up...")
    requests.delete(f"{BASE_URL}/contacts/{c1['id']}", headers=headers)
    requests.delete(f"{BASE_URL}/contacts/{c2['id']}", headers=headers)

if __name__ == "__main__":
    test_duplicate_update()
