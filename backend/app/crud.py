from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, case, distinct
from sqlalchemy.orm import joinedload, selectinload
from typing import Optional, List, Tuple
from datetime import datetime, timedelta

from app.models import Lead, LeadStatus, ActivityLog, User, Tag, Comment, lead_tags
from app.schemas import (
    LeadCreate, LeadUpdate, LeadStatusUpdate, LeadFilter,
    UserCreate, TagCreate, CommentCreate
)
from app.auth import get_password_hash


class UserCRUD:
    @staticmethod
    async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
        """Create a new user"""
        hashed_password = get_password_hash(user_data.password)
        user = User(
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
        """Get user by username"""
        result = await db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        """Get user by ID"""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all_users(db: AsyncSession) -> List[User]:
        """Get all users"""
        result = await db.execute(select(User).order_by(User.full_name))
        return result.scalars().all()


class TagCRUD:
    @staticmethod
    async def create_tag(db: AsyncSession, tag_data: TagCreate) -> Tag:
        """Create a new tag"""
        tag = Tag(**tag_data.model_dump())
        db.add(tag)
        await db.flush()
        await db.refresh(tag)
        setattr(tag, 'leads_count', 0)
        return tag

    @staticmethod
    async def get_all_tags(db: AsyncSession) -> List[Tag]:
        """Get all tags with lead counts"""
        query = select(
            Tag,
            func.count(lead_tags.c.lead_id).label('leads_count')
        ).outerjoin(
            lead_tags, Tag.id == lead_tags.c.tag_id
        ).group_by(Tag.id).order_by(Tag.name)

        result = await db.execute(query)
        tags_with_counts = []
        for row in result:
            tag = row[0]
            setattr(tag, 'leads_count', row.leads_count or 0)
            tags_with_counts.append(tag)
        return tags_with_counts

    @staticmethod
    async def get_tag_by_id(db: AsyncSession, tag_id: int) -> Optional[Tag]:
        """Get tag by ID"""
        result = await db.execute(select(Tag).where(Tag.id == tag_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def delete_tag(db: AsyncSession, tag_id: int) -> bool:
        """Delete a tag"""
        tag = await TagCRUD.get_tag_by_id(db, tag_id)
        if not tag:
            return False
        await db.delete(tag)
        await db.flush()
        return True


class CommentCRUD:
    @staticmethod
    async def add_comment(db: AsyncSession, lead_id: int, user_id: int, comment_data: CommentCreate) -> Comment:
        """Add a comment to a lead"""
        comment = Comment(
            lead_id=lead_id,
            user_id=user_id,
            content=comment_data.content
        )
        db.add(comment)
        await db.flush()
        await db.refresh(comment, ['user'])
        return comment

    @staticmethod
    async def get_lead_comments(db: AsyncSession, lead_id: int) -> List[Comment]:
        """Get all comments for a lead"""
        result = await db.execute(
            select(Comment)
            .options(joinedload(Comment.user))
            .where(Comment.lead_id == lead_id)
            .order_by(Comment.created_at.desc())
        )
        return result.unique().scalars().all()


class LeadCRUD:
    @staticmethod
    async def create_lead(
        db: AsyncSession, 
        lead_data: LeadCreate, 
        performed_by: str = "web",
        user_id: Optional[int] = None
    ) -> Lead:
        """Create a new lead with tags"""
        lead_dict = lead_data.model_dump(exclude={'tag_ids'})
        lead = Lead(**lead_dict)
        
        if lead_data.tag_ids:
            tag_query = select(Tag).where(Tag.id.in_(lead_data.tag_ids))
            result = await db.execute(tag_query)
            tags = result.scalars().all()
            lead.tags = tags
        
        db.add(lead)
        await db.flush()
        
        await LeadCRUD._log_activity(
            db, lead.id, "created", None, lead.status, 
            performed_by, f"Lead created: {lead.name}", user_id
        )
        
        await db.refresh(lead, ['tags', 'assigned_user'])
        return lead

    @staticmethod
    async def get_lead(db: AsyncSession, lead_id: int) -> Optional[Lead]:
        """Get a single lead with all relationships"""
        result = await db.execute(
            select(Lead)
            .options(
                joinedload(Lead.tags),
                joinedload(Lead.assigned_user),
                selectinload(Lead.comments).joinedload(Comment.user)
            )
            .where(Lead.id == lead_id)
        )
        return result.unique().scalar_one_or_none()

    @staticmethod
    async def get_leads_with_filters(
        db: AsyncSession,
        filters: LeadFilter,
        skip: int = 0,
        limit: int = 50
    ) -> Tuple[List[Lead], int]:
        """Get leads with advanced filtering"""
        query = select(Lead).options(
            joinedload(Lead.tags),
            joinedload(Lead.assigned_user)
        )
        count_query = select(func.count(distinct(Lead.id)))
        
        conditions = []
        
        if filters.status:
            conditions.append(Lead.status.in_([s.value for s in filters.status]))
        if filters.priority:
            conditions.append(Lead.priority.in_([p.value for p in filters.priority]))
        if filters.source:
            conditions.append(Lead.source.in_(filters.source))
        if filters.assigned_to:
            conditions.append(Lead.assigned_to.in_(filters.assigned_to))
        if filters.tag_ids:
            query = query.join(lead_tags).where(lead_tags.c.tag_id.in_(filters.tag_ids))
            count_query = count_query.join(lead_tags).where(lead_tags.c.tag_id.in_(filters.tag_ids))
        if filters.created_after:
            conditions.append(Lead.created_at >= filters.created_after)
        if filters.created_before:
            conditions.append(Lead.created_at <= filters.created_before)
        if filters.search:
            search_term = f"%{filters.search}%"
            search_condition = or_(
                Lead.name.ilike(search_term),
                Lead.email.ilike(search_term),
                Lead.phone.ilike(search_term),
                Lead.company.ilike(search_term),
                Lead.notes.ilike(search_term)
            )
            conditions.append(search_condition)
        
        if conditions:
            where_clause = and_(*conditions)
            query = query.where(where_clause)
            count_query = count_query.where(where_clause)
        
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        sort_column = getattr(Lead, filters.sort_by, Lead.created_at)
        if filters.sort_order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())
        
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        leads = result.unique().scalars().all()
        
        return leads, total

    @staticmethod
    async def update_lead(
        db: AsyncSession,
        lead_id: int,
        lead_update: LeadUpdate,
        performed_by: str = "web",
        user_id: Optional[int] = None
    ) -> Optional[Lead]:
        """Update lead information"""
        result = await db.execute(select(Lead).where(Lead.id == lead_id))
        lead = result.scalar_one_or_none()
        
        if not lead:
            return None
        
        update_data = lead_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(lead, field, value)
        
        if 'status' in update_data and update_data.get('status') == LeadStatus.CONTACTED.value:
            lead.last_contacted_at = datetime.utcnow()
        
        await db.flush()
        
        await LeadCRUD._log_activity(
            db, lead.id, "updated", None, None, performed_by,
            f"Lead updated: {', '.join(update_data.keys())}", user_id
        )
        
        return await LeadCRUD.get_lead(db, lead_id)

    @staticmethod
    async def update_lead_status(
        db: AsyncSession,
        lead_id: int,
        status_update: LeadStatusUpdate,
        user_id: Optional[int] = None
    ) -> Optional[Lead]:
        """Update lead status"""
        result = await db.execute(select(Lead).where(Lead.id == lead_id))
        lead = result.scalar_one_or_none()
        
        if not lead:
            return None
        
        old_status = lead.status
        new_status = status_update.status.value
        lead.status = new_status
        
        if new_status == LeadStatus.CONTACTED.value:
            lead.last_contacted_at = datetime.utcnow()
        
        lead.updated_at = datetime.utcnow()
        
        await db.flush()
        
        await LeadCRUD._log_activity(
            db, lead.id, "status_changed", old_status, new_status,
            status_update.performed_by, 
            f"Status changed from {old_status} to {new_status}", user_id
        )
        
        return await LeadCRUD.get_lead(db, lead_id)

    @staticmethod
    async def delete_lead(
        db: AsyncSession, 
        lead_id: int, 
        performed_by: str = "web",
        user_id: Optional[int] = None
    ) -> bool:
        """Delete a lead"""
        result = await db.execute(select(Lead).where(Lead.id == lead_id))
        lead = result.scalar_one_or_none()
        
        if not lead:
            return False
        
        lead_name = lead.name
        lead_status = lead.status
        
        # Delete related activity logs
        activity_logs = (await db.execute(
            select(ActivityLog).where(ActivityLog.lead_id == lead_id)
        )).scalars().all()
        for log in activity_logs:
            await db.delete(log)
        
        await db.flush()
        await db.delete(lead)
        await db.flush()
        
        # Log deletion
        activity = ActivityLog(
            lead_id=None,
            user_id=user_id,
            action="deleted",
            old_status=lead_status,
            new_status=None,
            performed_by=performed_by,
            details=f"Lead deleted: {lead_name} (ID: {lead_id})"
        )
        db.add(activity)
        await db.flush()
        
        return True

    @staticmethod
    async def get_dashboard_stats(
        db: AsyncSession,
        user_id: Optional[int] = None
    ) -> dict:
        """Get dashboard statistics"""
        conditions = []
        if user_id:
            conditions.append(Lead.assigned_to == user_id)
        
        total_query = select(func.count(Lead.id))
        if conditions:
            total_query = total_query.where(and_(*conditions))
        total_result = await db.execute(total_query)
        total_leads = total_result.scalar() or 0
        
        status_counts = {}
        for status in LeadStatus:
            status_query = select(func.count(Lead.id)).where(Lead.status == status.value)
            if conditions:
                status_query = status_query.where(and_(*conditions))
            result = await db.execute(status_query)
            status_counts[status.value] = result.scalar() or 0
        
        conversion_rate = (status_counts.get('closed', 0) / total_leads * 100) if total_leads > 0 else 0
        
        week_ago = datetime.utcnow() - timedelta(days=7)
        month_ago = datetime.utcnow() - timedelta(days=30)
        
        week_query = select(func.count(Lead.id)).where(Lead.created_at >= week_ago)
        if conditions:
            week_query = week_query.where(and_(*conditions))
        week_result = await db.execute(week_query)
        
        month_query = select(func.count(Lead.id)).where(Lead.created_at >= month_ago)
        if conditions:
            month_query = month_query.where(and_(*conditions))
        month_result = await db.execute(month_query)
        
        value_query = select(
            func.coalesce(func.avg(Lead.value), 0),
            func.coalesce(func.sum(Lead.value), 0)
        )
        if conditions:
            value_query = value_query.where(and_(*conditions))
        value_result = await db.execute(value_query)
        avg_val, total_val = value_result.one()
        
        return {
            "total_leads": total_leads,
            "new_leads": status_counts.get('new', 0),
            "contacted_leads": status_counts.get('contacted', 0),
            "closed_leads": status_counts.get('closed', 0),
            "conversion_rate": round(conversion_rate, 2),
            "leads_this_week": week_result.scalar() or 0,
            "leads_this_month": month_result.scalar() or 0,
            "average_value": round(float(avg_val), 2),
            "total_value": round(float(total_val), 2)
        }

    @staticmethod
    async def get_source_performance(db: AsyncSession) -> list:
        """Get lead performance by source"""
        query = select(
            Lead.source,
            func.count(Lead.id).label('total'),
            func.sum(case((Lead.status == 'closed', 1), else_=0)).label('converted')
        ).where(Lead.source.isnot(None)).group_by(Lead.source)
        
        result = await db.execute(query)
        performance_data = []
        for row in result:
            total = row.total or 0
            converted = row.converted or 0
            performance_data.append({
                "source": row.source,
                "total_leads": total,
                "converted_leads": converted,
                "conversion_rate": round((converted / total * 100), 2) if total > 0 else 0
            })
        
        return sorted(performance_data, key=lambda x: x['total_leads'], reverse=True)

    @staticmethod
    async def get_user_performance(db: AsyncSession) -> list:
        """Get performance metrics per user"""
        query = select(
            User.id,
            User.full_name,
            func.count(Lead.id).label('total'),
            func.sum(case((Lead.status == 'closed', 1), else_=0)).label('converted')
        ).outerjoin(Lead, User.id == Lead.assigned_to).group_by(User.id, User.full_name)
        
        result = await db.execute(query)
        performance_data = []
        for row in result:
            total = row.total or 0
            converted = row.converted or 0
            performance_data.append({
                "user_id": row.id,
                "user_name": row.full_name,
                "total_leads": total,
                "converted_leads": converted,
                "conversion_rate": round((converted / total * 100), 2) if total > 0 else 0
            })
        
        return sorted(performance_data, key=lambda x: x['total_leads'], reverse=True)

    @staticmethod
    async def get_lead_aging_report(db: AsyncSession) -> list:
        """Get lead aging report"""
        current_time = datetime.utcnow()
        result = await db.execute(select(Lead))
        leads = result.scalars().all()
        
        aging_by_status = {}
        for lead in leads:
            status = lead.status
            if status not in aging_by_status:
                aging_by_status[status] = {'count': 0, 'total_days': 0}
            aging_by_status[status]['count'] += 1
            if lead.created_at:
                days = (current_time - lead.created_at).days
                aging_by_status[status]['total_days'] += days
        
        aging_data = []
        for status, data in aging_by_status.items():
            count = data['count']
            avg_days = data['total_days'] / count if count > 0 else 0
            aging_data.append({
                "status": status,
                "count": count,
                "average_days": round(float(avg_days), 1)
            })
        
        return aging_data

    @staticmethod
    async def get_trends(
        db: AsyncSession, 
        days: int = 30,
        user_id: Optional[int] = None
    ) -> list:
        """Get daily trends for dashboard charts"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = select(Lead).where(Lead.created_at >= start_date)
        if user_id:
            query = query.where(Lead.assigned_to == user_id)
        
        result = await db.execute(query)
        leads = result.scalars().all()
        
        date_map = {}
        d = start_date.date()
        today = datetime.utcnow().date()
        
        while d <= today:
            date_str = d.strftime('%Y-%m-%d')
            date_map[date_str] = {"new_leads": 0, "contacted_leads": 0, "closed_leads": 0}
            d += timedelta(days=1)
        
        for lead in leads:
            if lead.created_at:
                date_str = lead.created_at.strftime('%Y-%m-%d')
                if date_str in date_map:
                    if lead.status == LeadStatus.NEW.value:
                        date_map[date_str]["new_leads"] += 1
                    elif lead.status == LeadStatus.CONTACTED.value:
                        date_map[date_str]["contacted_leads"] += 1
                    elif lead.status == LeadStatus.CLOSED.value:
                        date_map[date_str]["closed_leads"] += 1
        
        trends = []
        for date_str in sorted(date_map.keys()):
            trends.append({
                "date": date_str,
                **date_map[date_str]
            })
        
        return trends

    @staticmethod
    async def get_recent_activities(
        db: AsyncSession, 
        limit: int = 10,
        user_id: Optional[int] = None
    ) -> List[ActivityLog]:
        """Get recent activity logs"""
        query = select(ActivityLog).options(
            joinedload(ActivityLog.user)
        ).order_by(ActivityLog.created_at.desc()).limit(limit)
        
        if user_id:
            query = query.where(ActivityLog.user_id == user_id)
        
        result = await db.execute(query)
        return result.unique().scalars().all()

    @staticmethod
    async def _log_activity(
        db: AsyncSession,
        lead_id: int,
        action: str,
        old_status: Optional[str],
        new_status: Optional[str],
        performed_by: str,
        details: Optional[str] = None,
        user_id: Optional[int] = None
    ):
        """Log an activity"""
        activity = ActivityLog(
            lead_id=lead_id,
            user_id=user_id,
            action=action,
            old_status=old_status,
            new_status=new_status,
            performed_by=performed_by,
            details=details
        )
        db.add(activity)
        await db.flush()