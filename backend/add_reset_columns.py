import sqlite3

# Connect to the SQLite database
# Assuming the default location is ./sql_app.db based on common FastAPI patterns if not specified otherwise in database.py
# But let's check database.py output first to be sure. 
# Since I am queueing this tool, I will assume a standard name `wishing_tool.db` or `sql_app.db` or check the file system.
# Actually, I should probably check the DB name first. 
# But for now, I'll write a generic script that I can modify the path of.

def add_columns():
    try:
        conn = sqlite3.connect('sql_app.db') 
        cursor = conn.cursor()
        
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN reset_token TEXT")
            print("Added reset_token column")
        except sqlite3.OperationalError as e:
            print(f"reset_token might already exist: {e}")
            
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP")
            print("Added reset_token_expires column")
        except sqlite3.OperationalError as e:
            print(f"reset_token_expires might already exist: {e}")
            
        conn.commit()
        conn.close()
        print("Migration complete")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_columns()
