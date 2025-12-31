import os
import sys
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.db import models

# 1. Configuration
SQLITE_URL = "sqlite:///./sql_app.db"
# Usage: MYSQL_URL=mysql+pymysql://user:pass@host/dbname python migrate_sqlite_to_mysql.py

def migrate():
    print("🚀 Starting Migration: SQLite -> MySQL")
    
    MYSQL_URL = os.getenv("MYSQL_DATABASE_URL")
    if not MYSQL_URL:
        print("❌ Error: MYSQL_DATABASE_URL environment variable is not set.")
        print("Usage: export MYSQL_DATABASE_URL='mysql+pymysql://user:pass@localhost/dbname' && python migrate_sqlite_to_mysql.py")
        sys.exit(1)

    # 2. Connect to SQLite (Source)
    print(f"📂 Connecting to Source (SQLite): {SQLITE_URL}")
    sqlite_engine = create_engine(SQLITE_URL)
    SQLiteSession = sessionmaker(bind=sqlite_engine)
    sqlite_session = SQLiteSession()

    # 3. Connect to MySQL (Target)
    print(f"🔌 Connecting to Target (MySQL): {MYSQL_URL}")
    mysql_engine = create_engine(MYSQL_URL)
    MySQLSession = sessionmaker(bind=mysql_engine)
    mysql_session = MySQLSession()

    # 4. Create Tables in Target
    print("🏗️  Creating Schema in MySQL...")
    # Drop all to ensure clean slate? Maybe safer to just create_all
    Base.metadata.create_all(mysql_engine)

    # 5. Transfer Data
    models_to_migrate = [
        models.User,
        models.SubscriptionPlan,
        models.Contact,
        models.ScheduledWish
    ]

    try:
        for model in models_to_migrate:
            table_name = model.__tablename__
            print(f"📦 Migrating table: {table_name}...")
            
            # Fetch from Source
            records = sqlite_session.query(model).all()
            count = len(records)
            print(f"   found {count} records.")

            if count == 0:
                continue

            # Insert into Target
            # We use make_transient to detach objects from the sqlite session
            from sqlalchemy.orm import make_transient

            for record in records:
                # Detach from source session
                sqlite_session.expunge(record)
                make_transient(record)
                
                # Check if exists (upsert logic simple: look up by ID)
                exists = mysql_session.query(model).filter(model.id == record.id).first()
                if not exists:
                    # Add to target session
                    mysql_session.add(record)
            
            mysql_session.commit()
            print(f"   ✅ Migrated {count} records to MySQL.")
            
        print("\n🎉 Migration Complete Successfully!")
        
    except Exception as e:
        print(f"\n❌ Migration Failed: {e}")
        mysql_session.rollback()
    finally:
        sqlite_session.close()
        mysql_session.close()

if __name__ == "__main__":
    migrate()
