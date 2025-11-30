from typing import Optional

from sqlalchemy import JSON, Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Stage(Base):
    __tablename__ = "stages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    code: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Role-based access control
    required_role: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Conditions
    requires_all_positions_calculated: Mapped[bool] = mapped_column(
        Boolean, default=False
    )
    requires_commercial_proposal: Mapped[bool] = mapped_column(Boolean, default=False)

    # Display order
    order: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    tenders = relationship("Tender", back_populates="stage")
    # transitions_from = relationship("StageTransition", foreign_keys="StageTransition.from_stage_id", back_populates="from_stage")
    # transitions_to = relationship("StageTransition", foreign_keys="StageTransition.to_stage_id", back_populates="to_stage")


class StageTransition(Base):
    __tablename__ = "stage_transitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    from_stage_id: Mapped[int] = mapped_column(Integer, ForeignKey("stages.id"))
    to_stage_id: Mapped[int] = mapped_column(Integer, ForeignKey("stages.id"))

    # Automation
    auto_create_tasks: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    required_fields: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    # from_stage = relationship("Stage", foreign_keys=[from_stage_id], back_populates="transitions_from")
    # to_stage = relationship("Stage", foreign_keys=[to_stage_id], back_populates="transitions_to")
