from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

# Enums
class LeadStatusEnum(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    CLOSED = "closed"

class PriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

# ========== User Schemas ==========
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
   

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ========== Tag Schemas ==========
class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(default="#808080", pattern="^#[0-9A-Fa-f]{6}$")

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int
    created_at: datetime
    leads_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# ========== Comment Schemas ==========
class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    lead_id: int
    user_id: int
    user_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ========== Lead Schemas ==========
class LeadBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    source: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.MEDIUM
    value: Optional[float] = Field(None, ge=0)
    company: Optional[str] = Field(None, max_length=100)

class LeadCreate(LeadBase):
    assigned_to: Optional[int] = None
    tag_ids: Optional[List[int]] = []

class LeadUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    source: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    value: Optional[float] = Field(None, ge=0)
    company: Optional[str] = Field(None, max_length=100)
    assigned_to: Optional[int] = None

class LeadStatusUpdate(BaseModel):
    status: LeadStatusEnum
    performed_by: str = Field(default="web")

class LeadTagUpdate(BaseModel):
    tag_ids: List[int]

class LeadResponse(LeadBase):
    id: int
    status: str
    assigned_to: Optional[int] = None
    assigned_user_name: Optional[str] = None
    last_contacted_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    tags: List[TagResponse] = []
    recent_comments: Optional[List[CommentResponse]] = []
    
    class Config:
        from_attributes = True

class LeadListResponse(BaseModel):
    leads: List[LeadResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ========== Bulk Operations ==========
class BulkStatusUpdate(BaseModel):
    lead_ids: List[int]
    status: LeadStatusEnum

class BulkDelete(BaseModel):
    lead_ids: List[int]

class BulkAssign(BaseModel):
    lead_ids: List[int]
    assigned_to: int

class BulkTagUpdate(BaseModel):
    lead_ids: List[int]
    tag_ids: List[int]

# ========== Dashboard Schemas ==========
class DashboardStats(BaseModel):
    total_leads: int
    new_leads: int
    contacted_leads: int
    closed_leads: int
    conversion_rate: float
    leads_this_week: int
    leads_this_month: int
    average_value: float
    total_value: float

class SourcePerformance(BaseModel):
    source: str
    total_leads: int
    converted_leads: int
    conversion_rate: float

class UserPerformance(BaseModel):
    user_id: int
    user_name: str
    total_leads: int
    converted_leads: int
    conversion_rate: float

class DashboardTrend(BaseModel):
    date: str
    new_leads: int
    contacted_leads: int
    closed_leads: int

class LeadAgingReport(BaseModel):
    status: str
    count: int
    average_days: float

# ========== Filter Schemas ==========
class LeadFilter(BaseModel):
    status: Optional[List[LeadStatusEnum]] = None
    priority: Optional[List[PriorityEnum]] = None
    source: Optional[List[str]] = None
    assigned_to: Optional[List[int]] = None
    tag_ids: Optional[List[int]] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "created_at"  # created_at, name, status, priority
    sort_order: Optional[str] = "desc"  # asc, desc

class ActivityLogResponse(BaseModel):
    id: int
    lead_id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action: str
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    performed_by: str
    details: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True