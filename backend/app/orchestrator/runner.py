import logging
import time
from typing import Any, Dict, List, Optional

from app.orchestrator.graph import build_agent_graph
from app.orchestrator.state import AgentMessage, AgentState

logger = logging.getLogger("sentinel.orchestrator.runner")

# Compile once
_agent_graph = build_agent_graph()


async def run_agent(
    agent_id: str,
    prompt: str,
    org_id: str = "acme-corp",
    user_id: str = "default-user",
    model_id: str = "mock-default",
    system_prompt: str = "You are a helpful and secure enterprise assistant.",
    allowed_tools: Optional[List[str]] = None,
    history: Optional[List[AgentMessage]] = None,
    max_iterations: int = 5,
) -> Dict[str, Any]:
    """
    Executes the full LangGraph Agent Security Lifecycle for a user turn.
    
    Returns structured result including final answer, tool execution trace,
    security inspection outcomes, token metrics, and latency.
    """
    start_time = time.time()
    messages: List[AgentMessage] = list(history or [])
    messages.append({"role": "user", "content": prompt})

    initial_state: AgentState = {
        "agent_id": agent_id,
        "org_id": org_id,
        "user_id": user_id,
        "model_id": model_id,
        "system_prompt": system_prompt,
        "allowed_tools": allowed_tools or ["search_documents", "calculator"],
        "messages": messages,
        "current_input": prompt,
        "iteration_count": 0,
        "max_iterations": max_iterations,
        "pending_tool_calls": [],
        "tool_results": [],
        "total_input_tokens": 0,
        "total_output_tokens": 0,
        "total_latency_ms": 0.0,
        "is_blocked": False,
        "requires_human_approval": False,
    }

    logger.info(f"Starting agent run for agent={agent_id}, input='{prompt[:40]}...'")
    final_state = await _agent_graph.ainvoke(initial_state)

    elapsed_ms = (time.time() - start_time) * 1000

    response_content = final_state.get("final_response", "")
    if final_state.get("requires_human_approval"):
        tool_name = final_state.get("approval_tool_name", "tool")
        response_content = (
            f"⏸️ [Sentinel Human-in-the-Loop Required]: The agent requested to execute restricted tool '{tool_name}'. "
            "Execution is suspended pending administrator authorization."
        )

    return {
        "content": response_content,
        "is_blocked": final_state.get("is_blocked", False),
        "block_reason": final_state.get("block_reason"),
        "requires_human_approval": final_state.get("requires_human_approval", False),
        "approval_tool_name": final_state.get("approval_tool_name"),
        "input_security": final_state.get("input_security", {}),
        "output_security": final_state.get("output_security", {}),
        "tool_results": final_state.get("tool_results", []),
        "iterations": final_state.get("iteration_count", 1),
        "tokens": {
            "input": final_state.get("total_input_tokens", 0),
            "output": final_state.get("total_output_tokens", 0),
        },
        "latency_ms": round(elapsed_ms, 2),
    }

