from app.db.database import engine
from sqlalchemy import text, inspect

def add_contact_columns():
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('contacts')]
    
    new_cols = {
        'custom_occasion_name': 'TEXT',
        'custom_occasion_date': 'DATETIME',
        'gender': 'TEXT'
    }

    with engine.connect() as conn:
        for col_name, col_type in new_cols.items():
            if col_name not in columns:
                print(f"Adding {col_name} column...")
                conn.execute(text(f"ALTER TABLE contacts ADD COLUMN {col_name} {col_type}"))
        conn.commit()
    print("Migration complete.")

if __name__ == "__main__":
    add_contact_columns()
