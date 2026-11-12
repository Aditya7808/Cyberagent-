import logging
import ast
import operator
from typing import Any, Dict

from app.tools.base import BaseTool, ToolResult

logger = logging.getLogger("sentinel.tools.calculator")

# Supported safe operations
SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
}


def _safe_eval(node: ast.AST) -> float:
    """Safely evaluate a mathematical AST node."""
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return float(node.value)
    elif isinstance(node, ast.BinOp) and type(node.op) in SAFE_OPERATORS:
        left = _safe_eval(node.left)
        right = _safe_eval(node.right)
        return SAFE_OPERATORS[type(node.op)](left, right)
    elif isinstance(node, ast.UnaryOp) and type(node.op) in SAFE_OPERATORS:
        return SAFE_OPERATORS[type(node.op)](_safe_eval(node.operand))
    else:
        raise ValueError(f"Unsupported operation: {ast.dump(node)}")


class CalculatorTool(BaseTool):
    """
    Safe mathematical expression evaluator.
    Supports basic arithmetic: +, -, *, /, %, **.
    No arbitrary code execution — uses AST-safe parsing only.
    """

    name = "calculator"
    description = (
        "Evaluate a mathematical expression safely. "
        "Supports addition, subtraction, multiplication, division, modulo, and exponentiation. "
        "Example: '(48.2 * 0.742) - 12.8'"
    )
    parameters_schema = {
        "type": "object",
        "properties": {
            "expression": {
                "type": "string",
                "description": "The mathematical expression to evaluate.",
            },
        },
        "required": ["expression"],
    }
    auth_level = "open"

    async def execute(self, arguments: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        expression = arguments.get("expression", "")
        if not expression:
            return ToolResult(success=False, output="", error="No expression provided.")

        logger.info(f"Calculating: {expression}")

        try:
            tree = ast.parse(expression, mode="eval")
            result = _safe_eval(tree.body)

            # Format nicely
            if result == int(result):
                formatted = str(int(result))
            else:
                formatted = f"{result:.6f}".rstrip("0").rstrip(".")

            return ToolResult(
                success=True,
                output=f"{expression} = {formatted}",
                metadata={"expression": expression, "result": result},
            )
        except (ValueError, SyntaxError, TypeError, ZeroDivisionError) as e:
            return ToolResult(
                success=False,
                output="",
                error=f"Calculation error: {str(e)}",
                metadata={"expression": expression},
            )

