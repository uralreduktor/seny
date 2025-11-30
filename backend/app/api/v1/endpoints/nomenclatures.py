from __future__ import annotations

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.modules.pricing_kb_ai.schemas.nomenclature import (
    NomenclatureCreate,
    NomenclatureResponse,
    NomenclatureUpdate,
)
from app.modules.pricing_kb_ai.services.nomenclature_service import (
    LegacyNomenclatureService,
)

router = APIRouter()


@router.get("/", response_model=List[NomenclatureResponse])
async def read_nomenclatures(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Совместимый список номенклатур.
    """
    return await LegacyNomenclatureService.get_all(db, skip=skip, limit=limit)


@router.post("/", response_model=NomenclatureResponse)
async def create_nomenclature(
    *,
    db: AsyncSession = Depends(deps.get_db),
    nomenclature_in: NomenclatureCreate,
) -> Any:
    """
    Создать номенклатуру (совместимый формат).
    """
    return await LegacyNomenclatureService.create(db=db, payload=nomenclature_in)


@router.get("/{id}", response_model=NomenclatureResponse)
async def read_nomenclature(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Получить номенклатуру по ID.
    """
    nomenclature = await LegacyNomenclatureService.get(db=db, id=id)
    if not nomenclature:
        raise HTTPException(status_code=404, detail="Nomenclature not found")
    return nomenclature


@router.put("/{id}", response_model=NomenclatureResponse)
async def update_nomenclature(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    nomenclature_in: NomenclatureUpdate,
) -> Any:
    """
    Обновить номенклатуру (совместимый формат).
    """
    nomenclature = await LegacyNomenclatureService.update(
        db=db, id=id, payload=nomenclature_in
    )
    if not nomenclature:
        raise HTTPException(status_code=404, detail="Nomenclature not found")
    return nomenclature
