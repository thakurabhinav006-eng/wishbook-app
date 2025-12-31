import requests
try:
    print("Checking health...")
    r = requests.get("http://localhost:8000/api/health", timeout=5)
    print(r.status_code, r.text)
except Exception as e:
    print(e)
