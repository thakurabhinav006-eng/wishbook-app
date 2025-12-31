from app.db.database import SessionLocal
from app.db.models import User
from app.auth import get_password_hash

db = SessionLocal()

email = "admin@admin.com"
password = "admin"
full_name = "System Admin"

# Check if exists
user = db.query(User).filter(User.email == email).first()
if user:
    print(f"User {email} exists. Updating to admin...")
    user.role = "admin"
    user.password_hash = get_password_hash(password)
else:
    print(f"Creating new admin user {email}...")
    user = User(
        email=email,
        password_hash=get_password_hash(password),
        full_name=full_name,
        role="admin"
    )
    db.add(user)

db.commit()
print("Done.")
db.close()
