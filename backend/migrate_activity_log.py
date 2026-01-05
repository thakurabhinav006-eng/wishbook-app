import sqlite3

def migrate():
    conn = sqlite3.connect('sql_app.db')
    cursor = conn.cursor()
    
    print("Creating activity_logs table...")
    try:
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action VARCHAR(100),
            details VARCHAR(500),
            created_at TIMESTAMP,
            user_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_activity_logs_id ON activity_logs (id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_activity_logs_action ON activity_logs (action);")
        print("Table created successfully.")
        
        # Verify
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_logs'")
        if cursor.fetchone():
            print("Verification: Table exists.")
        else:
            print("Verification: Table NOT found.")
            
    except Exception as e:
        print(f"Error: {e}")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
