from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.db import models
from app.db.database import engine
from app.services.scheduler import scheduler # Changed from start_scheduler to scheduler object
import contextlib # Added import for contextlib
from .core.firebase import init_firebase # Added import for init_firebase

models.Base.metadata.create_all(bind=engine)

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        scheduler.start()
        init_firebase() # Initialize Firebase
    except Exception as e:
        print(f"Warning: Startup failed: {e}")
    yield
    # Shutdown
    try:
        scheduler.shutdown()
    except Exception as e:
        print(f"Warning: Shutdown failed: {e}")

app = FastAPI(title="AI Wishing Tool API", version="1.0.0", lifespan=lifespan) # Added lifespan to FastAPI app

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
