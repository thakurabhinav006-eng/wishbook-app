
import sys
import os
from dotenv import load_dotenv
load_dotenv("backend/.env")

from sqlalchemy import create_engine, inspect, text
from app.core.config import settings

# ANSI Colors
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"

def check_db():
    print(f"Checking Database Connection to: {settings.DATABASE_URL.split('@')[-1]}") # Hide password
    try:
        engine = create_engine(settings.DATABASE_URL)
        connection = engine.connect()
        print(f"{GREEN}[OK] Connection Successful{RESET}")
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"\nTime to inspect tables. Found {len(tables)} tables:")
        print(f"Tables: {', '.join(tables)}")
        
        required_tables = ['users', 'scheduled_wishes', 'subscription_plans', 'contacts']
        missing_tables = [t for t in required_tables if t not in tables]
        
        if missing_tables:
            print(f"{RED}[FAIL] Missing Tables: {missing_tables}{RESET}")
        else:
            print(f"{GREEN}[OK] All Core Tables Present{RESET}")

        # Check Users Schema
        if 'users' in tables:
            print("\nChecking 'users' table columns:")
            columns = [c['name'] for c in inspector.get_columns('users')]
            print(f"Columns: {', '.join(columns)}")
            
            # Check for critical columns
            required_columns = ['id', 'email', 'password_hash', 'is_active', 'role']
            missing_cols = [c for c in required_columns if c not in columns]
            if missing_cols:
                print(f"{RED}[FAIL] Missing User Columns: {missing_cols}{RESET}")
            else:
                 print(f"{GREEN}[OK] Core User Columns Present{RESET}")
            
            # Count Users
            result = connection.execute(text("SELECT COUNT(*) FROM users"))
            count = result.scalar()
            print(f"Total Users in DB: {count}")
            
        connection.close()
        return True

    except Exception as e:
        print(f"{RED}[CRITICAL FAIL] Database Error: {e}{RESET}")
        return False

if __name__ == "__main__":
    print("--- Backend Health Diagnosis ---")
    sys.path.append(os.getcwd())
    if check_db():
        print(f"\n{GREEN}--- DIAGNOSIS COMPLETE: BACKEND DB SEEMS HEALTHY ---{RESET}")
    else:
        print(f"\n{RED}--- DIAGNOSIS FAILED ---{RESET}")
