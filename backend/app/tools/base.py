from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class ToolResult:
    """Result returned after a tool execution."""
    success: bool
    output: str
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class BaseTool(ABC):
    """Abstract base class for all agent tools."""

    name: str = ""
    description: str = ""
    parameters_schema: Dict[str, Any] = {}
    auth_level: str = "open"  # open | restricted | approval_required

    @abstractmethod
    async def execute(self, arguments: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        """
        Execute the tool with given arguments and security context.
        
        Args:
            arguments: Tool-specific parameters from the LLM tool call.
            context: Security context including org_id, user_id, tenant info.
        
        Returns:
            ToolResult with success status, output, and metadata.
        """
        ...

    def get_schema(self) -> Dict[str, Any]:
        """Return the tool definition for the LLM tool calling format."""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters_schema,
        }

