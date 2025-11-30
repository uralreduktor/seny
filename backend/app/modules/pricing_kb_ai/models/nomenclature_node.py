from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.modules.pricing_kb_ai.enums import NodeStatus, NodeType


class NomenclatureNode(Base):
    __tablename__ = "nomenclature_nodes"

    id: Mapped[int] = mapped_column(primary_key=True)
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("nomenclature_nodes.id", ondelete="SET NULL"), index=True
    )
    code: Mapped[str] = mapped_column(
        String(32), nullable=False, unique=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    node_type: Mapped[NodeType] = mapped_column(String(20), nullable=False, index=True)
    depth: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    version: Mapped[int] = mapped_column(Integer, default=1)
    effective_from: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    effective_to: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    status: Mapped[NodeStatus] = mapped_column(
        String(20), default=NodeStatus.DRAFT, index=True
    )
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    meta: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)

    parent: Mapped[Optional["NomenclatureNode"]] = relationship(
        remote_side="NomenclatureNode.id", back_populates="children", lazy="joined"
    )
    children: Mapped[List["NomenclatureNode"]] = relationship(
        back_populates="parent", cascade="all, delete-orphan", lazy="selectin"
    )
    schemas: Mapped[List["NomenclatureClassSchema"]] = relationship(
        "NomenclatureClassSchema", back_populates="node", lazy="selectin"
    )
    cards: Mapped[List["Nomenclature"]] = relationship(
        "Nomenclature", back_populates="node", lazy="noload"
    )
    versions: Mapped[List["NomenclatureNodeVersion"]] = relationship(
        "NomenclatureNodeVersion",
        back_populates="node",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def increment_version(self) -> None:
        self.version += 1


class NomenclatureNodeVersion(Base):
    __tablename__ = "nomenclature_node_versions"
    __table_args__ = (
        UniqueConstraint("node_id", "version", name="uq_nomenclature_node_version"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    node_id: Mapped[int] = mapped_column(
        ForeignKey("nomenclature_nodes.id", ondelete="CASCADE"), index=True
    )
    parent_id: Mapped[Optional[int]] = mapped_column(index=True)
    code: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    node_type: Mapped[NodeType] = mapped_column(String(20), nullable=False, index=True)
    depth: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[NodeStatus] = mapped_column(String(20), nullable=False, index=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    effective_from: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    effective_to: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    meta: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    node: Mapped["NomenclatureNode"] = relationship(
        "NomenclatureNode", back_populates="versions", lazy="joined"
    )
