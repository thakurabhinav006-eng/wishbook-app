from app.db.database import SessionLocal, engine
from sqlalchemy import text

def add_column():
    db = SessionLocal()
    try:
        # Check if column exists
        result = db.execute(text("PRAGMA table_info(subscription_plans)"))
        columns = [row[1] for row in result.fetchall()]
        
        if "is_active" not in columns:
            print("Adding is_active column to subscription_plans...")
            db.execute(text("ALTER TABLE subscription_plans ADD COLUMN is_active INTEGER DEFAULT 1"))
            db.commit()
            print("Column added successfully.")
        else:
            print("Column is_active already exists.")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_column()
