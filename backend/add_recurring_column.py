
import sqlite3
import os

DB_FILE = "wishing_tool.db" # Or sql_app.db based on list_dir, let's check what's used.
# Checking endpoints.py, it uses app.db.database which usually points to sql_app.db or wishing_tool.db
# from list_dir earlier: "sql_app.db", "wishing_tool.db". 
# I'll check both or check config. 
# app/db/database.py usually has the URL.

# Let's assume sql_app.db based on common FastAPI patterns or check database.py first.
# Wait, I should check database.py to be sure which DB file is being used.

from app.db.database import engine
# This is safer, use the engine to connect.

from sqlalchemy import text

def add_column():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE scheduled_wishes ADD COLUMN is_recurring INTEGER DEFAULT 0"))
            conn.commit()
            print("Successfully added is_recurring column.")
        except Exception as e:
            print(f"Error adding column (maybe exists?): {e}")

if __name__ == "__main__":
    add_column()
