import asyncio
import logging
import time
import uuid
from typing import Any, Dict, Optional

from app.tools.base import BaseTool, ToolResult
from app.tools.registry import ToolRegistry
from app.security.tool_authorizer import ToolAuthorizer
from app.models.tool import AgentTool, ToolAuthLevel
from app.models.user import User

logger = logging.getLogger("sentinel.tools.executor")

TOOL_EXECUTION_TIMEOUT_SECONDS = 30


class ToolExecutor:
    """
    Secure tool execution engine.
    
    Responsibilities:
    - Look up the requested tool from registry
    - Validate tool authorization (RBAC, approval)
    - Execute with timeout protection
    - Return structured result with audit metadata
    """

    def __init__(self, registry: ToolRegistry):
        self.registry = registry
        self.authorizer = ToolAuthorizer()

    async def execute(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        user: User,
        agent_tool_record: Optional[AgentTool] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> ToolResult:
        """
        Execute a tool call with full security checks.
        
        Returns ToolResult with success/failure and audit metadata.
        """
        execution_id = str(uuid.uuid4())[:8]
        start_time = time.time()
        context = context or {}

        # 1. Look up tool implementation
        tool_impl = self.registry.get(tool_name)
        if not tool_impl:
            logger.warning(f"[{execution_id}] Tool '{tool_name}' not found in registry.")
            return ToolResult(
                success=False,
                output="",
                error=f"Tool '{tool_name}' is not registered in this platform.",
                metadata={"execution_id": execution_id, "phase": "lookup"},
            )

        # 2. Authorization check
        if agent_tool_record:
            is_authorized, requires_approval, reason = self.authorizer.authorize_execution(
                tool=agent_tool_record,
                user=user,
                parameters=arguments,
            )

            if not is_authorized:
                if requires_approval:
                    logger.info(
                        f"[{execution_id}] Tool '{tool_name}' requires human approval. Pausing."
                    )
                    return ToolResult(
                        success=False,
                        output="",
                        error=f"⏸️ APPROVAL REQUIRED: {reason}",
                        metadata={
                            "execution_id": execution_id,
                            "phase": "authorization",
                            "requires_human_approval": True,
                        },
                    )
                else:
                    logger.warning(
                        f"[{execution_id}] Tool '{tool_name}' denied: {reason}"
                    )
                    return ToolResult(
                        success=False,
                        output="",
                        error=f"🚫 ACCESS DENIED: {reason}",
                        metadata={
                            "execution_id": execution_id,
                            "phase": "authorization",
                            "requires_human_approval": False,
                        },
                    )

        # 3. Execute with timeout
        try:
            result = await asyncio.wait_for(
                tool_impl.execute(arguments, context),
                timeout=TOOL_EXECUTION_TIMEOUT_SECONDS,
            )
            elapsed_ms = (time.time() - start_time) * 1000
            result.metadata["execution_id"] = execution_id
            result.metadata["latency_ms"] = round(elapsed_ms, 2)
            logger.info(
                f"[{execution_id}] Tool '{tool_name}' executed successfully in {elapsed_ms:.0f}ms"
            )
            return result

        except asyncio.TimeoutError:
            elapsed_ms = (time.time() - start_time) * 1000
            logger.error(
                f"[{execution_id}] Tool '{tool_name}' timed out after {TOOL_EXECUTION_TIMEOUT_SECONDS}s"
            )
            return ToolResult(
                success=False,
                output="",
                error=f"Tool execution timed out after {TOOL_EXECUTION_TIMEOUT_SECONDS} seconds.",
                metadata={
                    "execution_id": execution_id,
                    "phase": "execution",
                    "latency_ms": round(elapsed_ms, 2),
                },
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            logger.exception(
                f"[{execution_id}] Tool '{tool_name}' raised an exception: {e}"
            )
            return ToolResult(
                success=False,
                output="",
                error=f"Tool execution error: {str(e)}",
                metadata={
                    "execution_id": execution_id,
                    "phase": "execution",
                    "latency_ms": round(elapsed_ms, 2),
                },
            )

