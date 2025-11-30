from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.modules.pricing_kb_ai.enums import LifecycleStatus


class Nomenclature(Base):
    __tablename__ = "nomenclatures"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    canonical_name: Mapped[str] = mapped_column(String(255), nullable=False)
    node_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("nomenclature_nodes.id", ondelete="SET NULL"), index=True
    )
    node_version: Mapped[int] = mapped_column(Integer, default=1)
    segment_code: Mapped[Optional[str]] = mapped_column(String(32), index=True)
    family_code: Mapped[Optional[str]] = mapped_column(String(32), index=True)
    class_code: Mapped[Optional[str]] = mapped_column(String(32), index=True)
    category_code: Mapped[Optional[str]] = mapped_column(String(32), index=True)
    lifecycle_status: Mapped[LifecycleStatus] = mapped_column(
        String(20), default=LifecycleStatus.DRAFT, index=True
    )
    lifecycle_reason: Mapped[Optional[str]] = mapped_column(String(255))
    effective_from: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    effective_to: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    attributes_payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    files: Mapped[List[dict]] = mapped_column(JSONB, default=list)
    methodology_ids: Mapped[List[int]] = mapped_column(ARRAY(Integer), default=list)

    manufacturer: Mapped[Optional[str]] = mapped_column(String(255))
    standard_document: Mapped[Optional[str]] = mapped_column(String(255))
    article: Mapped[Optional[str]] = mapped_column(String(100))
    type: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    subclass: Mapped[Optional[str]] = mapped_column(String(100))

    standard_parameters: Mapped[dict] = mapped_column(JSONB, default=dict)
    required_parameters: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    optional_parameters: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    legacy_synonyms: Mapped[Optional[dict]] = mapped_column(
        "synonyms", JSONB, default=dict
    )
    keywords: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    tags: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    base_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    cost_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    last_calculation_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    price_currency: Mapped[str] = mapped_column(String(10), default="RUB")
    price_source: Mapped[Optional[str]] = mapped_column(String(50))
    price_valid_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )
    price_confidence: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2))
    related_nomenclature_ids: Mapped[List[int]] = mapped_column(
        ARRAY(Integer), default=list
    )

    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    average_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    ai_embedding: Mapped[Optional[List[float]]] = mapped_column(Vector(3072))

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    last_editor_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    last_reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )
    audit_log_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("audit_logs.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    node: Mapped[Optional["NomenclatureNode"]] = relationship(
        "NomenclatureNode", back_populates="cards", lazy="joined"
    )
    versions: Mapped[List["NomenclatureCardVersion"]] = relationship(
        "NomenclatureCardVersion",
        back_populates="card",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    synonym_records: Mapped[List["NomenclatureCardSynonym"]] = relationship(
        "NomenclatureCardSynonym",
        back_populates="card",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    usage_records: Mapped[List["NomenclatureCardUsage"]] = relationship(
        "NomenclatureCardUsage",
        back_populates="card",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    @property
    def display_name(self) -> str:
        return self.canonical_name

    @property
    def name(self) -> str:
        return self.canonical_name

    @name.setter
    def name(self, value: str) -> None:
        self.canonical_name = value
