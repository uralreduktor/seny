from __future__ import annotations

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pricing_kb_ai.enums import SchemaStatus
from app.modules.pricing_kb_ai.models.nomenclature_schema import (
    NomenclatureAttributePreset,
)
from app.modules.pricing_kb_ai.schemas.nomenclature_presets import (
    AttributePresetCreate,
    AttributePresetResponse,
    AttributePresetUpdate,
)


class NomenclaturePresetService:
    @staticmethod
    async def list_presets(
        db: AsyncSession, status: Optional[SchemaStatus] = None
    ) -> List[NomenclatureAttributePreset]:
        stmt = select(NomenclatureAttributePreset)
        if status:
            stmt = stmt.where(NomenclatureAttributePreset.status == status)
        stmt = stmt.order_by(NomenclatureAttributePreset.code)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create(
        db: AsyncSession, payload: AttributePresetCreate
    ) -> NomenclatureAttributePreset:
        existing = await db.scalar(
            select(NomenclatureAttributePreset).where(
                NomenclatureAttributePreset.code == payload.code
            )
        )
        if existing:
            raise ValueError("Preset with this code already exists")
        preset = NomenclatureAttributePreset(
            code=payload.code,
            title=payload.title,
            description=payload.description,
            json_schema=payload.json_schema,
            version=payload.version,
            status=SchemaStatus.PUBLISHED,
        )
        db.add(preset)
        await db.commit()
        await db.refresh(preset)
        return preset

    @staticmethod
    async def get(
        db: AsyncSession, preset_id: int
    ) -> Optional[NomenclatureAttributePreset]:
        return await db.get(NomenclatureAttributePreset, preset_id)

    @staticmethod
    async def update(
        db: AsyncSession, preset_id: int, payload: AttributePresetUpdate
    ) -> Optional[NomenclatureAttributePreset]:
        preset = await db.get(NomenclatureAttributePreset, preset_id)
        if not preset:
            return None
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(preset, field, value)
        await db.commit()
        await db.refresh(preset)
        return preset

    @staticmethod
    async def archive(db: AsyncSession, preset_id: int) -> bool:
        preset = await db.get(NomenclatureAttributePreset, preset_id)
        if not preset:
            return False
        preset.status = SchemaStatus.ARCHIVED
        await db.commit()
        return True
