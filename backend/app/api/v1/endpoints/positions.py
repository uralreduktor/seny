from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.modules.tender_management.schemas.position import (
    PositionCreate,
    PositionResponse,
    PositionUpdate,
)
from app.modules.tender_management.services.position_service import PositionService

router = APIRouter()


@router.get("/{id}", response_model=PositionResponse)
async def read_position(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get position by ID.
    """
    position = await PositionService.get(db=db, id=id)
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")
    return position


@router.put("/{id}", response_model=PositionResponse)
async def update_position(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    position_in: PositionUpdate,
) -> Any:
    """
    Update position.
    """
    position = await PositionService.update(db=db, id=id, schema=position_in)
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")
    return position


@router.delete("/{id}", response_model=bool)
async def delete_position(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Delete position.
    """
    success = await PositionService.delete(db=db, id=id)
    if not success:
        raise HTTPException(status_code=404, detail="Position not found")
    return success
