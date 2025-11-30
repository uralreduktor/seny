from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.modules.tender_management.enums import PositionStatus


class PositionBase(BaseModel):
    name: str
    description: Optional[str] = None
    quantity: Decimal = Field(default=1.0, ge=0)
    unit: str = "шт"
    nomenclature_id: Optional[int] = None
    technical_requirements: Optional[dict] = None
    price_per_unit: Optional[Decimal] = None
    total_price: Optional[Decimal] = None
    currency: str = "RUB"


class PositionCreate(PositionBase):
    pass


class PositionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    nomenclature_id: Optional[int] = None
    technical_requirements: Optional[dict] = None
    status: Optional[PositionStatus] = None
    price_per_unit: Optional[Decimal] = None
    total_price: Optional[Decimal] = None


class PositionResponse(PositionBase):
    id: int
    tender_id: int
    status: PositionStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
