from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ConversationHandler, ContextTypes
from telegram.constants import ParseMode
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.models import Lead, LeadStatus, User, TelegramUser
from app.crud import LeadCRUD
from app.schemas import LeadCreate, LeadStatusUpdate

settings = get_settings()

# Conversation states
NAME, EMAIL, PHONE, SOURCE, NOTES = range(5)

# ========== Helper Functions ==========

async def get_or_create_telegram_user(db: AsyncSession, telegram_id: str, username: str, first_name: str) -> Optional[TelegramUser]:
    """Get or create telegram user"""
    result = await db.execute(
        select(TelegramUser).where(TelegramUser.telegram_id == str(telegram_id))
    )
    t_user = result.scalar_one_or_none()
    
    if not t_user:
        t_user = TelegramUser(
            telegram_id=str(telegram_id),
            username=username,
            first_name=first_name,
            is_linked=False
        )
        db.add(t_user)
        await db.flush()
        await db.refresh(t_user)
    
    return t_user

async def get_linked_user(db: AsyncSession, telegram_id: str) -> Optional[User]:
    """Get the web user linked to this Telegram account"""
    result = await db.execute(
        select(TelegramUser).where(
            TelegramUser.telegram_id == str(telegram_id),
            TelegramUser.is_linked == True
        )
    )
    t_user = result.scalar_one_or_none()
    
    if t_user and t_user.user_id:
        user_result = await db.execute(select(User).where(User.id == t_user.user_id))
        return user_result.scalar_one_or_none()
    
    return None

# ========== Command Handlers ==========

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send welcome message when /start is issued"""
    user = update.effective_user
    
    # Register telegram user
    async with AsyncSessionLocal() as db:
        t_user = await get_or_create_telegram_user(
            db, str(user.id), user.username, user.first_name
        )
        
        linked_user = await get_linked_user(db, str(user.id))
    
    welcome_text = f"""
👋 *Welcome to Lead Management Bot!*

Hi {user.first_name}! I can help you manage leads directly from Telegram.

*Available Commands:*
📊 /dashboard - View dashboard stats
➕ /addlead - Add a new lead
📋 /leads - List recent leads
🔍 /search - Search leads
📈 /stats - Quick statistics
🔗 /link - Link to your web account
❓ /help - Show this help message
"""
    keyboard = [
        [InlineKeyboardButton("📊 Dashboard", callback_data="dashboard"),
         InlineKeyboardButton("➕ Add Lead", callback_data="start_addlead")],
        [InlineKeyboardButton("📋 View Leads", callback_data="leads"),
         InlineKeyboardButton("📈 Stats", callback_data="stats")],
    ]
    
    if not linked_user:
        keyboard.append([InlineKeyboardButton("🔗 Link Web Account", callback_data="link")])
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.callback_query:
        await update.callback_query.edit_message_text(welcome_text, reply_markup=reply_markup, parse_mode=ParseMode.MARKDOWN)
    else:
        await update.message.reply_text(welcome_text, reply_markup=reply_markup, parse_mode=ParseMode.MARKDOWN)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send help message"""
    help_text = """
📚 *Help & Commands*

*Lead Management:*
➕ /addlead - Start adding a new lead
📋 /leads - View recent leads (last 10)
🔍 /search <query> - Search leads by name/email
✏️ /update <id> <status> - Update lead status
❌ /delete <id> - Delete a lead

*Dashboard & Stats:*
📊 /dashboard - Full dashboard
📈 /stats - Quick statistics

*Account:*
🔗 /link <code> - Link to web account
👤 /profile - View your profile

*Status Values:*
• new - New lead
• contacted - Contacted lead
• closed - Closed/Converted lead

*Examples:*
/update 1 contacted
/search john
/link ABC123
"""
    await update.message.reply_text(help_text, parse_mode=ParseMode.MARKDOWN)

# ========== Link Account ==========

async def link_account(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Link Telegram account to web user"""
    query = update.callback_query
    if query:
        await query.answer()
    
    if not context.args and not query:
        await update.message.reply_text(
            "To link your account, use:\n/link <your_username>\n\n"
            "Or generate a link code from the web app settings.",
            parse_mode=ParseMode.MARKDOWN
        )
        return
    
    link_value = ' '.join(context.args) if context.args else None
    
    if not link_value and not query:
        await update.message.reply_text("Please provide your web username. Example: /link john_doe")
        return
    
    async with AsyncSessionLocal() as db:
        telegram_id = str(update.effective_user.id)
        
        if link_value:
            # Try to find user by username
            result = await db.execute(select(User).where(User.username == link_value))
            web_user = result.scalar_one_or_none()
            
            if not web_user:
                await update.message.reply_text(f"❌ User '{link_value}' not found. Please check your username.")
                return
            
            # Update telegram user
            t_result = await db.execute(
                select(TelegramUser).where(TelegramUser.telegram_id == telegram_id)
            )
            t_user = t_result.scalar_one_or_none()
            
            if t_user:
                t_user.user_id = web_user.id
                t_user.is_linked = True
                await db.flush()
                
                await update.message.reply_text(
                    f"✅ Successfully linked to *{web_user.full_name}*!\n\n"
                    f"Now leads you create from Telegram will be assigned to you.",
                    parse_mode=ParseMode.MARKDOWN
                )
        else:
            # Show link instructions
            await update.message.reply_text(
                "🔗 *Link Your Account*\n\n"
                "Use: `/link <your_username>`\n\n"
                "Example: `/link john_doe`\n\n"
                "Your username can be found in the web app Settings page.",
                parse_mode=ParseMode.MARKDOWN
            )

async def profile(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show user profile"""
    async with AsyncSessionLocal() as db:
        telegram_id = str(update.effective_user.id)
        linked_user = await get_linked_user(db, telegram_id)
        
        if linked_user:
            profile_text = f"""
👤 *Your Profile*

*Name:* {linked_user.full_name}
*Username:* {linked_user.username}
*Role:* {linked_user.role}
*Status:* ✅ Linked
"""
        else:
            profile_text = """
👤 *Your Profile*

*Status:* ❌ Not linked
Use /link <username> to connect your web account.
"""
        
        await update.message.reply_text(profile_text, parse_mode=ParseMode.MARKDOWN)

# ========== Dashboard ==========

async def dashboard(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show dashboard statistics"""
    query = update.callback_query
    if query:
        await query.answer()
    
    async with AsyncSessionLocal() as db:
        telegram_id = str(update.effective_user.id)
        linked_user = await get_linked_user(db, telegram_id)
        
        user_id = linked_user.id if linked_user else None
        stats = await LeadCRUD.get_dashboard_stats(db, user_id=user_id)
        
        dashboard_text = f"""
📊 *Dashboard Overview*

*Total Leads:* {stats['total_leads']}
├─ 🆕 New: {stats['new_leads']}
├─ 📞 Contacted: {stats['contacted_leads']}
└─ ✅ Closed: {stats['closed_leads']}

📈 *Conversion Rate:* {stats['conversion_rate']}%
💰 *Total Value:* ${stats['total_value']:,.2f}

📅 *This Week:* {stats['leads_this_week']} new leads
📅 *This Month:* {stats['leads_this_month']} new leads
"""
        
        if linked_user:
            dashboard_text += f"\n👤 *Viewing:* {linked_user.full_name}'s leads"
        
        keyboard = [
            [InlineKeyboardButton("➕ Add Lead", callback_data="start_addlead"),
             InlineKeyboardButton("📋 View Leads", callback_data="leads")],
            [InlineKeyboardButton("🔄 Refresh", callback_data="dashboard")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        if query:
            await query.edit_message_text(dashboard_text, reply_markup=reply_markup, parse_mode=ParseMode.MARKDOWN)
        else:
            await update.message.reply_text(dashboard_text, reply_markup=reply_markup, parse_mode=ParseMode.MARKDOWN)

# ========== Lead Management ==========

async def view_leads(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """View recent leads"""
    query = update.callback_query
    if query:
        await query.answer()
    
    async with AsyncSessionLocal() as db:
        telegram_id = str(update.effective_user.id)
        linked_user = await get_linked_user(db, telegram_id)
        
        from app.schemas import LeadFilter
        filter_obj = LeadFilter(sort_by="created_at", sort_order="desc")
        
        # If linked, show only their leads
        if linked_user:
            filter_obj.assigned_to = [linked_user.id]
        
        leads, total = await LeadCRUD.get_leads_with_filters(db, filter_obj, skip=0, limit=10)
        
        if not leads:
            message_text = "📋 No leads found. Use /addlead to create one!"
            if query:
                await query.edit_message_text(message_text)
            else:
                await update.message.reply_text(message_text)
            return
        
        leads_text = "📋 *Recent Leads*\n\n"
        for lead in leads:
            status_emoji = "🆕" if lead.status == "new" else "📞" if lead.status == "contacted" else "✅"
            leads_text += f"{status_emoji} *{lead.name}* (ID: {lead.id})\n"
            leads_text += f"   Status: {lead.status} | Source: {lead.source or 'N/A'}\n"
            if lead.email:
                leads_text += f"   📧 {lead.email}\n"
            leads_text += "\n"
        
        if linked_user:
            leads_text += f"👤 Showing {linked_user.full_name}'s leads"
        
        keyboard = [
            [InlineKeyboardButton("➕ Add Lead", callback_data="start_addlead"),
             InlineKeyboardButton("🔄 Refresh", callback_data="leads")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        if len(leads_text) > 4000:
            leads_text = leads_text[:4000] + "..."
        
        if query:
            await query.edit_message_text(leads_text, reply_markup=reply_markup, parse_mode=ParseMode.MARKDOWN)
        else:
            await update.message.reply_text(leads_text, reply_markup=reply_markup, parse_mode=ParseMode.MARKDOWN)

async def update_lead_status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Update lead status"""
    if len(context.args) < 2:
        await update.message.reply_text(
            "Usage: /update <lead_id> <status>\n"
            "Status: new, contacted, closed\n"
            "Example: /update 1 contacted"
        )
        return
    
    try:
        lead_id = int(context.args[0])
        new_status = context.args[1].lower()
    except ValueError:
        await update.message.reply_text("Invalid lead ID.")
        return
    
    if new_status not in ['new', 'contacted', 'closed']:
        await update.message.reply_text("Invalid status. Use: new, contacted, or closed")
        return
    
    async with AsyncSessionLocal() as db:
        status_update = LeadStatusUpdate(status=new_status, performed_by="telegram_bot")
        lead = await LeadCRUD.update_lead_status(db, lead_id, status_update)
        
        if not lead:
            await update.message.reply_text(f"❌ Lead with ID {lead_id} not found.")
            return
        
        status_emoji = "🆕" if new_status == "new" else "📞" if new_status == "contacted" else "✅"
        await update.message.reply_text(
            f"{status_emoji} *{lead.name}* status updated to *{new_status}*",
            parse_mode=ParseMode.MARKDOWN
        )

async def delete_lead_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Delete a lead"""
    if not context.args:
        await update.message.reply_text("Usage: /delete <lead_id>")
        return
    
    try:
        lead_id = int(context.args[0])
    except ValueError:
        await update.message.reply_text("Invalid lead ID.")
        return
    
    async with AsyncSessionLocal() as db:
        lead = await LeadCRUD.get_lead(db, lead_id)
        if not lead:
            await update.message.reply_text(f"❌ Lead with ID {lead_id} not found.")
            return
        
        lead_name = lead.name
        success = await LeadCRUD.delete_lead(db, lead_id, performed_by="telegram_bot")
        
        if success:
            await update.message.reply_text(f"✅ Lead *{lead_name}* deleted.", parse_mode=ParseMode.MARKDOWN)
        else:
            await update.message.reply_text("❌ Failed to delete lead.")

# ========== Add Lead Conversation ==========

async def start_add_lead(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Start the add lead conversation"""
    query = update.callback_query
    if query:
        await query.answer()
        await query.edit_message_text(
            "Let's add a new lead! 📝\n\nWhat's the lead's *name*?\n(or /cancel to abort)",
            parse_mode=ParseMode.MARKDOWN
        )
        return NAME
    
    await update.message.reply_text(
        "Let's add a new lead! 📝\n\nWhat's the lead's *name*?\n(or /cancel to abort)",
        parse_mode=ParseMode.MARKDOWN
    )
    return NAME

async def get_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Get lead name"""
    context.user_data['name'] = update.message.text
    await update.message.reply_text(
        "Great! What's the *email*?\n(type 'skip' to skip)",
        parse_mode=ParseMode.MARKDOWN
    )
    return EMAIL

async def get_email(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Get lead email"""
    email = update.message.text
    if email.lower() != 'skip':
        context.user_data['email'] = email
    
    await update.message.reply_text(
        "What's the *phone number*?\n(type 'skip' to skip)",
        parse_mode=ParseMode.MARKDOWN
    )
    return PHONE

async def get_phone(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Get lead phone"""
    phone = update.message.text
    if phone.lower() != 'skip':
        context.user_data['phone'] = phone
    
    await update.message.reply_text(
        "Where did this lead come from? (*source*)\n(website, referral, telegram, etc. or type 'skip')"
    )
    return SOURCE

async def get_source(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Get lead source"""
    source = update.message.text
    if source.lower() != 'skip':
        context.user_data['source'] = source
    else:
        context.user_data['source'] = 'telegram'
    
    await update.message.reply_text(
        "Any *notes* for this lead?\n(type 'skip' to skip)",
        parse_mode=ParseMode.MARKDOWN
    )
    return NOTES

async def get_notes(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Get lead notes and save"""
    notes = update.message.text
    if notes.lower() != 'skip':
        context.user_data['notes'] = notes
    
    telegram_id = str(update.effective_user.id)
    
    # Create lead
    lead_data = LeadCreate(
        name=context.user_data['name'],
        email=context.user_data.get('email'),
        phone=context.user_data.get('phone'),
        source=context.user_data.get('source', 'telegram'),
        notes=context.user_data.get('notes')
    )
    
    async with AsyncSessionLocal() as db:
        # Check if linked to a web user
        linked_user = await get_linked_user(db, telegram_id)
        
        # Create lead with telegram ID
        lead_dict = lead_data.model_dump(exclude={'tag_ids'})
        lead = Lead(**lead_dict)
        lead.created_by_telegram_id = telegram_id
        
        # If linked, assign to that user
        if linked_user:
            lead.assigned_to = linked_user.id
        
        db.add(lead)
        await db.flush()
        await db.refresh(lead)
        
        # Log activity
        from app.crud import LeadCRUD
        await LeadCRUD._log_activity(
            db, lead.id, "created", None, lead.status,
            "telegram_bot", f"Lead created via Telegram by {update.effective_user.first_name}",
            user_id=linked_user.id if linked_user else None
        )
        
        assigned_text = f"\n👤 *Assigned to:* {linked_user.full_name}" if linked_user else "\n⚠️ *Not assigned* - Use /link to connect your account"
        
        success_text = f"""
✅ *Lead Created Successfully!*

*Name:* {lead.name}
*Email:* {lead.email or 'N/A'}
*Phone:* {lead.phone or 'N/A'}
*Source:* {lead.source or 'telegram'}
*Status:* new
*ID:* {lead.id}{assigned_text}
"""
        await update.message.reply_text(success_text, parse_mode=ParseMode.MARKDOWN)
    
    # Clear user data
    context.user_data.clear()
    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Cancel the conversation"""
    await update.message.reply_text("❌ Lead creation cancelled.")
    context.user_data.clear()
    return ConversationHandler.END

# ========== Callback Query Handler ==========

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle button presses"""
    query = update.callback_query
    await query.answer()
    
    if query.data == "dashboard":
        await dashboard(update, context)
    elif query.data == "start_addlead":
        # Return to trigger the conversation
        return await start_add_lead(update, context)
    elif query.data == "leads":
        await view_leads(update, context)
    elif query.data == "stats":
        await stats_callback(update, context)
    elif query.data == "link":
        await link_account(update, context)

async def stats_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show stats from callback"""
    query = update.callback_query
    
    async with AsyncSessionLocal() as db:
        telegram_id = str(update.effective_user.id)
        linked_user = await get_linked_user(db, telegram_id)
        user_id = linked_user.id if linked_user else None
        stats = await LeadCRUD.get_dashboard_stats(db, user_id=user_id)
        
        stats_text = f"""
📈 *Quick Statistics*

📊 Total: {stats['total_leads']} | New: {stats['new_leads']} | Closed: {stats['closed_leads']}
📈 Conversion: {stats['conversion_rate']}%
💰 Value: ${stats['total_value']:,.2f}
📅 This Week: {stats['leads_this_week']} | This Month: {stats['leads_this_month']}
"""
        keyboard = [[InlineKeyboardButton("🔄 Refresh", callback_data="stats")]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(stats_text, reply_markup=reply_markup, parse_mode=ParseMode.MARKDOWN)

# ========== Bot Setup ==========

def create_bot():
    """Create and configure the bot application"""
    token = settings.TELEGRAM_BOT_TOKEN
    
    if not token or token == "YOUR_BOT_TOKEN_HERE":
        print("⚠️ Telegram bot token not configured. Bot will not start.")
        return None
    
    app = Application.builder().token(token).build()
    
    # Command handlers
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("dashboard", dashboard))
    app.add_handler(CommandHandler("stats", stats_callback))
    app.add_handler(CommandHandler("leads", view_leads))
    app.add_handler(CommandHandler("update", update_lead_status))
    app.add_handler(CommandHandler("delete", delete_lead_command))
    app.add_handler(CommandHandler("link", link_account))
    app.add_handler(CommandHandler("profile", profile))
    
    # Conversation handler for adding leads
    conv_handler = ConversationHandler(
        entry_points=[
            CommandHandler("addlead", start_add_lead),
        ],
        states={
            NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_name)],
            EMAIL: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_email)],
            PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_phone)],
            SOURCE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_source)],
            NOTES: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_notes)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )
    app.add_handler(conv_handler)
    
    # Callback query handler
    app.add_handler(CallbackQueryHandler(button_handler))
    
    return app