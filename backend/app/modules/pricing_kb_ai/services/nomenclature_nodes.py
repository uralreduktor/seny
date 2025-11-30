from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.pricing_kb_ai.enums import NodeStatus, PresetMode, SchemaStatus
from app.modules.pricing_kb_ai.models.nomenclature_node import (
    NomenclatureNode,
    NomenclatureNodeVersion,
)
from app.modules.pricing_kb_ai.models.nomenclature_schema import (
    ClassAttributeRevision,
    ClassSchemaPreset,
    NomenclatureClassSchema,
)
from app.modules.pricing_kb_ai.schemas.nomenclature_nodes import (
    ClassSchemaDiff,
    ClassSchemaDraft,
    NomenclatureNodeCreate,
    NomenclatureNodeUpdate,
)
from app.modules.pricing_kb_ai.services.schema_registry import SchemaRegistry


class NomenclatureNodeService:
    @staticmethod
    async def _close_active_version(
        db: AsyncSession, node_id: int, version: int, closed_at: datetime
    ) -> None:
        stmt = (
            select(NomenclatureNodeVersion)
            .where(
                NomenclatureNodeVersion.node_id == node_id,
                NomenclatureNodeVersion.version == version,
            )
            .limit(1)
        )
        result = await db.execute(stmt)
        snapshot = result.scalar_one_or_none()
        if snapshot:
            snapshot.effective_to = closed_at

    @staticmethod
    async def _create_version_snapshot(
        db: AsyncSession, node: NomenclatureNode
    ) -> None:
        db.add(
            NomenclatureNodeVersion(
                node_id=node.id,
                version=node.version,
                parent_id=node.parent_id,
                code=node.code,
                name=node.name,
                node_type=node.node_type,
                depth=node.depth,
                status=node.status,
                is_archived=node.is_archived,
                effective_from=node.effective_from,
                effective_to=node.effective_to,
                meta=node.meta or {},
            )
        )

    @staticmethod
    async def list_nodes(
        db: AsyncSession,
        parent_id: Optional[int] = None,
        depth: Optional[int] = None,
        status: Optional[NodeStatus] = None,
    ) -> List[NomenclatureNode]:
        stmt = select(NomenclatureNode)
        if parent_id is not None:
            stmt = stmt.where(NomenclatureNode.parent_id == parent_id)
        if depth is not None:
            stmt = stmt.where(NomenclatureNode.depth == depth)
        if status is not None:
            stmt = stmt.where(NomenclatureNode.status == status)
        stmt = stmt.order_by(NomenclatureNode.code)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get(db: AsyncSession, node_id: int) -> Optional[NomenclatureNode]:
        return await db.get(NomenclatureNode, node_id)

    @staticmethod
    async def create(
        db: AsyncSession, payload: NomenclatureNodeCreate
    ) -> NomenclatureNode:
        parent: Optional[NomenclatureNode] = None
        depth = 0
        if payload.parent_id:
            parent = await db.get(NomenclatureNode, payload.parent_id)
            if not parent:
                raise ValueError("Parent node not found")
            depth = parent.depth + 1

        now = datetime.utcnow()
        node = NomenclatureNode(
            code=payload.code,
            name=payload.name,
            node_type=payload.node_type,
            parent_id=payload.parent_id,
            depth=depth,
            status=NodeStatus.DRAFT,
            effective_from=now,
        )
        db.add(node)
        await db.flush()
        await NomenclatureNodeService._create_version_snapshot(db, node)
        await db.commit()
        await db.refresh(node)
        return node

    @staticmethod
    async def update(
        db: AsyncSession, node_id: int, payload: NomenclatureNodeUpdate
    ) -> Optional[NomenclatureNode]:
        node = await db.get(NomenclatureNode, node_id)
        if not node:
            return None

        now = datetime.utcnow()
        await NomenclatureNodeService._close_active_version(
            db, node.id, node.version, now
        )

        update_data = payload.model_dump(exclude_unset=True)
        metadata = update_data.pop("metadata", None)
        if metadata is not None:
            node.meta = metadata
        for field, value in update_data.items():
            setattr(node, field, value)

        node.version += 1
        node.effective_from = now
        if "effective_to" not in update_data:
            node.effective_to = None

        await db.flush()
        await NomenclatureNodeService._create_version_snapshot(db, node)
        await db.commit()
        await db.refresh(node)
        return node

    @staticmethod
    async def archive(db: AsyncSession, node_id: int) -> Optional[NomenclatureNode]:
        node = await db.get(NomenclatureNode, node_id)
        if not node:
            return None
        now = datetime.utcnow()
        await NomenclatureNodeService._close_active_version(
            db, node.id, node.version, now
        )
        node.is_archived = True
        node.status = NodeStatus.ARCHIVED
        node.effective_from = now
        node.effective_to = now
        node.version += 1

        await db.flush()
        await NomenclatureNodeService._create_version_snapshot(db, node)
        await db.commit()
        await db.refresh(node)
        return node


class NomenclatureSchemaService:
    @staticmethod
    async def list_versions(
        db: AsyncSession, node_id: int
    ) -> List[NomenclatureClassSchema]:
        stmt = (
            NomenclatureSchemaService._schema_with_presets_query()
            .where(NomenclatureClassSchema.node_id == node_id)
            .order_by(NomenclatureClassSchema.version.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_version(
        db: AsyncSession,
        node_id: int,
        payload: ClassSchemaDraft,
        author_id: Optional[str],
    ) -> NomenclatureClassSchema:
        max_version_stmt = select(func.max(NomenclatureClassSchema.version)).where(
            NomenclatureClassSchema.node_id == node_id
        )
        result = await db.execute(max_version_stmt)
        next_version = (result.scalar_one_or_none() or 0) + 1

        schema = NomenclatureClassSchema(
            node_id=node_id,
            version=next_version,
            json_schema=payload.json_schema,
            status=SchemaStatus.DRAFT,
            created_by_id=author_id,
            comment=payload.comment,
        )
        db.add(schema)
        await db.flush()

        for preset_id in payload.presets:
            db.add(
                ClassSchemaPreset(
                    class_schema_id=schema.id,
                    preset_id=preset_id,
                    mode=PresetMode.INCLUDE,
                )
            )

        await db.commit()
        return await NomenclatureSchemaService.get_schema_by_id(db, schema.id)

    @staticmethod
    async def publish_version(
        db: AsyncSession,
        node_id: int,
        version: int,
    ) -> Optional[NomenclatureClassSchema]:
        stmt = NomenclatureSchemaService._schema_with_presets_query().where(
            NomenclatureClassSchema.node_id == node_id,
            NomenclatureClassSchema.version == version,
        )
        result = await db.execute(stmt)
        schema = result.scalar_one_or_none()
        if not schema:
            return None
        schema.status = SchemaStatus.PUBLISHED
        schema.published_at = datetime.utcnow()

        previous = await NomenclatureSchemaService._get_previous_schema(
            db, node_id, version
        )
        node = await db.get(NomenclatureNode, node_id)
        if node:
            node.version = version

        diff_payload = NomenclatureSchemaService._calculate_schema_diff(
            previous.json_schema if previous else None, schema.json_schema
        )
        db.add(
            ClassAttributeRevision(
                schema_id=schema.id,
                node_id=node_id,
                version=version,
                diff_payload=diff_payload,
                author_id=schema.created_by_id,
            )
        )
        await db.commit()
        refreshed = await NomenclatureSchemaService.get_schema_by_id(db, schema.id)
        await SchemaRegistry.invalidate_cache(node_id)
        return refreshed

    @staticmethod
    async def get_schema_diff(
        db: AsyncSession, node_id: int, version: int
    ) -> Optional[ClassAttributeRevision]:
        stmt = (
            select(ClassAttributeRevision)
            .where(
                ClassAttributeRevision.node_id == node_id,
                ClassAttributeRevision.version == version,
            )
            .limit(1)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def _get_previous_schema(
        db: AsyncSession, node_id: int, current_version: int
    ) -> Optional[NomenclatureClassSchema]:
        stmt = (
            NomenclatureSchemaService._schema_with_presets_query()
            .where(
                NomenclatureClassSchema.node_id == node_id,
                NomenclatureClassSchema.version < current_version,
            )
            .order_by(NomenclatureClassSchema.version.desc())
            .limit(1)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    def _calculate_schema_diff(
        previous: Optional[dict], current: Optional[dict]
    ) -> dict:
        prev_props = (previous or {}).get("properties", {})
        curr_props = (current or {}).get("properties", {})

        added = {
            key: curr_props[key] for key in curr_props.keys() if key not in prev_props
        }
        removed = [key for key in prev_props.keys() if key not in curr_props]
        changed = {}
        for key in curr_props.keys():
            if key in prev_props and curr_props[key] != prev_props[key]:
                changed[key] = {"old": prev_props[key], "new": curr_props[key]}

        return {"added": added, "removed": removed, "changed": changed}

    @staticmethod
    def _schema_with_presets_query():
        return select(NomenclatureClassSchema).options(
            selectinload(NomenclatureClassSchema.presets).selectinload(
                ClassSchemaPreset.preset
            )
        )

    @staticmethod
    async def get_schema_by_id(
        db: AsyncSession, schema_id: int
    ) -> Optional[NomenclatureClassSchema]:
        stmt = (
            NomenclatureSchemaService._schema_with_presets_query()
            .where(NomenclatureClassSchema.id == schema_id)
            .limit(1)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
