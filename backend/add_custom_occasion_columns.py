from sqlalchemy import create_engine, text
from app.db.database import SQLALCHEMY_DATABASE_URL

def migrate():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        print("Checking 'contacts' table schema...")
        
        # Check if columns exist (SQLite specific)
        result = conn.execute(text("PRAGMA table_info(contacts)"))
        columns = [row[1] for row in result.fetchall()]
        
        print(f"Existing columns: {columns}")
        
        if "custom_occasion_name" not in columns:
            print("Adding 'custom_occasion_name' column...")
            try:
                conn.execute(text("ALTER TABLE contacts ADD COLUMN custom_occasion_name VARCHAR(255)"))
                print("Added 'custom_occasion_name'.")
            except Exception as e:
                print(f"Error adding custom_occasion_name: {e}")

        if "custom_occasion_date" not in columns:
            print("Adding 'custom_occasion_date' column...")
            try:
                conn.execute(text("ALTER TABLE contacts ADD COLUMN custom_occasion_date DATETIME"))
                print("Added 'custom_occasion_date'.")
            except Exception as e:
                print(f"Error adding custom_occasion_date: {e}")
                
        if "custom_occasion_name" in columns and "custom_occasion_date" in columns:
            print("Columns already exist.")

if __name__ == "__main__":
    migrate()
