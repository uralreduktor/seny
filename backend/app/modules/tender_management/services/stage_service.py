from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tender_management.enums import StageCode
from app.modules.tender_management.models.stage import Stage, StageTransition
from app.modules.tender_management.models.tender import Tender
from app.modules.tender_management.schemas.stage import StageCreate


class StageService:
    @staticmethod
    async def get_by_id(db: AsyncSession, stage_id: int) -> Optional[Stage]:
        result = await db.execute(select(Stage).where(Stage.id == stage_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_code(db: AsyncSession, code: str) -> Optional[Stage]:
        result = await db.execute(select(Stage).where(Stage.code == code))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(db: AsyncSession) -> list[Stage]:
        result = await db.execute(select(Stage).order_by(Stage.order))
        return list(result.scalars().all())

    @staticmethod
    async def create(db: AsyncSession, schema: StageCreate) -> Stage:
        stage = Stage(**schema.model_dump())
        db.add(stage)
        await db.commit()
        await db.refresh(stage)
        return stage

    @staticmethod
    async def get_transition(
        db: AsyncSession, from_stage_id: int, to_stage_id: int
    ) -> Optional[StageTransition]:
        result = await db.execute(
            select(StageTransition)
            .where(StageTransition.from_stage_id == from_stage_id)
            .where(StageTransition.to_stage_id == to_stage_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def can_transition(
        db: AsyncSession, tender: Tender, target_stage_code: str
    ) -> bool:
        """
        Check if transition is allowed based on graph and conditions.
        Note: Logic moved here from pseudo-code in docs.
        """
        current_stage = await StageService.get_by_id(db, tender.stage_id)
        target_stage = await StageService.get_by_code(db, target_stage_code)

        if not current_stage or not target_stage:
            return False

        # 1. Check graph existence
        transition = await StageService.get_transition(
            db, current_stage.id, target_stage.id
        )
        if not transition:
            # Allow transition to Cancelled from anywhere? Or strict graph?
            # For MVP let's strict graph, except maybe admin override.
            # Assuming graph is populated.
            return False

        # 2. Check conditions (Business Logic)
        if target_stage.requires_all_positions_calculated:
            # Check positions (would need to load them or query)
            # For now, assuming positions are loaded or we do a query
            pass

        return True
