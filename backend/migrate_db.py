import sqlite3
import datetime

def migrate():
    conn = sqlite3.connect('sql_app.db')
    cursor = conn.cursor()
    
    print("Checking columns...")
    cursor.execute("PRAGMA table_info(scheduled_wishes)")
    columns = [info[1] for info in cursor.fetchall()]
    
    if 'media_url' not in columns:
        print("Adding media_url...")
        cursor.execute("ALTER TABLE scheduled_wishes ADD COLUMN media_url VARCHAR")
        
    if 'template_id' not in columns:
        print("Adding template_id...")
        cursor.execute("ALTER TABLE scheduled_wishes ADD COLUMN template_id VARCHAR")

    if 'updated_at' not in columns:
        print("Adding updated_at...")
        cursor.execute("ALTER TABLE scheduled_wishes ADD COLUMN updated_at DATETIME")
        # Update existing rows to have updated_at = now
        now = datetime.datetime.utcnow().isoformat()
        cursor.execute(f"UPDATE scheduled_wishes SET updated_at = '{now}' WHERE updated_at IS NULL")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
