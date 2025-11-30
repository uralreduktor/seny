from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.modules.pricing_kb_ai.enums import NodeStatus, NodeType, SchemaStatus


class NomenclatureNodeBase(BaseModel):
    code: str
    name: str
    node_type: NodeType
    parent_id: Optional[int] = None


class NomenclatureNodeCreate(NomenclatureNodeBase):
    pass


class NomenclatureNodeUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[NodeStatus] = None
    effective_to: Optional[datetime] = None
    metadata: Optional[dict] = None


class NomenclatureNodeResponse(NomenclatureNodeBase):
    id: int
    depth: int
    version: int
    status: NodeStatus
    is_archived: bool
    effective_from: datetime
    effective_to: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AttributePreset(BaseModel):
    id: int
    code: str
    title: str
    version: int

    model_config = ConfigDict(from_attributes=True)


class ClassSchemaVersion(BaseModel):
    id: int
    node_id: int
    version: int
    status: SchemaStatus
    json_schema: dict
    metadata: dict = Field(default_factory=dict, validation_alias="meta")
    presets: list[AttributePreset]
    comment: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClassSchemaDraft(BaseModel):
    json_schema: dict
    presets: list[int] = Field(default_factory=list)
    comment: Optional[str] = None


class ClassSchemaDiff(BaseModel):
    node_id: int
    version: int
    created_at: datetime
    diff: dict

    model_config = ConfigDict(from_attributes=True)
