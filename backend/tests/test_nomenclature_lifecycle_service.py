from datetime import UTC, datetime

import app.db.base  # noqa: F401
from app.modules.pricing_kb_ai.enums import LifecycleStatus, NodeType
from app.modules.pricing_kb_ai.models.nomenclature import Nomenclature
from app.modules.pricing_kb_ai.models.nomenclature_node import NomenclatureNode
from app.modules.pricing_kb_ai.schemas.nomenclature_cards import CardLifecycleChange
from app.modules.pricing_kb_ai.services.nomenclature_lifecycle import (
    LifecycleValidationError,
    NomenclatureLifecycleService,
)


def _make_card(status: LifecycleStatus = LifecycleStatus.DRAFT) -> Nomenclature:
    return Nomenclature(
        code="AA-1",
        canonical_name="Test card",
        node_id=1,
        node_version=1,
        lifecycle_status=status,
        attributes_payload={"power": 10},
        methodology_ids=[1],
        effective_from=datetime.now(UTC),
    )


def _make_node(version: int = 1) -> NomenclatureNode:
    return NomenclatureNode(
        code="AA.BB.CC.DD",
        name="Test node",
        node_type=NodeType.CATEGORY,
        depth=3,
        version=version,
    )


def test_validate_transition_blocks_direct_active():
    card = _make_card()
    node = _make_node()
    payload = CardLifecycleChange(target_status=LifecycleStatus.ACTIVE)

    errors = NomenclatureLifecycleService.validate_transition(card, payload, node)

    assert errors
    assert "запрещён" in errors[0]


def test_validate_transition_requires_matching_node_version():
    card = _make_card()
    node = _make_node(version=2)
    payload = CardLifecycleChange(target_status=LifecycleStatus.REVIEW)

    errors = NomenclatureLifecycleService.validate_transition(card, payload, node)

    assert any("узла устарела" in err for err in errors)


def test_validate_transition_requires_archive_reason():
    card = _make_card(status=LifecycleStatus.ACTIVE)
    node = _make_node()
    payload = CardLifecycleChange(target_status=LifecycleStatus.ARCHIVED)

    errors = NomenclatureLifecycleService.validate_transition(card, payload, node)

    assert errors
    assert any("архивации" in err for err in errors)


def test_validate_transition_passes_for_review():
    card = _make_card()
    node = _make_node()
    payload = CardLifecycleChange(target_status=LifecycleStatus.REVIEW)

    errors = NomenclatureLifecycleService.validate_transition(card, payload, node)

    assert errors == []
