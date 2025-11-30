from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base
from app.modules.tender_management.enums import TenderSource


class Tender(Base):
    __tablename__ = "tenders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Core Info
    number: Mapped[str] = mapped_column(
        String, unique=True, index=True
    )  # Номер закупки
    title: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    customer: Mapped[str] = mapped_column(
        String, nullable=False, server_default=""
    )  # Заказчик
    source: Mapped[TenderSource] = mapped_column(String, default=TenderSource.MANUAL)
    source_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Dates
    deadline_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Economics
    initial_max_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    currency: Mapped[str] = mapped_column(String, default="RUB")

    # Commercial Terms
    terms: Mapped[dict] = mapped_column(JSONB, default=dict, server_default="{}")

    # Status & Workflow
    stage_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("stages.id"), nullable=False
    )

    # Assignment
    responsible_id: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )  # User ID
    engineer_id: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )  # User ID

    # Meta
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    stage = relationship("Stage", back_populates="tenders")
    positions = relationship(
        "Position", back_populates="tender", cascade="all, delete-orphan"
    )
    files = relationship(
        "TenderFile", back_populates="tender", cascade="all, delete-orphan"
    )
    # tasks = relationship("Task", back_populates="tender")
    audit_logs = relationship("AuditLog", back_populates="tender")


class TenderFile(Base):
    __tablename__ = "tender_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tender_id: Mapped[int] = mapped_column(Integer, ForeignKey("tenders.id"))

    filename: Mapped[str] = mapped_column(String)
    file_path: Mapped[str] = mapped_column(String)  # Path in MinIO
    category: Mapped[str] = mapped_column(String)  # FileCategory enum

    uploaded_by_id: Mapped[int] = mapped_column(Integer)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    archived_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    tender = relationship("Tender", back_populates="files")
