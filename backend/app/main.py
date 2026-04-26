from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

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
    bot_instance = await start_bot()
    
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(dashboard.router)
app.include_router(tags.router)

@app.get("/")
async def root():
    return {
        "message": "Lead Management System API v2.0",
        "version": settings.APP_VERSION,
        "features": [
            "User Authentication (JWT)",
            "Lead Management with Tags",
            "Advanced Filtering & Search",
            "Bulk Operations",
            "Enhanced Dashboard Analytics",
            "Comments System",
            "Activity Tracking",
            "Telegram Bot Integration"
        ],
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "version": settings.APP_VERSION,
        "bot_running": bot_instance is not None
    }