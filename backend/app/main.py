import sys
import os

# Add the parent directory (backend/) to sys.path so 'app' module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.db import models
from app.db.database import engine
from app.services.scheduler import start_scheduler

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Wishing Tool API", version="1.0.0")

@app.on_event("startup")
def startup_event():
    try:
        start_scheduler()
    except Exception as e:
        print(f"Warning: Scheduler failed to start: {e}")

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(endpoints.router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
