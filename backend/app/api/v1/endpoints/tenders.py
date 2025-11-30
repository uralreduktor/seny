from typing import Any, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.modules.tender_management.schemas.stage import StageResponse
from app.modules.tender_management.schemas.tender import (
    TenderCreate,
    TenderFileResponse,
    TenderResponse,
    TenderUpdate,
)
from app.modules.tender_management.services.file_service import FileService
from app.modules.tender_management.services.stage_service import StageService
from app.modules.tender_management.services.tender_service import TenderService

router = APIRouter()


@router.get("/stages", response_model=List[StageResponse])
async def read_stages(
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Retrieve all possible stages.
    """
    stages = await StageService.get_all(db)
    return stages


@router.get("/", response_model=List[TenderResponse])
async def read_tenders(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve tenders.
    """
    tenders = await TenderService.get_all(db, skip=skip, limit=limit)
    return tenders


@router.post("/", response_model=TenderResponse)
async def create_tender(
    *,
    db: AsyncSession = Depends(deps.get_db),
    tender_in: TenderCreate,
) -> Any:
    """
    Create new tender.
    """
    try:
        return await TenderService.create(db=db, schema=tender_in)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/{id}", response_model=TenderResponse)
async def read_tender(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get tender by ID.
    """
    tender = await TenderService.get(db=db, id=id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tender


@router.put("/{id}", response_model=TenderResponse)
async def update_tender(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    tender_in: TenderUpdate,
) -> Any:
    """
    Update tender.
    """
    tender = await TenderService.get(db=db, id=id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    try:
        tender = await TenderService.update(db=db, id=id, schema=tender_in)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return tender


@router.post("/{id}/change-stage", response_model=TenderResponse)
async def change_tender_stage(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    target_stage_code: str = Query(..., description="Target stage code"),
) -> Any:
    """
    Change tender stage.
    """
    try:
        # TODO: Get current user ID from token
        user_id = 1
        tender = await TenderService.change_stage(
            db=db, id=id, target_stage_code=target_stage_code, user_id=user_id
        )
        return tender
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{id}/files", response_model=TenderFileResponse)
async def upload_tender_file(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    file: UploadFile = File(...),
    category: str = Form(...),
) -> Any:
    """
    Upload a file to the tender.
    """
    tender = await TenderService.get(db=db, id=id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    # TODO: Get real user
    user_id = 1

    try:
        db_file = await FileService.upload(
            db=db, tender_id=id, file=file, category=category, user_id=user_id
        )
        return db_file
    except Exception as e:
        # In real app, log exception
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.delete("/{id}/files/{file_id}")
async def delete_tender_file(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    file_id: int,
) -> Any:
    """
    Delete a file from the tender.
    """
    # Verify tender exists
    tender = await TenderService.get(db=db, id=id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    success = await FileService.delete(db=db, file_id=file_id)
    if not success:
        raise HTTPException(status_code=404, detail="File not found")

    return {"status": "success"}


@router.get("/{id}/files/{file_id}/url")
async def get_tender_file_url(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    file_id: int,
) -> Any:
    """
    Get a presigned download URL for the file.
    """
    url = await FileService.get_url(db=db, file_id=file_id)
    if not url:
        raise HTTPException(status_code=404, detail="File not found")

    return {"url": url}
