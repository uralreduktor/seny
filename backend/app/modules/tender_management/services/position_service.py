from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.tender_management.models.position import Position
from app.modules.tender_management.schemas.position import (
    PositionCreate,
    PositionUpdate,
)


class PositionService:
    @staticmethod
    async def get(db: AsyncSession, id: int) -> Optional[Position]:
        result = await db.execute(
            select(Position)
            .options(selectinload(Position.nomenclature))
            .where(Position.id == id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession, tender_id: int, schema: PositionCreate
    ) -> Position:
        db_obj = Position(**schema.model_dump(), tender_id=tender_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def update(
        db: AsyncSession, id: int, schema: PositionUpdate
    ) -> Optional[Position]:
        db_obj = await PositionService.get(db, id)
        if not db_obj:
            return None

        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_obj, key, value)

        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def delete(db: AsyncSession, id: int) -> bool:
        db_obj = await PositionService.get(db, id)
        if not db_obj:
            return False
        await db.delete(db_obj)
        await db.commit()
        return True
