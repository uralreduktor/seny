from __future__ import annotations

import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pricing_kb_ai.models.nomenclature import Nomenclature
from app.modules.pricing_kb_ai.schemas.nomenclature import (
    NomenclatureCreate,
    NomenclatureUpdate,
)


def _legacy_code(prefix: str = "LEG") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:6].upper()}"


class LegacyNomenclatureService:
    @staticmethod
    async def get(db: AsyncSession, id: int) -> Optional[Nomenclature]:
        result = await db.execute(select(Nomenclature).where(Nomenclature.id == id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Nomenclature]:
        result = await db.execute(select(Nomenclature).offset(skip).limit(limit))
        return list(result.scalars().all())

    @staticmethod
    async def create(db: AsyncSession, payload: NomenclatureCreate) -> Nomenclature:
        code = payload.code or _legacy_code()
        db_obj = Nomenclature(
            code=code,
            canonical_name=payload.name,
            node_id=payload.node_id,
            standard_parameters=payload.standard_parameters,
            required_parameters=payload.required_parameters,
            optional_parameters=payload.optional_parameters,
            attributes_payload=payload.standard_parameters,
            files=[],
            methodology_ids=[],
            manufacturer=payload.manufacturer,
            standard_document=payload.standard_document,
            article=payload.article,
            type=payload.type,
            category=payload.category,
            subclass=payload.subclass,
            base_price=payload.base_price,
            cost_price=payload.cost_price,
            price_currency=payload.price_currency,
            price_source=payload.price_source,
            price_valid_until=payload.price_valid_until,
            legacy_synonyms=payload.synonyms,
            keywords=payload.keywords,
            tags=payload.tags,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def update(
        db: AsyncSession, id: int, payload: NomenclatureUpdate
    ) -> Optional[Nomenclature]:
        db_obj = await LegacyNomenclatureService.get(db, id)
        if not db_obj:
            return None

        data = payload.model_dump(exclude_unset=True)
        if "name" in data:
            db_obj.canonical_name = data.pop("name")
        if "standard_parameters" in data:
            db_obj.standard_parameters = data["standard_parameters"]
            db_obj.attributes_payload = data["standard_parameters"] or {}
        for field, value in data.items():
            if field == "synonyms":
                db_obj.legacy_synonyms = value
            else:
                setattr(db_obj, field, value)

        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def delete(db: AsyncSession, id: int) -> bool:
        db_obj = await LegacyNomenclatureService.get(db, id)
        if not db_obj:
            return False
        await db.delete(db_obj)
        await db.commit()
        return True
