from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import DashboardStats, DashboardTrend, SourcePerformance, UserPerformance, LeadAgingReport
from app.crud import LeadCRUD
from app.auth import get_current_active_user
from app.models import User

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard statistics"""
    return await LeadCRUD.get_dashboard_stats(db)

@router.get("/trends", response_model=list[DashboardTrend])
async def get_dashboard_trends(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard trends"""
    return await LeadCRUD.get_trends(db, days)

@router.get("/source-performance", response_model=list[SourcePerformance])
async def get_source_performance(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get lead performance by source"""
    return await LeadCRUD.get_source_performance(db)

@router.get("/user-performance", response_model=list[UserPerformance])
async def get_user_performance(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user performance metrics"""
    return await LeadCRUD.get_user_performance(db)

@router.get("/lead-aging", response_model=list[LeadAgingReport])
async def get_lead_aging(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get lead aging report"""
    return await LeadCRUD.get_lead_aging_report(db)