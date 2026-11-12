import uuid
from typing import Any, Dict, Optional, Tuple
from app.models.tool import AgentTool, ToolAuthLevel
from app.models.user import User, UserRole


class ToolAuthorizer:
    """
    Enforces server-side tool execution authorization:
    - Deny by default
    - Role and tenant boundaries
    - Human-in-the-loop approval triggers
    """

    def authorize_execution(
        self,
        tool: AgentTool,
        user: User,
        parameters: Dict[str, Any],
    ) -> Tuple[bool, bool, Optional[str]]:
        """
        Returns:
            (is_authorized, requires_human_approval, rejection_reason)
        """
        if not tool.enabled:
            return False, False, f"Tool '{tool.tool_name}' is disabled."

        # High-impact tools require explicit human approval
        if tool.auth_level == ToolAuthLevel.APPROVAL_REQUIRED:
            return False, True, f"Tool '{tool.tool_name}' requires human-in-the-loop approval before running."

        # Restricted tools require at least OPERATOR or ADMIN role
        if tool.auth_level == ToolAuthLevel.RESTRICTED:
            if user.role not in [UserRole.ADMIN, UserRole.OPERATOR]:
                return False, False, f"User role '{user.role}' lacks permission for restricted tool '{tool.tool_name}'."

        return True, False, None

