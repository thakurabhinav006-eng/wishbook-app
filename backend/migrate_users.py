import sqlite3

def migrate():
    conn = sqlite3.connect('sql_app.db')
    cursor = conn.cursor()
    
    columns = [
        ("full_name", "TEXT"),
        ("mobile_number", "TEXT"),
        ("timezone", "TEXT DEFAULT 'UTC'"),
        ("language", "TEXT DEFAULT 'en'"),
        ("profile_photo_url", "TEXT"),
        ("notification_preferences", "TEXT DEFAULT '{}'")
    ]
    
    for col_name, col_type in columns:
        try:
            print(f"Adding column {col_name}...")
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            print(f"Added {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"Column {col_name} already exists.")
            else:
                print(f"Error adding {col_name}: {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
