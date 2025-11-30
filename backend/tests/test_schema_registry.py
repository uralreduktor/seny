import pytest

from app.modules.pricing_kb_ai.services.schema_registry import (
    SchemaRegistry,
    SchemaRegistryEntry,
    SchemaValidationError,
)


def _make_entry() -> SchemaRegistryEntry:
    schema = {
        "type": "object",
        "properties": {
            "power": {"type": "number"},
            "model": {"type": "string"},
        },
        "required": ["power"],
        "additionalProperties": False,
    }
    return SchemaRegistryEntry(node_id=1, version=1, schema=schema)


def test_schema_registry_validation_passes():
    entry = _make_entry()
    SchemaRegistry._adapter_cache.clear()

    SchemaRegistry._run_validation(entry, {"power": 10, "model": "x"})


def test_schema_registry_validation_fails_with_message():
    entry = _make_entry()
    SchemaRegistry._adapter_cache.clear()

    with pytest.raises(SchemaValidationError) as exc:
        SchemaRegistry._run_validation(entry, {"model": "x"})

    assert "power" in exc.value.errors[0]


def test_deep_merge_combines_required():
    base = {"properties": {"power": {"type": "number"}}, "required": ["power"]}
    override = {"properties": {"model": {"type": "string"}}, "required": ["model"]}

    merged = SchemaRegistry._deep_merge(base, override)

    assert merged["properties"]["power"]["type"] == "number"
    assert merged["properties"]["model"]["type"] == "string"
    assert set(merged["required"]) == {"power", "model"}


def test_exclude_properties_removes_required():
    schema = {
        "properties": {
            "power": {"type": "number"},
            "model": {"type": "string"},
        },
        "required": ["power", "model"],
    }
    preset = {"properties": {"model": {"type": "string"}}}

    result = SchemaRegistry._exclude_properties(schema, preset)

    assert "model" not in result["properties"]
    assert result["required"] == ["power"]
