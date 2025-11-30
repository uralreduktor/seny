from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Sequence

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pricing_kb_ai.enums import LifecycleStatus, NodeType, SearchMode
from app.modules.pricing_kb_ai.models.nomenclature import Nomenclature
from app.modules.pricing_kb_ai.models.nomenclature_card_metadata import (
    NomenclatureCardSynonym,
    NomenclatureCardVersion,
)
from app.modules.pricing_kb_ai.models.nomenclature_node import NomenclatureNode
from app.modules.pricing_kb_ai.schemas.nomenclature_cards import (
    BulkLifecycleRequest,
    BulkMethodologyRequest,
    BulkOperationResult,
    CardAuditMeta,
    CardLifecycleChange,
    CardSynonym,
    CardUsage,
    NomenclatureCard,
    NomenclatureCardCreate,
    NomenclatureCardUpdate,
    PaginatedCards,
    PaginationMeta,
)
from app.modules.pricing_kb_ai.services.nomenclature_lifecycle import (
    LifecycleValidationError,
    NomenclatureLifecycleService,
)
from app.modules.pricing_kb_ai.services.schema_registry import (
    SchemaRegistry,
    SchemaRegistryError,
    SchemaValidationError,
)
from app.modules.pricing_kb_ai.services.semantic_search import (
    SemanticSearchError,
    SemanticSearchService,
)


def _generate_card_code(prefix: str) -> str:
    suffix = uuid.uuid4().hex[:6].upper()
    return f"{prefix}-{suffix}"


class NomenclatureCardService:
    @staticmethod
    async def _collect_classification_codes(
        db: AsyncSession, node: NomenclatureNode
    ) -> dict[str, Optional[str]]:
        """
        Walks up the classifier tree to capture codes for each hierarchy level.
        """
        codes: dict[str, Optional[str]] = {
            "segment_code": None,
            "family_code": None,
            "class_code": None,
            "category_code": None,
        }
        current: Optional[NomenclatureNode] = node
        visited: set[int] = set()

        while current and current.id not in visited:
            if current.node_type == NodeType.SEGMENT:
                codes["segment_code"] = current.code
            elif current.node_type == NodeType.FAMILY:
                codes["family_code"] = current.code
            elif current.node_type == NodeType.CLASS:
                codes["class_code"] = current.code
            elif current.node_type == NodeType.CATEGORY:
                codes["category_code"] = current.code
            visited.add(current.id)

            if current.parent is not None:
                current = current.parent
            elif current.parent_id:
                current = await db.get(NomenclatureNode, current.parent_id)
            else:
                current = None

        return codes

    @staticmethod
    async def list_cards(
        db: AsyncSession,
        *,
        node_id: Optional[int],
        lifecycle_status: Optional[LifecycleStatus],
        manufacturer: Optional[str],
        code: Optional[str],
        search: Optional[str],
        has_methodology: Optional[bool],
        base_price_min: Optional[Decimal],
        base_price_max: Optional[Decimal],
        sort_by: str,
        sort_order: str,
        page: int,
        page_size: int,
        search_mode: SearchMode = SearchMode.TEXT,
    ) -> tuple[List[Nomenclature], PaginationMeta]:
        page = max(1, page)
        page_size = max(1, min(page_size, 100))

        base_stmt = select(Nomenclature)
        if node_id:
            base_stmt = base_stmt.where(Nomenclature.node_id == node_id)
        if lifecycle_status:
            base_stmt = base_stmt.where(
                Nomenclature.lifecycle_status == lifecycle_status
            )
        if manufacturer:
            like_value = f"%{manufacturer.lower()}%"
            base_stmt = base_stmt.where(
                func.lower(Nomenclature.manufacturer).like(like_value)
            )
        if code:
            base_stmt = base_stmt.where(func.lower(Nomenclature.code) == code.lower())
        normalized_search = search.strip() if search else None
        text_similarity_expr = None
        semantic_similarity_expr = None
        similarity_expr = None
        confidence_expr = None
        if normalized_search:
            lowered_search = normalized_search.lower()
            pattern = f"%{lowered_search}%"
            base_stmt = base_stmt.where(
                func.lower(Nomenclature.canonical_name).like(pattern)
                | func.lower(Nomenclature.code).like(pattern)
            )
            text_similarity_expr = func.greatest(
                func.similarity(
                    func.lower(Nomenclature.canonical_name), lowered_search
                ),
                func.similarity(func.lower(Nomenclature.code), lowered_search),
            )
        if has_methodology is not None:
            if has_methodology:
                base_stmt = base_stmt.where(
                    func.array_length(Nomenclature.methodology_ids, 1) > 0
                )
            else:
                base_stmt = base_stmt.where(
                    (Nomenclature.methodology_ids == None)  # noqa: E711
                    | func.array_length(Nomenclature.methodology_ids, 1).is_(None)
                    | (func.array_length(Nomenclature.methodology_ids, 1) == 0)
                )
        if base_price_min is not None:
            base_stmt = base_stmt.where(Nomenclature.base_price >= base_price_min)
        if base_price_max is not None:
            base_stmt = base_stmt.where(Nomenclature.base_price <= base_price_max)

        search_vector: Optional[List[float]] = None
        if normalized_search and search_mode in (
            SearchMode.SEMANTIC,
            SearchMode.COMBINED,
        ):
            try:
                search_vector = await SemanticSearchService.build_query_embedding(
                    normalized_search
                )
            except SemanticSearchError as exc:
                raise ValueError(str(exc)) from exc
            semantic_similarity_expr = 1 - Nomenclature.ai_embedding.cosine_distance(
                search_vector
            )
            if search_mode == SearchMode.SEMANTIC:
                base_stmt = base_stmt.where(Nomenclature.ai_embedding.is_not(None))

        if normalized_search:
            if search_mode == SearchMode.TEXT:
                similarity_expr = text_similarity_expr
            elif search_mode == SearchMode.SEMANTIC:
                similarity_expr = semantic_similarity_expr
            else:
                similarity_expr = (
                    func.coalesce(text_similarity_expr, 0)
                    + func.coalesce(semantic_similarity_expr, 0)
                ) / 2

        if similarity_expr is not None:
            confidence_expr = func.coalesce(similarity_expr, 0).label(
                "search_confidence"
            )
            base_stmt = base_stmt.add_columns(confidence_expr)

        sort_column = {
            "updated_at": Nomenclature.updated_at,
            "code": Nomenclature.code,
            "base_price": Nomenclature.base_price,
            "usage_count": Nomenclature.usage_count,
        }.get(sort_by, Nomenclature.updated_at)
        sort_expr = sort_column.desc() if sort_order == "desc" else sort_column.asc()

        total_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = await db.scalar(total_stmt)

        order_by_expressions = []
        if confidence_expr is not None:
            order_by_expressions.append(confidence_expr.desc())
        order_by_expressions.append(sort_expr)
        order_by_expressions.append(Nomenclature.id)

        stmt = (
            base_stmt.order_by(*order_by_expressions)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await db.execute(stmt)
        if confidence_expr is not None:
            rows = result.unique().all()
            items = []
            for row in rows:
                card = row[0]
                confidence_value = row[1]
                if confidence_value is not None:
                    setattr(card, "search_confidence", float(confidence_value))
                items.append(card)
        else:
            items = result.scalars().unique().all()

        meta = PaginationMeta(
            page=page,
            page_size=page_size,
            total=total or 0,
            pages=((total or 0) + page_size - 1) // page_size if page_size else 1,
        )
        return items, meta

    @staticmethod
    async def get(db: AsyncSession, card_id: int) -> Optional[Nomenclature]:
        return await db.get(Nomenclature, card_id)

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: NomenclatureCardCreate,
        author_id: Optional[uuid.UUID],
    ) -> Nomenclature:
        node = await db.get(NomenclatureNode, payload.node_id)
        if not node:
            raise ValueError("Node not found")

        try:
            await SchemaRegistry.validate_payload(
                db, node.id, payload.attributes_payload or {}
            )
        except (SchemaRegistryError, SchemaValidationError) as exc:
            raise ValueError(str(exc)) from exc

        classification_codes = (
            await NomenclatureCardService._collect_classification_codes(db, node)
        )
        code = payload.code or _generate_card_code(node.code)
        card = Nomenclature(
            code=code,
            canonical_name=payload.canonical_name,
            node_id=payload.node_id,
            node_version=payload.node_version or node.version,
            **classification_codes,
            lifecycle_status=LifecycleStatus.DRAFT,
            type=payload.type,
            category=payload.category,
            subclass=payload.subclass,
            attributes_payload=payload.attributes_payload,
            files=[file.model_dump(exclude_none=True) for file in payload.files],
            methodology_ids=payload.methodology_ids,
            manufacturer=payload.manufacturer,
            standard_document=payload.standard_document,
            article=payload.article,
            base_price=payload.base_price,
            cost_price=payload.cost_price,
            price_currency=payload.price_currency,
            price_source=payload.price_source,
            price_valid_until=payload.price_valid_until,
            price_confidence=payload.price_confidence,
            related_nomenclature_ids=payload.related_nomenclature_ids,
            created_by_id=author_id,
            standard_parameters=payload.attributes_payload,
            required_parameters=None,
            optional_parameters=None,
            tags=payload.tags,
        )
        db.add(card)
        await db.flush()

        await NomenclatureCardService._replace_synonyms(db, card.id, payload.synonyms)

        await db.commit()
        await db.refresh(card)
        return card

    @staticmethod
    async def update(
        db: AsyncSession,
        card_id: int,
        payload: NomenclatureCardUpdate,
        editor_id: Optional[uuid.UUID],
    ) -> Optional[Nomenclature]:
        card = await db.get(Nomenclature, card_id)
        if not card:
            return None

        update_data = payload.model_dump(exclude_unset=True)
        changed_fields: List[str] = []
        for field, value in update_data.items():
            if field == "synonyms":
                await NomenclatureCardService._replace_synonyms(
                    db, card.id, value or []
                )
                continue
            if field == "files" and value is not None:
                value = [file.model_dump(exclude_none=True) for file in value]
            setattr(card, field, value)
            changed_fields.append(field)

        if "attributes_payload" in changed_fields:
            if card.node_id is None:
                raise ValueError("Card is not linked to a classifier node")
            try:
                await SchemaRegistry.validate_payload(
                    db, card.node_id, card.attributes_payload or {}
                )
            except (SchemaRegistryError, SchemaValidationError) as exc:
                raise ValueError(str(exc)) from exc
            card.standard_parameters = card.attributes_payload

        card.last_editor_id = editor_id
        card.version += 1

        if changed_fields:
            db.add(
                NomenclatureCardVersion(
                    card_id=card.id,
                    version=card.version,
                    diff_payload={"fields": changed_fields},
                    author_id=editor_id,
                )
            )

        await db.commit()
        await db.refresh(card)
        return card

    @staticmethod
    async def change_lifecycle(
        db: AsyncSession,
        card_id: int,
        payload: CardLifecycleChange,
        actor_id: Optional[uuid.UUID],
    ) -> Optional[Nomenclature]:
        card = await db.get(Nomenclature, card_id)
        if not card:
            return None
        await NomenclatureLifecycleService.change_status(
            db=db,
            card=card,
            payload=payload,
            actor_id=str(actor_id) if actor_id else None,
        )
        await db.commit()
        await db.refresh(card)
        return card

    @staticmethod
    async def bulk_change_lifecycle(
        db: AsyncSession,
        request: BulkLifecycleRequest,
        actor_id: Optional[uuid.UUID],
    ) -> List[BulkOperationResult]:
        results: List[BulkOperationResult] = []
        touched_cards: List[Nomenclature] = []
        actor_ref = str(actor_id) if actor_id else None

        for card_id in request.card_ids:
            card = await db.get(Nomenclature, card_id)
            if not card:
                results.append(
                    BulkOperationResult(
                        card_id=card_id, status="not_found", message="Card not found"
                    )
                )
                continue

            try:
                await NomenclatureLifecycleService.change_status(
                    db=db,
                    card=card,
                    payload=request.change,
                    actor_id=actor_ref,
                )
            except LifecycleValidationError as exc:
                results.append(
                    BulkOperationResult(
                        card_id=card_id, status="error", message="; ".join(exc.errors)
                    )
                )
                continue
            touched_cards.append(card)
            results.append(BulkOperationResult(card_id=card_id, status="updated"))

        if touched_cards:
            await db.commit()
            for card in touched_cards:
                await db.refresh(card)
        else:
            await db.rollback()

        return results

    @staticmethod
    async def bulk_update_methodologies(
        db: AsyncSession,
        request: BulkMethodologyRequest,
    ) -> List[BulkOperationResult]:
        results: List[BulkOperationResult] = []
        methodology_set = set(request.methodology_ids)

        for card_id in request.card_ids:
            card = await db.get(Nomenclature, card_id)
            if not card:
                results.append(
                    BulkOperationResult(
                        card_id=card_id, status="not_found", message="Card not found"
                    )
                )
                continue

            current = set(card.methodology_ids or [])
            if request.mode == "replace":
                new_values = methodology_set
            elif request.mode == "append":
                new_values = current.union(methodology_set)
            else:  # remove
                new_values = current.difference(methodology_set)

            card.methodology_ids = sorted(new_values)
            card.version += 1
            results.append(BulkOperationResult(card_id=card_id, status="updated"))

        if results:
            await db.commit()
        else:
            await db.rollback()
        return results

    @staticmethod
    async def list_versions(
        db: AsyncSession, card_id: int
    ) -> Sequence[NomenclatureCardVersion]:
        stmt = (
            select(NomenclatureCardVersion)
            .where(NomenclatureCardVersion.card_id == card_id)
            .order_by(NomenclatureCardVersion.version.desc())
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def _replace_synonyms(
        db: AsyncSession,
        card_id: int,
        synonyms: List[CardSynonym],
    ) -> None:
        await db.execute(
            delete(NomenclatureCardSynonym).where(
                NomenclatureCardSynonym.card_id == card_id
            )
        )
        for synonym in synonyms:
            db.add(
                NomenclatureCardSynonym(
                    card_id=card_id,
                    value=synonym.value,
                    locale=synonym.locale,
                )
            )

    @staticmethod
    def serialize(card: Nomenclature) -> NomenclatureCard:
        synonyms = [
            CardSynonym(value=s.value, locale=s.locale) for s in card.synonym_records
        ]
        usage = [
            CardUsage(
                position_id=entry.position_id,
                tender_id=None,
                tender_number=None,
                usage_count=entry.usage_count,
                average_price=entry.average_price,
                last_used_at=entry.last_used_at,
            )
            for entry in card.usage_records
        ]
        audit = CardAuditMeta(
            created_by=str(card.created_by_id) if card.created_by_id else None,
            created_at=card.created_at,
            last_editor_id=str(card.last_editor_id) if card.last_editor_id else None,
            last_reviewed_at=card.last_reviewed_at,
        )
        return NomenclatureCard(
            id=card.id,
            node_id=card.node_id,
            node_version=card.node_version,
            code=card.code,
            canonical_name=card.canonical_name,
            type=card.type,
            category=card.category,
            subclass=card.subclass,
            lifecycle_status=card.lifecycle_status,
            lifecycle_reason=card.lifecycle_reason,
            effective_from=card.effective_from,
            effective_to=card.effective_to,
            attributes_payload=card.attributes_payload or {},
            files=card.files or [],
            methodology_ids=card.methodology_ids or [],
            synonyms=synonyms,
            manufacturer=card.manufacturer,
            standard_document=card.standard_document,
            article=card.article,
            base_price=card.base_price,
            cost_price=card.cost_price,
            price_currency=card.price_currency,
            price_source=card.price_source,
            price_valid_until=card.price_valid_until,
            price_confidence=card.price_confidence,
            usage_count=card.usage_count,
            average_price=card.average_price,
            version=card.version,
            audit=audit,
            position_usage=usage,
            tags=card.tags or {},
            segment_code=card.segment_code,
            family_code=card.family_code,
            class_code=card.class_code,
            category_code=card.category_code,
            related_nomenclature_ids=card.related_nomenclature_ids or [],
            audit_log_id=card.audit_log_id,
            search_confidence=getattr(card, "search_confidence", None),
        )
