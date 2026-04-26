from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas import TagCreate, TagResponse
from app.crud import TagCRUD
from app.auth import get_current_active_user
from app.models import User

router = APIRouter(prefix="/api/tags", tags=["Tags"])

@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag: TagCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new tag"""
    new_tag = await TagCRUD.create_tag(db, tag)
    # Set leads_count to 0 for new tag
    setattr(new_tag, 'leads_count', 0)
    return new_tag

@router.get("/", response_model=List[TagResponse])
async def get_tags(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all tags"""
    return await TagCRUD.get_all_tags(db)

@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a tag"""
    success = await TagCRUD.delete_tag(db, tag_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    return {"message": "Tag deleted successfully"}