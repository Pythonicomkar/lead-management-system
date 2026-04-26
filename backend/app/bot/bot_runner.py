from app.bot.telegram_bot import create_bot

async def start_bot():
    """Start the Telegram bot"""
    bot_app = create_bot()
    
    if bot_app is None:
        print("Bot not started - token not configured")
        return
    
    print("🤖 Starting Telegram Bot...")
    await bot_app.initialize()
    await bot_app.start()
    await bot_app.updater.start_polling()
    print("✅ Telegram Bot is running!")
    
    return bot_app

async def stop_bot(bot_app):
    """Stop the Telegram bot"""
    if bot_app:
        await bot_app.updater.stop()
        await bot_app.stop()
        print("Bot stopped.")