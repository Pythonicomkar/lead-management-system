from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os

from app.config import get_settings
from app.database import init_db
from app.routers import leads, dashboard, auth, tags
from app.bot.bot_runner import start_bot, stop_bot

settings = get_settings()

# Store bot instance globally
bot_instance = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global bot_instance
    
    print("Starting up Lead Management System v2.0...")
    await init_db()
    print("Database initialized successfully!")
    
    # Start Telegram Bot
    print("Starting Telegram Bot...")
    try:
        bot_instance = await start_bot()
        print("Telegram Bot started successfully!")
    except Exception as e:
        print(f"Warning: Telegram Bot failed to start: {e}")
        bot_instance = None
    
    yield
    
    # Shutdown
    print("Shutting down...")
    if bot_instance:
        await stop_bot(bot_instance)
    print("Shutdown complete!")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(leads.router, prefix="/api/leads", tags=["leads"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(tags.router, prefix="/api/tags", tags=["tags"])

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "version": settings.APP_VERSION,
        "bot_running": bot_instance is not None
    }

# Serve React Frontend in Production
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(FRONTEND_DIR):
    # Mount static assets
    assets_dir = os.path.join(FRONTEND_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    
    # Serve other static files (like favicon, icons)
    @app.get("/{filename:path}")
    async def serve_frontend(filename: str):
        file_path = os.path.join(FRONTEND_DIR, filename)
        
        # If file exists, serve it
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # For SPA routing, return index.html for all non-file routes
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "message": "Lead Management System API v2.0",
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "redoc": "/redoc"
        }