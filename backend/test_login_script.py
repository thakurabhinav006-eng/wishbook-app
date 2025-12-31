import requests
import sys

BASE_URL = "http://localhost:8000/api"

def test_login(username, password):
    print(f"Attempting login for {username}...")
    try:
        response = requests.post(
            f"{BASE_URL}/login",
            data={"username": username, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Login Successful!")
            return response.json()
        else:
            print(f"Login Failed: {response.text}")
            return None
    except Exception as e:
        print(f"Error during login: {e}")
        return None

def test_get_users(token):
    print("\nAttempting to fetch users...")
    try:
        response = requests.get(
            f"{BASE_URL}/admin/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            users = response.json()
            print(f"Found {len(users)} users.")
            print(users)
        else:
            print(f"Fetch Users Failed: {response.text}")
    except Exception as e:
        print(f"Error fetching users: {e}")

def test_get_analytics(token):
    print("\nAttempting to fetch analytics...")
    try:
        response = requests.get(
            f"{BASE_URL}/admin/analytics",
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Analytics Data:", data)
            if "daily_wishes" in data:
                print("SUCCESS: 'daily_wishes' found in response.")
            else:
                print("FAILURE: 'daily_wishes' missing.")
        else:
            print(f"Fetch Analytics Failed: {response.text}")
    except Exception as e:
        print(f"Error fetching analytics: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test_login.py <username> <password>")
        sys.exit(1)
        
    username = sys.argv[1]
    password = sys.argv[2]
    
    token_data = test_login(username, password)
    if token_data and "access_token" in token_data:
        test_get_analytics(token_data["access_token"])
