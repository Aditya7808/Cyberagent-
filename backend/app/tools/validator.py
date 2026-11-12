import logging
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("sentinel.tools.validator")


class ToolParameterValidator:
    """
    Validates tool execution parameters against declared JSON schemas.
    Enforces type safety, required parameters, and bounded values
    to prevent tool parameter injection attacks.
    """

    TYPE_MAP = {
        "string": str,
        "integer": int,
        "number": (int, float),
        "boolean": bool,
        "array": list,
        "object": dict,
    }

    def validate(
        self,
        schema: Dict[str, Any],
        parameters: Dict[str, Any],
    ) -> Tuple[bool, List[str]]:
        """
        Validates parameters dictionary against JSON schema.
        
        Returns:
            (is_valid, validation_errors)
        """
        errors: List[str] = []
        if not schema:
            return True, []

        properties = schema.get("properties", {})
        required_fields = schema.get("required", [])

        # Check required fields
        for field in required_fields:
            if field not in parameters:
                errors.append(f"Missing required parameter: '{field}'")

        # Check types and properties
        for key, val in parameters.items():
            if key not in properties:
                # Disallow unexpected injected parameters
                errors.append(f"Unexpected parameter '{key}' not in tool schema")
                continue

            prop_def = properties[key]
            expected_type = prop_def.get("type")

            if expected_type in self.TYPE_MAP:
                python_type = self.TYPE_MAP[expected_type]
                if not isinstance(val, python_type):
                    errors.append(
                        f"Parameter '{key}' expected type {expected_type}, got {type(val).__name__}"
                    )

            # Check enum constraints if present
            if "enum" in prop_def and val not in prop_def["enum"]:
                errors.append(
                    f"Parameter '{key}' value '{val}' not in permitted enum options: {prop_def['enum']}"
                )

        is_valid = len(errors) == 0
        return is_valid, errors

