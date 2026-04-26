from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from app.database import get_db
from app.schemas import (
    LeadCreate, LeadUpdate, LeadStatusUpdate, LeadFilter,
    LeadResponse, LeadListResponse, ActivityLogResponse,
    BulkStatusUpdate, BulkDelete, BulkAssign, BulkTagUpdate,
    CommentCreate, CommentResponse, LeadTagUpdate
)
from app.crud import LeadCRUD, CommentCRUD
from app.auth import get_current_active_user
from app.models import User
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/leads", tags=["Leads"])

@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead: LeadCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new lead"""
    return await LeadCRUD.create_lead(db, lead, user_id=current_user.id)

@router.post("/list", response_model=LeadListResponse)
async def get_leads(
    filters: LeadFilter,
    page: int = Query(1, ge=1),
    page_size: int = Query(settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get leads with advanced filtering"""
    skip = (page - 1) * page_size
    leads, total = await LeadCRUD.get_leads_with_filters(
        db, filters, skip=skip, limit=page_size
    )
    
    total_pages = max(1, (total + page_size - 1) // page_size)
    
    return LeadListResponse(
        leads=leads,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific lead"""
    lead = await LeadCRUD.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead

@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    lead_update: LeadUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update lead"""
    lead = await LeadCRUD.update_lead(db, lead_id, lead_update, user_id=current_user.id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead

@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a lead"""
    success = await LeadCRUD.delete_lead(db, lead_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return {"message": "Lead deleted successfully"}

@router.patch("/{lead_id}/status", response_model=LeadResponse)
async def update_lead_status(
    lead_id: int,
    status_update: LeadStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update lead status"""
    lead = await LeadCRUD.update_lead_status(db, lead_id, status_update, user_id=current_user.id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead

@router.patch("/{lead_id}/tags", response_model=LeadResponse)
async def update_lead_tags(
    lead_id: int,
    tag_update: LeadTagUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update lead tags"""
    lead = await LeadCRUD.update_lead_tags(db, lead_id, tag_update.tag_ids, user_id=current_user.id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


# Bulk Operations
@router.post("/bulk/status", response_model=dict)
async def bulk_update_status(
    bulk_update: BulkStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Bulk update status"""
    count = await LeadCRUD.bulk_update_status(
        db, bulk_update.lead_ids, bulk_update.status.value, user_id=current_user.id
    )
    return {"message": f"Updated {count} leads", "count": count}

@router.post("/bulk/delete", response_model=dict)
async def bulk_delete(
    bulk_delete: BulkDelete,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Bulk delete leads"""
    count = await LeadCRUD.bulk_delete(db, bulk_delete.lead_ids, user_id=current_user.id)
    return {"message": f"Deleted {count} leads", "count": count}

@router.post("/bulk/assign", response_model=dict)
async def bulk_assign(
    bulk_assign: BulkAssign,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Bulk assign leads"""
    try:
        count = await LeadCRUD.bulk_assign(
            db, bulk_assign.lead_ids, bulk_assign.assigned_to, user_id=current_user.id
        )
        return {"message": f"Assigned {count} leads", "count": count}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# Comments
@router.post("/{lead_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    lead_id: int,
    comment: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a comment to a lead"""
    # Check if lead exists
    lead = await LeadCRUD.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    
    return await CommentCRUD.add_comment(db, lead_id, current_user.id, comment)

@router.get("/{lead_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    lead_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all comments for a lead"""
    return await CommentCRUD.get_lead_comments(db, lead_id)

# Activities
@router.get("/activities/recent", response_model=List[ActivityLogResponse])
async def get_recent_activities(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get recent activities"""
    return await LeadCRUD.get_recent_activities(db, limit)