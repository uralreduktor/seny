from __future__ import annotations

from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status as http_status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.modules.auth.models.user import User
from app.modules.pricing_kb_ai.enums import LifecycleStatus, NodeStatus
from app.modules.pricing_kb_ai.schemas.nomenclature_cards import (
    BulkLifecycleRequest,
    BulkMethodologyRequest,
    BulkOperationResult,
    CardLifecycleChange,
    CardVersion,
    NomenclatureCard,
    NomenclatureCardCreate,
    NomenclatureCardUpdate,
    PaginatedCards,
)
from app.modules.pricing_kb_ai.schemas.nomenclature_nodes import (
    ClassSchemaDraft,
    ClassSchemaVersion,
    NomenclatureNodeCreate,
    NomenclatureNodeResponse,
    NomenclatureNodeUpdate,
)
from app.modules.pricing_kb_ai.services.nomenclature_cards import (
    NomenclatureCardService,
)
from app.modules.pricing_kb_ai.services.nomenclature_nodes import (
    NomenclatureNodeService,
    NomenclatureSchemaService,
)

router = APIRouter(prefix="/nomenclature", tags=["nomenclature"])


@router.get("/nodes", response_model=list[NomenclatureNodeResponse])
async def list_nodes(
    parent_id: Optional[int] = None,
    depth: Optional[int] = None,
    status: Optional[NodeStatus] = None,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    nodes = await NomenclatureNodeService.list_nodes(
        db,
        parent_id=parent_id,
        depth=depth,
        status=status,
    )
    return nodes


@router.post(
    "/nodes",
    response_model=NomenclatureNodeResponse,
    status_code=http_status.HTTP_201_CREATED,
)
async def create_node(
    payload: NomenclatureNodeCreate,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    node = await NomenclatureNodeService.create(db, payload)
    return node


@router.patch("/nodes/{node_id}", response_model=NomenclatureNodeResponse)
async def update_node(
    node_id: int,
    payload: NomenclatureNodeUpdate,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    node = await NomenclatureNodeService.update(db, node_id, payload)
    if not node:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Node not found"
        )
    return node


@router.delete("/nodes/{node_id}", status_code=http_status.HTTP_204_NO_CONTENT)
async def archive_node(
    node_id: int,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    node = await NomenclatureNodeService.archive(db, node_id)
    if not node:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Node not found"
        )


@router.get(
    "/nodes/{node_id}/schemas",
    response_model=list[ClassSchemaVersion],
)
async def list_node_schemas(
    node_id: int,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    return await NomenclatureSchemaService.list_versions(db, node_id)


@router.post(
    "/nodes/{node_id}/schemas",
    response_model=ClassSchemaVersion,
    status_code=http_status.HTTP_201_CREATED,
)
async def create_schema_version(
    node_id: int,
    payload: ClassSchemaDraft,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    schema = await NomenclatureSchemaService.create_version(
        db, node_id, payload, current_user.id
    )
    return schema


@router.post(
    "/nodes/{node_id}/schemas/{version}/publish",
    response_model=ClassSchemaVersion,
)
async def publish_schema_version(
    node_id: int,
    version: int,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    schema = await NomenclatureSchemaService.publish_version(db, node_id, version)
    if not schema:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Schema version not found",
        )
    return schema


@router.get("/cards", response_model=PaginatedCards)
async def list_cards(
    node_id: Optional[int] = None,
    lifecycle_status: Optional[LifecycleStatus] = None,
    search: Optional[str] = None,
    manufacturer: Optional[str] = None,
    code: Optional[str] = None,
    has_methodology: Optional[bool] = None,
    base_price_min: Optional[Decimal] = Query(None, ge=0),
    base_price_max: Optional[Decimal] = Query(None, ge=0),
    sort_by: str = Query(
        "updated_at", pattern="^(updated_at|code|base_price|usage_count)$"
    ),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    items, meta = await NomenclatureCardService.list_cards(
        db,
        node_id=node_id,
        lifecycle_status=lifecycle_status,
        manufacturer=manufacturer,
        code=code,
        search=search,
        has_methodology=has_methodology,
        base_price_min=base_price_min,
        base_price_max=base_price_max,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    serialized = [NomenclatureCardService.serialize(card) for card in items]
    return PaginatedCards(items=serialized, meta=meta)


@router.post(
    "/cards", response_model=NomenclatureCard, status_code=http_status.HTTP_201_CREATED
)
async def create_card(
    payload: NomenclatureCardCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    try:
        card = await NomenclatureCardService.create(db, payload, current_user.id)
    except ValueError as exc:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return NomenclatureCardService.serialize(card)


@router.get("/cards/{card_id}", response_model=NomenclatureCard)
async def get_card(
    card_id: int,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    card = await NomenclatureCardService.get(db, card_id)
    if not card:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Card not found"
        )
    return NomenclatureCardService.serialize(card)


@router.patch("/cards/{card_id}", response_model=NomenclatureCard)
async def update_card(
    card_id: int,
    payload: NomenclatureCardUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    card = await NomenclatureCardService.update(db, card_id, payload, current_user.id)
    if not card:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Card not found"
        )
    return NomenclatureCardService.serialize(card)


@router.post("/cards/{card_id}/lifecycle", response_model=NomenclatureCard)
async def change_card_lifecycle(
    card_id: int,
    payload: CardLifecycleChange,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    card = await NomenclatureCardService.change_lifecycle(
        db, card_id, payload, current_user.id
    )
    if not card:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Card not found"
        )
    return NomenclatureCardService.serialize(card)


@router.get("/cards/{card_id}/versions", response_model=list[CardVersion])
async def list_card_versions(
    card_id: int,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    versions = await NomenclatureCardService.list_versions(db, card_id)
    return versions


@router.post("/cards/bulk/lifecycle", response_model=list[BulkOperationResult])
async def bulk_change_card_lifecycle(
    request: BulkLifecycleRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    return await NomenclatureCardService.bulk_change_lifecycle(
        db, request=request, actor_id=current_user.id
    )


@router.post("/cards/bulk/methodology", response_model=list[BulkOperationResult])
async def bulk_update_card_methodologies(
    request: BulkMethodologyRequest,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    return await NomenclatureCardService.bulk_update_methodologies(db, request=request)
