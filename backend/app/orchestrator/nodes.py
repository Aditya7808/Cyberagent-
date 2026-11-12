import logging
import time
from typing import Any, Dict, List

from app.llm.base import LLMMessage, get_llm_provider
from app.orchestrator.state import AgentMessage, AgentState, SecurityCheckResult, ToolCallRequest, ToolCallResult
from app.security.input_inspector import InputSecurityInspector
from app.security.output_inspector import OutputSecurityInspector
from app.tools.executor import ToolExecutor
from app.tools.registry import create_default_registry

logger = logging.getLogger("sentinel.orchestrator.nodes")

input_inspector = InputSecurityInspector()
output_inspector = OutputSecurityInspector()
default_registry = create_default_registry()
tool_executor = ToolExecutor(default_registry)


async def input_security_node(state: AgentState) -> Dict[str, Any]:
    """
    Step 1: Inspect user prompt for injection, jailbreak patterns, and basic safety.
    If flagged, sets is_blocked = True.
    """
    current_input = state.get("current_input", "")
    logger.info(f"Running Input Security check on: {current_input[:50]}...")

    is_safe, violations, meta = input_inspector.inspect(current_input)

    security_res: SecurityCheckResult = {
        "is_safe": is_safe,
        "violations": violations,
        "risk_score": meta.get("risk_score", 0.0),
    }

    if not is_safe:
        violation_msg = "; ".join(violations)
        logger.warning(f"Input blocked by security policy: {violation_msg}")
        return {
            "input_security": security_res,
            "is_blocked": True,
            "block_reason": f"Input inspection blocked request: {violation_msg}",
            "final_response": (
                "🛡️ [Sentinel Security Alert]: Your prompt was flagged by runtime input inspection "
                f"for potential adversarial behavior. Violation: {violation_msg}"
            ),
        }

    return {
        "input_security": security_res,
        "is_blocked": False,
    }


async def llm_call_node(state: AgentState) -> Dict[str, Any]:
    """
    Step 2: Invoke the configured LLM (Bedrock or Mock fallback)
    with conversation history and permitted tools schema.
    """
    if state.get("is_blocked"):
        return {}

    model_id = state.get("model_id", "mock-default")
    system_prompt = state.get("system_prompt", "You are a helpful and secure enterprise assistant.")
    allowed_tools = state.get("allowed_tools", [])
    iteration = state.get("iteration_count", 0) + 1

    llm = get_llm_provider(model_id)

    # Convert state messages to LLMMessage
    llm_messages: List[LLMMessage] = []
    for m in state.get("messages", []):
        llm_messages.append(
            LLMMessage(
                role=m.get("role", "user"),
                content=m.get("content", ""),
                tool_call_id=m.get("tool_call_id"),
            )
        )

    # If there are tool results from previous turn, append them as tool messages
    for tr in state.get("tool_results", []):
        output = tr.get("output") or tr.get("error") or ""
        llm_messages.append(
            LLMMessage(
                role="tool",
                content=output,
                tool_call_id=tr.get("id"),
            )
        )

    tool_schemas = default_registry.get_schemas(allowed_tools) if allowed_tools else None

    logger.info(f"Invoking LLM ({model_id}) on iteration {iteration}...")
    llm_resp = await llm.invoke(
        messages=llm_messages,
        system_prompt=system_prompt,
        tools=tool_schemas,
    )

    pending_tool_calls: List[ToolCallRequest] = [
        {"id": tc.get("id", ""), "name": tc.get("name", ""), "arguments": tc.get("arguments", {})}
        for tc in llm_resp.tool_calls
    ]

    return {
        "iteration_count": iteration,
        "pending_tool_calls": pending_tool_calls,
        "final_response": llm_resp.content,
        "total_input_tokens": state.get("total_input_tokens", 0) + llm_resp.input_tokens,
        "total_output_tokens": state.get("total_output_tokens", 0) + llm_resp.output_tokens,
        "total_latency_ms": state.get("total_latency_ms", 0.0) + llm_resp.latency_ms,
    }


async def tool_execution_node(state: AgentState) -> Dict[str, Any]:
    """
    Step 3: Execute any pending tool calls through ToolExecutor with security checks.
    """
    pending = state.get("pending_tool_calls", [])
    if not pending:
        return {"tool_results": []}

    results: List[ToolCallResult] = []
    requires_approval = False
    approval_tool = ""

    from app.models.user import User, UserRole
    import uuid

    mock_user = User(
        id=uuid.UUID(state.get("user_id", "00000000-0000-0000-0000-000000000001")),
        org_id=uuid.UUID(state.get("org_id", "00000000-0000-0000-0000-000000000001")),
        email="operator@sentinel.internal",
        full_name="Agent Operator",
        role=UserRole.OPERATOR,
        hashed_password="mock",
    )

    context = {
        "org_id": state.get("org_id", "acme-corp"),
        "user_id": state.get("user_id", "default-user"),
    }

    for tc in pending:
        tool_name = tc.get("name", "")
        args = tc.get("arguments", {})
        res = await tool_executor.execute(
            tool_name=tool_name,
            arguments=args,
            user=mock_user,
            context=context,
        )

        tr_res: ToolCallResult = {
            "id": tc.get("id", ""),
            "name": tool_name,
            "success": res.success,
            "output": res.output,
            "error": res.error,
            "authorized": res.success or "APPROVAL" in (res.error or ""),
            "requires_approval": res.metadata.get("requires_human_approval", False),
            "metadata": res.metadata,
        }
        results.append(tr_res)

        if tr_res["requires_approval"]:
            requires_approval = True
            approval_tool = tool_name

    return {
        "tool_results": results,
        "pending_tool_calls": [],
        "requires_human_approval": requires_approval,
        "approval_tool_name": approval_tool,
    }


async def output_security_node(state: AgentState) -> Dict[str, Any]:
    """
    Step 4: Inspect LLM output for PII leakage and format final response.
    """
    raw_response = state.get("final_response", "")
    if not raw_response:
        return {}

    sanitized, is_compliant, violations, meta = output_inspector.inspect_and_sanitize(
        raw_response, redact_pii=True
    )

    out_sec: SecurityCheckResult = {
        "is_safe": is_compliant,
        "violations": violations,
        "pii_detected": meta.get("pii_entities", []),
        "was_redacted": meta.get("was_redacted", False),
    }

    return {
        "final_response": sanitized,
        "output_security": out_sec,
    }
