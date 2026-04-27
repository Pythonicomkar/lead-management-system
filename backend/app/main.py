from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from telegram import Update
import os
import sys

from app.config import get_settings
from app.database import init_db
from app.routers import leads, dashboard, auth, tags

settings = get_settings()

# Parse CORS origins
if settings.ALLOWED_ORIGINS == "*":
    cors_origins = ["*"]
else:
    cors_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]

# Try to import bot, but don't fail if it can't
try:
    from app.bot.bot_runner import start_bot, stop_bot
    bot_available = True
except ImportError as e:
    print(f"Warning: Telegram bot module not available: {e}")
    bot_available = False

# Store bot instance globally
bot_instance = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global bot_instance
    
    print("Starting up Lead Management System v2.0...")
    
    # Initialize database
    try:
        await init_db()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"ERROR: Database initialization failed: {e}")
        raise
    
    # Start Telegram Bot (optional)
    if bot_available and settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_BOT_TOKEN != "YOUR_BOT_TOKEN_HERE":
        print("Starting Telegram Bot...")
        try:
            bot_instance = await start_bot()
            if bot_instance:
                print("Telegram Bot started successfully!")
            else:
                print("Telegram Bot failed to start (check token)")
        except Exception as e:
            print(f"Warning: Telegram Bot failed to start: {e}")
            print("App will continue without Telegram Bot")
            bot_instance = None
    else:
        if not settings.TELEGRAM_BOT_TOKEN:
            print("Telegram Bot not configured (no token provided)")
        else:
            print("Telegram Bot token not set (using default placeholder)")
        bot_instance = None
    
    yield
    
    # Shutdown
    print("Shutting down...")
    if bot_instance:
        try:
            await stop_bot(bot_instance)
        except Exception as e:
            print(f"Warning: Error stopping bot: {e}")
    print("Shutdown complete!")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Configure CORS with proper origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers (no prefixes - routers already have /api/* prefixes)
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(dashboard.router)
app.include_router(tags.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "version": settings.APP_VERSION,
        "bot_running": bot_instance is not None
    }

@app.get("/api")
async def api_info():
    return {
        "message": "Lead Management System API v2.0",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "bot_running": bot_instance is not None if bot_instance else False
    }

# ========== Telegram Webhook ==========
@app.post("/webhook")
async def telegram_webhook(request: Request):
    """Handle incoming Telegram updates via webhook"""
    global bot_instance
    
    if bot_instance is None:
        return {"status": "bot not running"}
    
    try:
        # Parse the incoming update from Telegram
        data = await request.json()
        update = Update.de_json(data, bot_instance.bot)
        
        # Process the update through the bot
        await bot_instance.process_update(update)
        
        return {"status": "ok"}
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# Serve React Frontend in Production
# __file__ = backend/app/main.py
# Go up 2 levels to reach root, then frontend/dist
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")

print(f"Frontend directory path: {FRONTEND_DIR}")
print(f"Frontend exists: {os.path.exists(FRONTEND_DIR)}")

if os.path.exists(FRONTEND_DIR):
    # Mount static assets
    assets_dir = os.path.join(FRONTEND_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    
    # Serve other static files and SPA routing
    @app.get("/{filename:path}")
    async def serve_frontend(filename: str):
        file_path = os.path.join(FRONTEND_DIR, filename)
        
        # Don't interfere with API routes
        if filename.startswith("api/"):
            return {"error": "API endpoint not found"}
        
        # Don't interfere with docs
        if filename in ["docs", "redoc", "openapi.json"]:
            return {"error": "Not found"}
        
        # If file exists, serve it
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # For SPA routing - return index.html for all other routes
        index_path = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        return {"error": "Frontend not available", "message": "Please build the frontend first"}
else:
    @app.get("/")
    async def root():
        return {
            "message": "Lead Management System API v2.0",
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "redoc": "/redoc",
            "note": "Frontend not built - API only mode"
        }