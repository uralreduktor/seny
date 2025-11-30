from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field


class NomenclatureBase(BaseModel):
    name: str
    type: Optional[str] = None
    category: Optional[str] = None
    subclass: Optional[str] = None
    manufacturer: Optional[str] = None
    standard_document: Optional[str] = None
    article: Optional[str] = None

    standard_parameters: Dict[str, Any] = Field(default_factory=dict)
    required_parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    optional_parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

    base_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    price_currency: str = "RUB"
    price_source: Optional[str] = None
    price_valid_until: Optional[datetime] = None

    synonyms: Optional[Dict[str, Any]] = Field(default_factory=dict)
    keywords: Optional[Dict[str, Any]] = Field(default_factory=dict)
    tags: Optional[Dict[str, Any]] = Field(default_factory=dict)

    node_id: Optional[int] = None


class NomenclatureCreate(NomenclatureBase):
    code: Optional[str] = None


class NomenclatureUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    subclass: Optional[str] = None
    manufacturer: Optional[str] = None
    standard_document: Optional[str] = None
    article: Optional[str] = None
    standard_parameters: Optional[Dict[str, Any]] = None
    required_parameters: Optional[Dict[str, Any]] = None
    optional_parameters: Optional[Dict[str, Any]] = None
    base_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    price_currency: Optional[str] = None
    price_source: Optional[str] = None
    price_valid_until: Optional[datetime] = None
    synonyms: Optional[Dict[str, Any]] = None
    keywords: Optional[Dict[str, Any]] = None
    tags: Optional[Dict[str, Any]] = None
    node_id: Optional[int] = None


class NomenclatureResponse(NomenclatureBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    lifecycle_status: str
    usage_count: int
    average_price: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime
