from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.modules.pricing_kb_ai.enums import PresetMode, SchemaStatus


class NomenclatureAttributePreset(Base):
    __tablename__ = "nomenclature_attribute_presets"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    json_schema: Mapped[dict] = mapped_column(JSONB, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(20), default=SchemaStatus.PUBLISHED)
    description: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    schemas: Mapped[List["ClassSchemaPreset"]] = relationship(
        back_populates="preset", lazy="noload"
    )


class NomenclatureClassSchema(Base):
    __tablename__ = "nomenclature_class_schema"

    id: Mapped[int] = mapped_column(primary_key=True)
    node_id: Mapped[int] = mapped_column(
        ForeignKey("nomenclature_nodes.id"), index=True
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[SchemaStatus] = mapped_column(
        String(20), default=SchemaStatus.DRAFT, index=True
    )
    json_schema: Mapped[dict] = mapped_column(JSONB, nullable=False)
    meta: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    comment: Mapped[Optional[str]] = mapped_column(Text)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    node: Mapped["NomenclatureNode"] = relationship(
        back_populates="schemas", lazy="joined"
    )
    presets: Mapped[List["ClassSchemaPreset"]] = relationship(
        back_populates="schema", cascade="all, delete-orphan", lazy="selectin"
    )
    revisions: Mapped[List["ClassAttributeRevision"]] = relationship(
        "ClassAttributeRevision",
        back_populates="schema",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = ({"sqlite_autoincrement": True},)


class ClassSchemaPreset(Base):
    __tablename__ = "class_schema_presets"

    class_schema_id: Mapped[int] = mapped_column(
        ForeignKey("nomenclature_class_schema.id", ondelete="CASCADE"), primary_key=True
    )
    preset_id: Mapped[int] = mapped_column(
        ForeignKey("nomenclature_attribute_presets.id", ondelete="CASCADE"),
        primary_key=True,
    )
    mode: Mapped[PresetMode] = mapped_column(String(10), default=PresetMode.INCLUDE)

    schema: Mapped[NomenclatureClassSchema] = relationship(
        back_populates="presets", lazy="joined"
    )
    preset: Mapped[NomenclatureAttributePreset] = relationship(
        back_populates="schemas", lazy="joined"
    )


class ClassAttributeRevision(Base):
    __tablename__ = "class_attribute_revisions"

    id: Mapped[int] = mapped_column(primary_key=True)
    schema_id: Mapped[int] = mapped_column(
        ForeignKey("nomenclature_class_schema.id", ondelete="CASCADE"), index=True
    )
    node_id: Mapped[int] = mapped_column(index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    diff_payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    author_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    schema: Mapped[NomenclatureClassSchema] = relationship(
        back_populates="revisions", lazy="joined"
    )
