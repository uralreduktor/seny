from datetime import UTC, datetime
from decimal import Decimal

import app.db.base  # noqa: F401
from app.modules.pricing_kb_ai.enums import LifecycleStatus
from app.modules.pricing_kb_ai.models.nomenclature import Nomenclature
from app.modules.pricing_kb_ai.models.nomenclature_card_metadata import (
    NomenclatureCardSynonym,
)
from app.modules.pricing_kb_ai.services.nomenclature_cards import (
    NomenclatureCardService,
)


def test_serialize_card_returns_expected_schema():
    card = Nomenclature(
        code="AA-TEST01",
        canonical_name="Test Card",
        node_id=1,
        node_version=1,
        segment_code="AA",
        family_code="AA.BB",
        class_code="AA.BB.CC",
        category_code="AA.BB.CC.DD",
        lifecycle_status=LifecycleStatus.DRAFT,
        attributes_payload={"power": 10},
        files=[{"type": "datasheet", "storage_key": "s3://file"}],
        methodology_ids=[1, 2],
        manufacturer="ACME",
        standard_document="GOST 1",
        article="X-1",
        base_price=100,
        cost_price=80,
        price_currency="RUB",
        price_source="manual",
        price_valid_until=datetime.now(UTC),
        price_confidence=Decimal("0.85"),
        usage_count=0,
        average_price=None,
        version=1,
        tags={"group": "testing"},
        related_nomenclature_ids=[10, 20],
    )
    card.id = 42
    card.created_at = datetime.now(UTC)
    card.effective_from = datetime.now(UTC)
    card.synonym_records = [
        NomenclatureCardSynonym(card_id=42, value="Alias", locale="en-US")
    ]
    card.usage_records = []
    setattr(card, "search_confidence", 0.73)

    serialized = NomenclatureCardService.serialize(card)

    assert serialized.code == card.code
    assert serialized.canonical_name == card.canonical_name
    assert serialized.synonyms[0].value == "Alias"
    assert serialized.methodology_ids == [1, 2]
    assert serialized.segment_code == "AA"
    assert serialized.related_nomenclature_ids == [10, 20]
    assert serialized.price_confidence == card.price_confidence
    assert serialized.search_confidence == 0.73
