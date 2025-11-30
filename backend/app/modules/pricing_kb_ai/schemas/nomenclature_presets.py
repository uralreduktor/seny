from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AttributePresetBase(BaseModel):
    code: str
    title: str
    description: Optional[str] = None
    json_schema: dict
    version: int = 1


class AttributePresetCreate(AttributePresetBase):
    pass


class AttributePresetUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    json_schema: Optional[dict] = None
    version: Optional[int] = None
    status: Optional[str] = None


class AttributePresetResponse(AttributePresetBase):
    id: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
