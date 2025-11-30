from __future__ import annotations

from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status as http_status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.modules.auth.models.user import User
from app.modules.pricing_kb_ai.enums import (
    LifecycleStatus,
    NodeStatus,
    SchemaStatus,
    SearchMode,
)
from app.modules.pricing_kb_ai.models.nomenclature_schema import NomenclatureClassSchema
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
    ClassSchemaDiff,
    ClassSchemaDraft,
    ClassSchemaVersion,
    NomenclatureNodeCreate,
    NomenclatureNodeResponse,
    NomenclatureNodeUpdate,
)
from app.modules.pricing_kb_ai.schemas.nomenclature_presets import (
    AttributePresetCreate,
    AttributePresetResponse,
    AttributePresetUpdate,
)
from app.modules.pricing_kb_ai.services.nomenclature_cards import (
    NomenclatureCardService,
)
from app.modules.pricing_kb_ai.services.nomenclature_lifecycle import (
    LifecycleValidationError,
)
from app.modules.pricing_kb_ai.services.nomenclature_nodes import (
    NomenclatureNodeService,
    NomenclatureSchemaService,
)
from app.modules.pricing_kb_ai.services.nomenclature_presets import (
    NomenclaturePresetService,
)

router = APIRouter(prefix="/nomenclature", tags=["nomenclature"])


def serialize_schema_version(schema: NomenclatureClassSchema) -> ClassSchemaVersion:
    preset_objects = [
        link.preset
        for link in getattr(schema, "presets", [])
        if getattr(link, "preset", None)
    ]
    return ClassSchemaVersion.model_validate(
        {
            "id": schema.id,
            "node_id": schema.node_id,
            "version": schema.version,
            "status": schema.status,
            "json_schema": schema.json_schema,
            "metadata": schema.meta or {},
            "presets": preset_objects,
            "comment": schema.comment,
            "published_at": schema.published_at,
            "created_at": schema.created_at,
        }
    )


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
    schemas = await NomenclatureSchemaService.list_versions(db, node_id)
    return [serialize_schema_version(schema) for schema in schemas]


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
    if not schema:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Schema not found after creation",
        )
    return serialize_schema_version(schema)


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
    return serialize_schema_version(schema)


@router.get(
    "/nodes/{node_id}/schemas/{version}/diff",
    response_model=ClassSchemaDiff,
)
async def get_schema_diff(
    node_id: int,
    version: int,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    revision = await NomenclatureSchemaService.get_schema_diff(db, node_id, version)
    if not revision:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Diff not found"
        )
    return ClassSchemaDiff(
        node_id=revision.node_id,
        version=revision.version,
        created_at=revision.created_at,
        diff=revision.diff_payload,
    )


@router.get("/presets", response_model=list[AttributePresetResponse])
async def list_attribute_presets(
    status: Optional[SchemaStatus] = None,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    presets = await NomenclaturePresetService.list_presets(db, status=status)
    return presets


@router.post(
    "/presets",
    response_model=AttributePresetResponse,
    status_code=http_status.HTTP_201_CREATED,
)
async def create_attribute_preset(
    payload: AttributePresetCreate,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    try:
        preset = await NomenclaturePresetService.create(db, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=http_status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc
    return preset


@router.get("/presets/{preset_id}", response_model=AttributePresetResponse)
async def get_attribute_preset(
    preset_id: int,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    preset = await NomenclaturePresetService.get(db, preset_id)
    if not preset:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Preset not found"
        )
    return preset


@router.patch("/presets/{preset_id}", response_model=AttributePresetResponse)
async def update_attribute_preset(
    preset_id: int,
    payload: AttributePresetUpdate,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    preset = await NomenclaturePresetService.update(db, preset_id, payload)
    if not preset:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Preset not found"
        )
    return preset


@router.delete(
    "/presets/{preset_id}",
    status_code=http_status.HTTP_204_NO_CONTENT,
)
async def archive_attribute_preset(
    preset_id: int,
    db: AsyncSession = Depends(deps.get_db),
    _: User = Depends(deps.get_current_active_user),
):
    success = await NomenclaturePresetService.archive(db, preset_id)
    if not success:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Preset not found"
        )


@router.get("/cards", response_model=PaginatedCards)
async def list_cards(
    node_id: Optional[int] = None,
    lifecycle_status: Optional[LifecycleStatus] = None,
    search: Optional[str] = None,
    search_mode: SearchMode = SearchMode.TEXT,
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
    try:
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
            search_mode=search_mode,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
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
    try:
        card = await NomenclatureCardService.update(
            db, card_id, payload, current_user.id
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
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
    try:
        card = await NomenclatureCardService.change_lifecycle(
            db, card_id, payload, current_user.id
        )
    except LifecycleValidationError as exc:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST, detail=exc.errors
        ) from exc
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
