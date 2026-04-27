from app.bot.telegram_bot import create_bot
import os

# Get the Render URL from environment
RENDER_URL = os.getenv("RENDER_EXTERNAL_URL", "https://lead-management-system-kjz3.onrender.com")

async def start_bot():
    """Start the Telegram bot with webhook"""
    bot_app = create_bot()
    
    if bot_app is None:
        print("Bot not started - token not configured")
        return None
    
    print("🤖 Starting Telegram Bot...")
    
    # Initialize and start the application
    await bot_app.initialize()
    await bot_app.start()
    
    # Set webhook instead of polling
    webhook_url = f"{RENDER_URL}/webhook"
    
    try:
        # Delete any existing webhook first
        await bot_app.bot.delete_webhook()
        
        # Set the new webhook
        await bot_app.bot.set_webhook(url=webhook_url)
        print(f"✅ Webhook set to: {webhook_url}")
        print("✅ Telegram Bot is running!")
    except Exception as e:
        print(f"❌ Failed to set webhook: {e}")
        # Fallback to polling if webhook fails
        print("🔄 Falling back to polling mode...")
        await bot_app.updater.start_polling()
        print("✅ Telegram Bot running in polling mode!")
    
    return bot_app

async def stop_bot(bot_app):
    """Stop the Telegram bot"""
    if bot_app:
        try:
            # Remove webhook on shutdown
            await bot_app.bot.delete_webhook()
        except:
            pass
        
        try:
            await bot_app.updater.stop()
        except:
            pass
        
        await bot_app.stop()
        await bot_app.shutdown()
        print("Bot stopped.")