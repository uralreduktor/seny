from typing import List, Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, with_loader_criteria

from app.modules.tender_management.enums import StageCode
from app.modules.tender_management.models.stage import Stage
from app.modules.tender_management.models.tender import Tender, TenderFile
from app.modules.tender_management.schemas.tender import TenderCreate, TenderUpdate
from app.modules.tender_management.services.audit_service import AuditService
from app.modules.tender_management.services.stage_service import StageService


class TenderService:
    @staticmethod
    async def get(db: AsyncSession, id: int) -> Optional[Tender]:
        result = await db.execute(
            select(Tender)
            .options(
                selectinload(Tender.positions),
                selectinload(Tender.stage),
                selectinload(Tender.files),
                selectinload(Tender.audit_logs),
                with_loader_criteria(
                    TenderFile, TenderFile.is_archived.is_(False), include_aliases=True
                ),
            )
            .where(Tender.id == id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Tender]:
        result = await db.execute(
            select(Tender)
            .options(
                selectinload(Tender.stage),
                selectinload(Tender.positions),
                selectinload(Tender.files),
                selectinload(Tender.audit_logs),
                with_loader_criteria(
                    TenderFile, TenderFile.is_archived.is_(False), include_aliases=True
                ),
            )
            .offset(skip)
            .limit(limit)
            .order_by(Tender.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def create(db: AsyncSession, schema: TenderCreate) -> Tender:
        existing = await db.scalar(select(Tender).where(Tender.number == schema.number))
        if existing:
            raise ValueError("Тендер с таким номером уже существует")
        existing = await db.scalar(select(Tender).where(Tender.number == schema.number))
        if existing:
            raise ValueError("Тендер с таким номером уже существует")

        # 1. Get initial stage
        initial_stage = await StageService.get_by_code(db, StageCode.DISCOVERED)
        if not initial_stage:
            # Fallback if DB not seeded
            raise ValueError("Initial stage 'discovered' not found in DB")

        # 2. Create tender
        tender_data = schema.model_dump()
        tender = Tender(**tender_data, stage_id=initial_stage.id)

        db.add(tender)
        await db.commit()
        await db.refresh(tender)
        return tender

    @staticmethod
    async def update(
        db: AsyncSession, id: int, schema: TenderUpdate
    ) -> Optional[Tender]:
        tender = await TenderService.get(db, id)
        if not tender:
            return None

        if schema.number is not None:
            existing = await db.scalar(
                select(Tender).where(
                    Tender.number == schema.number,
                    Tender.id != id,
                )
            )
            if existing:
                raise ValueError("Тендер с таким номером уже существует")

        if schema.number is not None:
            existing = await db.scalar(
                select(Tender).where(
                    Tender.number == schema.number,
                    Tender.id != id,
                )
            )
            if existing:
                raise ValueError("Тендер с таким номером уже существует")

        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(tender, key, value)

        db.add(tender)
        await db.commit()
        await db.refresh(tender)
        return tender

    @staticmethod
    async def change_stage(
        db: AsyncSession, id: int, target_stage_code: str, user_id: int
    ) -> Tender:
        tender = await TenderService.get(db, id)
        if not tender:
            raise ValueError("Tender not found")

        # Validate transition
        can_switch = await StageService.can_transition(db, tender, target_stage_code)
        if not can_switch:
            raise ValueError(
                f"Cannot transition from {tender.stage.code} to {target_stage_code}"
            )

        target_stage = await StageService.get_by_code(db, target_stage_code)
        old_stage_code = tender.stage.code
        tender.stage_id = target_stage.id

        await AuditService.log(
            db=db,
            tender_id=tender.id,
            user_id=user_id,
            action="stage_changed",
            details={"from": old_stage_code, "to": target_stage_code},
        )

        db.add(tender)
        await db.commit()
        await db.refresh(tender)
        return tender
