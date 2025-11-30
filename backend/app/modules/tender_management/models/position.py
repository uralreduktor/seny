from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base
from app.modules.tender_management.enums import PositionStatus


class Position(Base):
    __tablename__ = "positions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tender_id: Mapped[int] = mapped_column(Integer, ForeignKey("tenders.id"))

    # Basic Info
    name: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 3), default=1.0)
    unit: Mapped[str] = mapped_column(String, default="шт")

    # Technical
    nomenclature_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("nomenclatures.id"), nullable=True
    )
    technical_requirements: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Workflow
    status: Mapped[PositionStatus] = mapped_column(String, default=PositionStatus.NEW)

    # Pricing (Snapshot from Calculation)
    price_per_unit: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    total_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    currency: Mapped[str] = mapped_column(String, default="RUB")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tender = relationship("Tender", back_populates="positions")
    nomenclature = relationship("Nomenclature", foreign_keys=[nomenclature_id])
