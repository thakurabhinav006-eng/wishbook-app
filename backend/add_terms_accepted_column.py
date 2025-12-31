from app.db.database import engine
from sqlalchemy import text, inspect

def add_column():
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'terms_accepted' not in columns:
        print("Adding terms_accepted column...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN terms_accepted INTEGER DEFAULT 0"))
            conn.commit()
    else:
        print("terms_accepted column already exists")

if __name__ == "__main__":
    add_column()
