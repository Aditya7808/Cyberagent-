import pytest
import uuid
from app.tools.validator import ToolParameterValidator


def test_tool_parameter_validator_success():
    validator = ToolParameterValidator()
    schema = {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "top_k": {"type": "integer"},
        },
        "required": ["query"],
    }

    is_valid, errors = validator.validate(schema, {"query": "test query", "top_k": 5})
    assert is_valid is True
    assert len(errors) == 0


def test_tool_parameter_validator_missing_required():
    validator = ToolParameterValidator()
    schema = {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
        },
        "required": ["query"],
    }

    is_valid, errors = validator.validate(schema, {})
    assert is_valid is False
    assert any("Missing required" in e for e in errors)


def test_tool_parameter_validator_injected_parameters():
    validator = ToolParameterValidator()
    schema = {
        "type": "object",
        "properties": {
            "expression": {"type": "string"},
        },
        "required": ["expression"],
    }

    # Malicious injection attempt adding unexpected keys
    is_valid, errors = validator.validate(
        schema, {"expression": "2+2", "drop_table": "users;--"}
    )
    assert is_valid is False
    assert any("Unexpected parameter" in e for e in errors)


def test_tool_parameter_validator_type_mismatch():
    validator = ToolParameterValidator()
    schema = {
        "type": "object",
        "properties": {
            "limit": {"type": "integer"},
        },
    }

    is_valid, errors = validator.validate(schema, {"limit": "not-an-int"})
    assert is_valid is False
    assert any("expected type integer" in e for e in errors)

