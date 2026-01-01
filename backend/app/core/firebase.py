
import firebase_admin
from firebase_admin import credentials, storage
import os
from .config import settings

# Path to the service account key
SERVICE_ACCOUNT_KEY = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "firebase_key.json")

def init_firebase():
    """Validates and initializes the Firebase Admin app."""
    # 1. Try Environment Variable (Production/Vercel)
    firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS")
    
    if not firebase_admin._apps:
        cred = None
        if firebase_creds_json:
            import json
            try:
                creds_dict = json.loads(firebase_creds_json)
                cred = credentials.Certificate(creds_dict)
                print("🔥 Firebase initialized via Environment Variable.")
            except Exception as e:
                print(f"❌ Failed to parse FIREBASE_CREDENTIALS: {e}")
        
        # 2. Try Local File (Development)
        elif os.path.exists(SERVICE_ACCOUNT_KEY):
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
            print("To verify: Firebase initialized via Local File.")
        
        else:
             print(f"⚠️ No Firebase credentials found (checked ENV and {SERVICE_ACCOUNT_KEY}). Storage disabled.")
             return None

        if cred:
            try:
                firebase_admin.initialize_app(cred, {
                    'storageBucket': settings.FIREBASE_STORAGE_BUCKET
                })
                return firebase_admin.get_app()
            except Exception as e:
                print(f"❌ Failed to initialize Firebase App: {e}")
                return None
    return firebase_admin.get_app()

def upload_file(file_obj, descriptor, content_type=None):
    """
    Uploads a file-like object to Firebase Storage.
    descriptor: The path/filename in the bucket (e.g. 'avatars/user_1/pic.jpg')
    """
    try:
        bucket = storage.bucket()
        blob = bucket.blob(descriptor)
        
        blob.upload_from_file(file_obj, content_type=content_type)
        blob.make_public()
        
        return blob.public_url
    except Exception as e:
        print(f"❌ Firebase Upload Error: {e}")
        raise e
