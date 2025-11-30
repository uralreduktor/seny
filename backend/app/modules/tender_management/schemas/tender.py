from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.modules.tender_management.enums import TenderSource
from app.modules.tender_management.schemas.position import PositionResponse
from app.modules.tender_management.schemas.stage import StageResponse


class TenderFileResponse(BaseModel):
    id: int
    filename: str
    category: str
    uploaded_by_id: int
    uploaded_at: datetime
    is_archived: bool
    archived_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TenderBase(BaseModel):
    number: str
    title: str
    customer: str
    description: Optional[str] = None
    source: TenderSource = TenderSource.MANUAL
    source_url: Optional[str] = None
    deadline_at: datetime
    published_at: Optional[datetime] = None
    initial_max_price: Optional[Decimal] = None
    currency: str = "RUB"
    terms: Optional[dict] = {}
    responsible_id: Optional[int] = None
    engineer_id: Optional[int] = None


class TenderCreate(TenderBase):
    pass


class TenderUpdate(BaseModel):
    title: Optional[str] = None
    customer: Optional[str] = None
    description: Optional[str] = None
    source_url: Optional[str] = None
    deadline_at: Optional[datetime] = None
    initial_max_price: Optional[Decimal] = None
    terms: Optional[dict] = None
    responsible_id: Optional[int] = None
    engineer_id: Optional[int] = None
    is_archived: Optional[bool] = None


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    details: dict
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TenderResponse(TenderBase):
    id: int
    stage_id: int
    stage: Optional[StageResponse] = None
    positions: List[PositionResponse] = []
    files: List[TenderFileResponse] = []
    audit_logs: List[AuditLogResponse] = []
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
