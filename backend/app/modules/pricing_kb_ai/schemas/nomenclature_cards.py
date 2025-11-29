from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.modules.pricing_kb_ai.enums import LifecycleStatus


class CardFile(BaseModel):
    type: str
    storage_key: str
    hash: Optional[str] = None
    source: Optional[str] = None
    uploaded_at: Optional[datetime] = None


class CardFileInput(CardFile):
    file_token: Optional[str] = Field(
        default=None, description="Временный ключ файла из файлового сервиса"
    )


class CardSynonym(BaseModel):
    value: str
    locale: str = "ru-RU"


class CardUsage(BaseModel):
    position_id: int
    tender_id: Optional[int] = None
    tender_number: Optional[str] = None
    usage_count: int
    average_price: Optional[Decimal] = None
    last_used_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CardAuditMeta(BaseModel):
    created_by: Optional[str] = None
    created_at: datetime
    last_editor_id: Optional[str] = None
    last_reviewed_at: Optional[datetime] = None


class NomenclatureCardBase(BaseModel):
    node_id: Optional[int] = None
    canonical_name: str
    node_version: Optional[int] = None
    code: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    subclass: Optional[str] = None
    attributes_payload: Dict[str, Any] = Field(default_factory=dict)
    files: List[CardFileInput] = Field(default_factory=list)
    methodology_ids: List[int] = Field(default_factory=list)
    synonyms: List[CardSynonym] = Field(default_factory=list)
    manufacturer: Optional[str] = None
    standard_document: Optional[str] = None
    article: Optional[str] = None
    base_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    price_currency: str = "RUB"
    price_source: Optional[str] = None
    price_valid_until: Optional[datetime] = None
    tags: Dict[str, Any] = Field(default_factory=dict)


class NomenclatureCardCreate(NomenclatureCardBase):
    node_id: int


class NomenclatureCardUpdate(BaseModel):
    canonical_name: Optional[str] = None
    attributes_payload: Optional[Dict[str, Any]] = None
    files: Optional[List[CardFileInput]] = None
    methodology_ids: Optional[List[int]] = None
    synonyms: Optional[List[CardSynonym]] = None
    manufacturer: Optional[str] = None
    standard_document: Optional[str] = None
    article: Optional[str] = None
    base_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    price_currency: Optional[str] = None
    price_source: Optional[str] = None
    price_valid_until: Optional[datetime] = None
    lifecycle_reason: Optional[str] = None


class NomenclatureCard(NomenclatureCardBase):
    id: int
    lifecycle_status: LifecycleStatus
    lifecycle_reason: Optional[str] = None
    effective_from: datetime
    effective_to: Optional[datetime] = None
    usage_count: int
    average_price: Optional[Decimal] = None
    version: int
    audit: CardAuditMeta
    position_usage: List[CardUsage] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class CardLifecycleChange(BaseModel):
    target_status: LifecycleStatus
    reason: Optional[str] = None
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    pages: int


class PaginatedCards(BaseModel):
    items: List[NomenclatureCard]
    meta: PaginationMeta


class CardVersion(BaseModel):
    id: int
    version: int
    diff_payload: Dict[str, Any]
    status: str
    author_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BulkOperationResult(BaseModel):
    card_id: int
    status: Literal["updated", "not_found", "skipped", "error"]
    message: Optional[str] = None


class BulkLifecycleRequest(BaseModel):
    card_ids: List[int] = Field(..., min_length=1)
    change: CardLifecycleChange


class BulkMethodologyRequest(BaseModel):
    card_ids: List[int] = Field(..., min_length=1)
    methodology_ids: List[int] = Field(default_factory=list)
    mode: Literal["replace", "append", "remove"] = "replace"
