import logging
from typing import Literal

from langgraph.graph import END, StateGraph

from app.orchestrator.nodes import (
    input_security_node,
    llm_call_node,
    output_security_node,
    tool_execution_node,
)
from app.orchestrator.state import AgentState

logger = logging.getLogger("sentinel.orchestrator.graph")


def route_after_input_security(state: AgentState) -> Literal["llm_call", "__end__"]:
    """If input is blocked by security filter, stop immediately."""
    if state.get("is_blocked"):
        logger.info("Routing to END due to input security block.")
        return END
    return "llm_call"


def route_after_llm_call(state: AgentState) -> Literal["tool_execution", "output_security"]:
    """If model requested tool calls and iterations are within budget, route to tool execution."""
    pending = state.get("pending_tool_calls", [])
    iteration = state.get("iteration_count", 0)
    max_iter = state.get("max_iterations", 5)

    if pending and iteration < max_iter:
        logger.info(f"Model requested {len(pending)} tool calls. Routing to tool_execution.")
        return "tool_execution"

    return "output_security"


def route_after_tool_execution(state: AgentState) -> Literal["llm_call", "output_security"]:
    """If tool requires human approval, stop flow to prompt user. Otherwise feed back into LLM."""
    if state.get("requires_human_approval"):
        logger.info("Tool requires human-in-the-loop approval. Halting for user sign-off.")
        return "output_security"

    logger.info("Tools executed. Feeding tool results back into LLM.")
    return "llm_call"


def build_agent_graph() -> StateGraph:
    """
    Constructs and compiles the full SentinelAI Agent Security Lifecycle workflow.
    """
    builder = StateGraph(AgentState)

    # 1. Register nodes
    builder.add_node("input_security", input_security_node)
    builder.add_node("llm_call", llm_call_node)
    builder.add_node("tool_execution", tool_execution_node)
    builder.add_node("output_security", output_security_node)

    # 2. Set entry point
    builder.set_entry_point("input_security")

    # 3. Add edges and conditional transitions
    builder.add_conditional_edges(
        "input_security",
        route_after_input_security,
        {
            "llm_call": "llm_call",
            END: END,
        },
    )

    builder.add_conditional_edges(
        "llm_call",
        route_after_llm_call,
        {
            "tool_execution": "tool_execution",
            "output_security": "output_security",
        },
    )

    builder.add_conditional_edges(
        "tool_execution",
        route_after_tool_execution,
        {
            "llm_call": "llm_call",
            "output_security": "output_security",
        },
    )

    builder.add_edge("output_security", END)

    compiled_graph = builder.compile()
    logger.info("Agent StateGraph compiled successfully.")
    return compiled_graph
