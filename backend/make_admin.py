import sys
from app.db.database import SessionLocal
from app.db.models import User

def make_admin(email):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User with email {email} not found.")
            return

        user.role = "admin"
        db.commit()
        print(f"Success! User {email} is now an Admin.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python make_admin.py <email>")
    else:
        make_admin(sys.argv[1])
