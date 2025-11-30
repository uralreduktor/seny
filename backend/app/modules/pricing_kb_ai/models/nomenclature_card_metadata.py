from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.modules.pricing_kb_ai.enums import CardVersionStatus


class NomenclatureCardVersion(Base):
    __tablename__ = "nomenclature_card_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    card_id: Mapped[int] = mapped_column(
        ForeignKey("nomenclatures.id", ondelete="CASCADE"), index=True
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    diff_payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    status: Mapped[CardVersionStatus] = mapped_column(
        String(20), default=CardVersionStatus.DRAFT
    )
    author_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    comment: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    card: Mapped["Nomenclature"] = relationship(
        "Nomenclature", back_populates="versions"
    )


class NomenclatureCardSynonym(Base):
    __tablename__ = "nomenclature_card_synonyms"

    id: Mapped[int] = mapped_column(primary_key=True)
    card_id: Mapped[int] = mapped_column(
        ForeignKey("nomenclatures.id", ondelete="CASCADE"), index=True
    )
    value: Mapped[str] = mapped_column(String(255), nullable=False)
    locale: Mapped[str] = mapped_column(String(10), default="ru-RU")

    card: Mapped["Nomenclature"] = relationship(
        "Nomenclature", back_populates="synonym_records"
    )


class NomenclatureCardUsage(Base):
    __tablename__ = "nomenclature_card_usage"

    card_id: Mapped[int] = mapped_column(
        ForeignKey("nomenclatures.id", ondelete="CASCADE"), primary_key=True
    )
    position_id: Mapped[int] = mapped_column(
        ForeignKey("positions.id", ondelete="CASCADE"), primary_key=True
    )
    usage_count: Mapped[int] = mapped_column(Integer, default=1)
    average_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    last_used_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    card: Mapped["Nomenclature"] = relationship(
        "Nomenclature", back_populates="usage_records"
    )
