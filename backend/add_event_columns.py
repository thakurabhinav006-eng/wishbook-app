from app.db.database import SessionLocal, engine
from sqlalchemy import text, inspect

def migrate():
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('scheduled_wishes')]
    
    with engine.connect() as conn:
        if 'event_name' not in columns:
            conn.execute(text("ALTER TABLE scheduled_wishes ADD COLUMN event_name VARCHAR"))
            print("Added event_name column")
            
        if 'event_type' not in columns:
            conn.execute(text("ALTER TABLE scheduled_wishes ADD COLUMN event_type VARCHAR DEFAULT 'Custom Event'"))
            print("Added event_type column")
            
        if 'reminder_days_before' not in columns:
            conn.execute(text("ALTER TABLE scheduled_wishes ADD COLUMN reminder_days_before INTEGER DEFAULT 0"))
            print("Added reminder_days_before column")
            
        if 'auto_send' not in columns:
            conn.execute(text("ALTER TABLE scheduled_wishes ADD COLUMN auto_send INTEGER DEFAULT 1"))
            print("Added auto_send column")
            
        conn.commit()

if __name__ == "__main__":
    migrate()
