from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os

from dotenv import load_dotenv

load_dotenv()

# User requested strictly MySQL, no SQLite fallback.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL is not set. Please check your .env file. SQLite fallback is disabled.")

connect_args = {}

# Aiven MySQL requires SSL but often has hostname verification issues with standard CAs in some envs.
# We enable SSL but disable hostname check to ensure connectivity.
if "aivencloud.com" in SQLALCHEMY_DATABASE_URL:
    connect_args["ssl"] = {"check_hostname": False, "verify_mode": 0} # ssl.CERT_NONE

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args, pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
