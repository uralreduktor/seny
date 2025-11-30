from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pricing_kb_ai.enums import LifecycleStatus
from app.modules.pricing_kb_ai.models.nomenclature import Nomenclature
from app.modules.pricing_kb_ai.models.nomenclature_node import NomenclatureNode
from app.modules.pricing_kb_ai.schemas.nomenclature_cards import CardLifecycleChange
from app.modules.tender_management.models.audit import AuditLog
from app.modules.tender_management.services.audit_service import AuditService


class LifecycleValidationError(Exception):
    """Raised when a lifecycle transition violates business rules."""

    def __init__(self, errors: List[str]) -> None:
        super().__init__("; ".join(errors))
        self.errors = errors


class NomenclatureLifecycleService:
    ALLOWED_TRANSITIONS: dict[LifecycleStatus, set[LifecycleStatus]] = {
        LifecycleStatus.DRAFT: {LifecycleStatus.REVIEW},
        LifecycleStatus.REVIEW: {
            LifecycleStatus.DRAFT,
            LifecycleStatus.ACTIVE,
        },
        LifecycleStatus.ACTIVE: {LifecycleStatus.ARCHIVED},
        LifecycleStatus.ARCHIVED: set(),
    }
    NODE_REQUIRED_STATUSES = {LifecycleStatus.REVIEW, LifecycleStatus.ACTIVE}
    METHODOLOGY_REQUIRED_STATUSES = {LifecycleStatus.REVIEW, LifecycleStatus.ACTIVE}

    @classmethod
    async def change_status(
        cls,
        db: AsyncSession,
        card: Nomenclature,
        payload: CardLifecycleChange,
        actor_id: Optional[str],
    ) -> Nomenclature:
        node: Optional[NomenclatureNode] = None
        if card.node_id:
            node = await db.get(NomenclatureNode, card.node_id)

        errors = cls.validate_transition(card, payload, node)
        if errors:
            raise LifecycleValidationError(errors)

        previous_status = card.lifecycle_status
        cls._apply_transition(card, payload)
        log_entry = await cls._record_audit(
            db=db,
            card=card,
            previous_status=previous_status,
            payload=payload,
            actor_id=actor_id,
        )
        if log_entry:
            card.audit_log_id = log_entry.id

        cls._emit_event(card, previous_status, actor_id)
        return card

    @classmethod
    def validate_transition(
        cls,
        card: Nomenclature,
        payload: CardLifecycleChange,
        node: Optional[NomenclatureNode],
    ) -> List[str]:
        errors: List[str] = []
        if payload.target_status == card.lifecycle_status:
            errors.append("Карточка уже находится в указанном статусе.")
            return errors

        allowed = cls.ALLOWED_TRANSITIONS.get(card.lifecycle_status, set())
        if payload.target_status not in allowed:
            errors.append(
                f"Переход из статуса '{card.lifecycle_status}' в "
                f"'{payload.target_status}' запрещён."
            )

        if payload.target_status in cls.NODE_REQUIRED_STATUSES:
            if not node:
                errors.append(
                    "Карточка должна быть привязана к актуальному узлу классификатора."
                )
            elif card.node_version != node.version:
                errors.append(
                    "Версия узла устарела. Обновите карточку до актуальной версии класса."
                )

        if (
            payload.target_status in cls.METHODOLOGY_REQUIRED_STATUSES
            and not card.methodology_ids
        ):
            errors.append("Для перехода требуется указать методики расчёта.")

        if payload.target_status == LifecycleStatus.ARCHIVED and not (
            payload.reason or card.lifecycle_reason
        ):
            errors.append("Для архивации необходимо указать причину.")

        if (
            payload.target_status == LifecycleStatus.DRAFT
            and card.lifecycle_status == LifecycleStatus.REVIEW
            and not payload.reason
        ):
            errors.append(
                "Вернуть карточку из ревью в драфт можно только с комментарием."
            )

        if (
            payload.target_status in cls.NODE_REQUIRED_STATUSES
            and not card.attributes_payload
        ):
            errors.append("Не заполнены обязательные параметры карточки.")

        return errors

    @staticmethod
    def _apply_transition(card: Nomenclature, payload: CardLifecycleChange) -> None:
        now = datetime.now(timezone.utc)
        card.lifecycle_status = payload.target_status
        if payload.reason is not None:
            card.lifecycle_reason = payload.reason

        if payload.target_status == LifecycleStatus.ACTIVE:
            card.effective_from = payload.effective_from or card.effective_from or now
            card.effective_to = payload.effective_to
        elif payload.target_status == LifecycleStatus.ARCHIVED:
            card.effective_to = payload.effective_to or now
        else:
            card.effective_to = None

        card.last_reviewed_at = now

    @staticmethod
    async def _record_audit(
        db: AsyncSession,
        card: Nomenclature,
        previous_status: LifecycleStatus,
        payload: CardLifecycleChange,
        actor_id: Optional[str],
    ) -> Optional[AuditLog]:
        details = {
            "card_id": card.id,
            "from": previous_status,
            "to": payload.target_status,
            "reason": payload.reason or card.lifecycle_reason,
            "methodologies": card.methodology_ids or [],
        }
        log_entry = await AuditService.log(
            db=db,
            action="nomenclature_status_changed",
            entity_type="nomenclature",
            entity_id=card.id,
            user_id=None,
            details=details,
        )
        return log_entry

    @staticmethod
    def _emit_event(
        card: Nomenclature,
        previous_status: LifecycleStatus,
        actor_id: Optional[str],
    ) -> None:
        logger.bind(
            card_id=card.id,
            from_status=str(previous_status),
            to_status=str(card.lifecycle_status),
            actor_id=str(actor_id) if actor_id else None,
        ).info("Nomenclature lifecycle changed")
