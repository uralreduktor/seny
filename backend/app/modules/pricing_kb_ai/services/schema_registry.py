from __future__ import annotations

import json
from copy import deepcopy
from dataclasses import dataclass
from typing import Annotated, Any, Dict, List, Optional, Tuple

from jsonschema import Draft202012Validator
from jsonschema.exceptions import ValidationError as JsonSchemaValidationError
from loguru import logger
from pydantic import AfterValidator, TypeAdapter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.redis import get_redis
from app.modules.pricing_kb_ai.enums import PresetMode, SchemaStatus
from app.modules.pricing_kb_ai.models.nomenclature_node import NomenclatureNode
from app.modules.pricing_kb_ai.models.nomenclature_schema import (
    ClassSchemaPreset,
    NomenclatureClassSchema,
)


@dataclass
class SchemaRegistryEntry:
    node_id: int
    version: int
    schema: Dict[str, Any]


class SchemaRegistryError(RuntimeError):
    pass


class SchemaValidationError(ValueError):
    def __init__(self, errors: List[str]) -> None:
        super().__init__("; ".join(errors))
        self.errors = errors


class SchemaRegistry:
    CACHE_TTL_SECONDS = 3600
    _adapter_cache: dict[Tuple[int, int], TypeAdapter[dict[str, Any]]] = {}

    @classmethod
    async def validate_payload(
        cls, db: AsyncSession, node_id: int, payload: Optional[dict]
    ) -> SchemaRegistryEntry:
        entry = await cls.get_entry(db, node_id)
        cls._run_validation(entry, payload or {})
        return entry

    @classmethod
    async def get_entry(cls, db: AsyncSession, node_id: int) -> SchemaRegistryEntry:
        redis = await get_redis()
        cache_key = cls._cache_key(node_id)

        if redis:
            cached = await redis.get(cache_key)
            if cached:
                try:
                    data = json.loads(cached)
                    return SchemaRegistryEntry(
                        node_id=node_id,
                        version=data["version"],
                        schema=data["schema"],
                    )
                except (KeyError, json.JSONDecodeError):
                    logger.warning(
                        "Failed to decode cached schema for node {}", node_id
                    )

        entry = await cls._fetch_from_db(db, node_id)
        if entry is None:
            raise SchemaRegistryError(
                f"Не найдена опубликованная схема для узла {node_id}"
            )
        if redis and entry:
            payload = json.dumps(
                {
                    "version": entry.version,
                    "schema": entry.schema,
                }
            )
            try:
                await redis.setex(cache_key, cls.CACHE_TTL_SECONDS, payload)
            except Exception as exc:  # noqa: BLE001
                logger.warning("Failed to cache schema {}: {}", node_id, exc)

        if entry is None:
            raise SchemaRegistryError(
                f"Не найдена опубликованная схема для узла {node_id}"
            )
        return entry

    @classmethod
    async def invalidate_cache(cls, node_id: int) -> None:
        cls._adapter_cache = {
            key: adapter
            for key, adapter in cls._adapter_cache.items()
            if key[0] != node_id
        }
        redis = await get_redis()
        if redis:
            try:
                await redis.delete(cls._cache_key(node_id))
            except Exception as exc:  # noqa: BLE001
                logger.warning("Failed to invalidate schema cache {}: {}", node_id, exc)

    @classmethod
    def _run_validation(cls, entry: SchemaRegistryEntry, payload: dict) -> None:
        adapter = cls._get_adapter(entry)
        try:
            adapter.validate_python(payload)
        except JsonSchemaValidationError as exc:
            raise SchemaValidationError([cls._format_error(exc)]) from exc

    @classmethod
    def _get_adapter(cls, entry: SchemaRegistryEntry) -> TypeAdapter[dict[str, Any]]:
        cache_key = (entry.node_id, entry.version)
        adapter = cls._adapter_cache.get(cache_key)
        if adapter is not None:
            return adapter

        validator = Draft202012Validator(entry.schema)

        def _validate(value: dict[str, Any]) -> dict[str, Any]:
            validator.validate(value)
            return value

        annotated_type = Annotated[Dict[str, Any], AfterValidator(_validate)]
        adapter = TypeAdapter(annotated_type)
        cls._adapter_cache[cache_key] = adapter
        return adapter

    @staticmethod
    def _format_error(error: JsonSchemaValidationError) -> str:
        path = ".".join(str(p) for p in error.path) or "root"
        return f"{path}: {error.message}"

    @staticmethod
    def _cache_key(node_id: int) -> str:
        return f"nomenclature:schema:{node_id}"

    @classmethod
    async def _fetch_from_db(
        cls, db: AsyncSession, node_id: int
    ) -> Optional[SchemaRegistryEntry]:
        chain = await cls._collect_node_chain(db, node_id)
        if not chain:
            return None

        merged_schema: dict[str, Any] = {}
        latest_version = 0
        for node in chain:
            schema = await cls._load_schema_for_node(db, node.id)
            if not schema:
                continue
            latest_version = schema.version
            schema_payload = cls._apply_presets(schema)
            merged_schema = cls._deep_merge(merged_schema, schema_payload)

        if not merged_schema or latest_version == 0:
            return None
        return SchemaRegistryEntry(
            node_id=node_id,
            version=latest_version,
            schema=merged_schema,
        )

    @staticmethod
    async def _collect_node_chain(
        db: AsyncSession, node_id: int
    ) -> List[NomenclatureNode]:
        chain: List[NomenclatureNode] = []
        visited: set[int] = set()
        current = await db.get(NomenclatureNode, node_id)
        while current and current.id not in visited:
            chain.append(current)
            visited.add(current.id)
            if current.parent_id:
                current = await db.get(NomenclatureNode, current.parent_id)
            else:
                current = None
        chain.reverse()
        return chain

    @staticmethod
    async def _load_schema_for_node(
        db: AsyncSession, node_id: int
    ) -> Optional[NomenclatureClassSchema]:
        stmt = (
            select(NomenclatureClassSchema)
            .where(
                NomenclatureClassSchema.node_id == node_id,
                NomenclatureClassSchema.status == SchemaStatus.PUBLISHED,
            )
            .options(
                selectinload(NomenclatureClassSchema.presets).selectinload(
                    ClassSchemaPreset.preset
                )
            )
            .order_by(NomenclatureClassSchema.version.desc())
            .limit(1)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    def _apply_presets(cls, schema: NomenclatureClassSchema) -> dict:
        payload = deepcopy(schema.json_schema or {})
        for preset_link in schema.presets:
            preset_schema = preset_link.preset.json_schema or {}
            if preset_link.mode == PresetMode.EXCLUDE:
                payload = cls._exclude_properties(payload, preset_schema)
            else:
                payload = cls._deep_merge(payload, preset_schema)
        return payload

    @staticmethod
    def _deep_merge(base: dict, override: dict) -> dict:
        if not base:
            return deepcopy(override)
        result = deepcopy(base)
        for key, value in override.items():
            if (
                isinstance(value, dict)
                and isinstance(result.get(key), dict)
                and key != "required"
            ):
                result[key] = SchemaRegistry._deep_merge(result[key], value)
            elif key == "required" and isinstance(value, list):
                existing = set(result.get("required", []))
                existing.update(value)
                result["required"] = list(existing)
            else:
                result[key] = deepcopy(value)
        return result

    @staticmethod
    def _exclude_properties(schema_dict: dict, preset_schema: dict) -> dict:
        result = deepcopy(schema_dict)
        props_to_remove = preset_schema.get("properties", {})
        if not props_to_remove:
            return result

        result_props = result.setdefault("properties", {})
        for prop in props_to_remove.keys():
            result_props.pop(prop, None)
            if isinstance(result.get("required"), list):
                result["required"] = [
                    item for item in result["required"] if item != prop
                ]
        return result
