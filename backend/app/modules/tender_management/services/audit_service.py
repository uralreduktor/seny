from typing import Any, Dict, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tender_management.models.audit import AuditLog


class AuditService:
    @staticmethod
    async def log(
        db: AsyncSession,
        action: str,
        *,
        tender_id: Optional[int] = None,
        user_id: Optional[int] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        resolved_entity_type = entity_type or (
            "tender" if tender_id is not None else "unknown"
        )
        resolved_entity_id = entity_id or tender_id
        log_entry = AuditLog(
            tender_id=tender_id,
            entity_type=resolved_entity_type,
            entity_id=resolved_entity_id,
            user_id=user_id,
            action=action,
            details=details or {},
        )
        db.add(log_entry)
        # We don't commit here usually if it's part of a larger transaction,
        # but if we want to ensure log is written even if main tx fails (complex), we might.
        # Here we assume it's part of the same unit of work.
        return log_entry
