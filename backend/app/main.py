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
# Custom CORS Middleware to allow ANY Vercel Preview URL
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

class AllowAllMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            response = Response()
        else:
            try:
                response = await call_next(request)
            except Exception as e:
                print(f"Unhandled Backend Error: {e}")
                response = Response("Internal Server Error", status_code=500)

        origin = request.headers.get("origin")
        if origin:
            # Echo the origin back to satisfy browser security
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
        
        return response

app.add_middleware(AllowAllMiddleware)

# Include Routers
app.include_router(endpoints.router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
