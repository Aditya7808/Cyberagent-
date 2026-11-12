import logging
from typing import Any, Dict, List, Optional

from app.tools.base import BaseTool

logger = logging.getLogger("sentinel.tools.registry")


class ToolRegistry:
    """
    Central registry for all available agent tools.
    Supports registering, looking up, and listing tools
    filtered by auth level or agent-specific allowlists.
    """

    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        """Register a tool in the global registry."""
        if tool.name in self._tools:
            logger.warning(f"Tool '{tool.name}' already registered, overwriting.")
        self._tools[tool.name] = tool
        logger.info(f"Registered tool: {tool.name} (auth_level={tool.auth_level})")

    def get(self, name: str) -> Optional[BaseTool]:
        """Look up a tool by name."""
        return self._tools.get(name)

    def list_all(self) -> List[BaseTool]:
        """List all registered tools."""
        return list(self._tools.values())

    def list_for_agent(self, allowed_tool_names: List[str]) -> List[BaseTool]:
        """List tools filtered by an agent's tool allowlist."""
        return [
            tool for name, tool in self._tools.items()
            if name in allowed_tool_names
        ]

    def get_schemas(self, tool_names: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Get tool schemas in LLM-compatible format, optionally filtered."""
        if tool_names:
            return [
                self._tools[name].get_schema()
                for name in tool_names
                if name in self._tools
            ]
        return [tool.get_schema() for tool in self._tools.values()]

    def unregister(self, name: str) -> bool:
        """Remove a tool from the registry."""
        if name in self._tools:
            del self._tools[name]
            return True
        return False


def create_default_registry() -> ToolRegistry:
    """Create a registry pre-loaded with all built-in tools."""
    from app.tools.builtin.search_documents import SearchDocumentsTool
    from app.tools.builtin.get_policy import GetPolicyTool
    from app.tools.builtin.calculator import CalculatorTool

    registry = ToolRegistry()
    registry.register(SearchDocumentsTool())
    registry.register(GetPolicyTool())
    registry.register(CalculatorTool())

    logger.info(f"Default tool registry created with {len(registry.list_all())} tools.")
    return registry

