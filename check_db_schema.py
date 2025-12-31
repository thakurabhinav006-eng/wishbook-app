import sqlite3

def check_schema():
    conn = sqlite3.connect('backend/sql_app.db')
    cursor = conn.cursor()
    
    # Get columns for contacts table
    cursor.execute("PRAGMA table_info(contacts)")
    columns = cursor.fetchall()
    
    print("Contacts Table Columns:")
    for col in columns:
        print(f"- {col[1]} ({col[2]})")
        
    conn.close()

if __name__ == "__main__":
    check_schema()
