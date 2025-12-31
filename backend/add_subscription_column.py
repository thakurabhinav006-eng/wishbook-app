import sqlite3

def add_column():
    conn = sqlite3.connect('sql_app.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN subscription_plan TEXT DEFAULT 'free'")
        print("Column 'subscription_plan' added successfully.")
        conn.commit()
    except sqlite3.OperationalError as e:
        print(f"Error (column might already exist): {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_column()
