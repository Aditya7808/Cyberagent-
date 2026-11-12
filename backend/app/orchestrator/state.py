from typing import Any, Dict, List, Optional, TypedDict


class SecurityCheckResult(TypedDict, total=False):
    is_safe: bool
    violations: List[str]
    risk_score: float
    pii_detected: List[Dict[str, Any]]
    was_redacted: bool


class ToolCallRequest(TypedDict, total=False):
    id: str
    name: str
    arguments: Dict[str, Any]


class ToolCallResult(TypedDict, total=False):
    id: str
    name: str
    success: bool
    output: str
    error: Optional[str]
    authorized: bool
    requires_approval: bool
    metadata: Dict[str, Any]


class AgentMessage(TypedDict, total=False):
    role: str  # user | assistant | system | tool
    content: str
    tool_call_id: Optional[str]
    tool_calls: Optional[List[ToolCallRequest]]
    security: Optional[SecurityCheckResult]
    tokens: Optional[int]
    latency_ms: Optional[float]


class AgentState(TypedDict, total=False):
    """
    The complete state object flowing through the LangGraph agent workflow.
    Each node reads from and writes to this state.
    """
    # Agent configuration
    agent_id: str
    org_id: str
    user_id: str
    model_id: str
    system_prompt: str
    allowed_tools: List[str]

    # Conversation messages (full history)
    messages: List[AgentMessage]

    # Current turn working data
    current_input: str
    input_security: SecurityCheckResult
    pending_tool_calls: List[ToolCallRequest]
    tool_results: List[ToolCallResult]
    output_security: SecurityCheckResult
    final_response: str

    # Control flow
    is_blocked: bool
    block_reason: str
    requires_human_approval: bool
    approval_tool_name: str
    iteration_count: int
    max_iterations: int

    # Metrics
    total_input_tokens: int
    total_output_tokens: int
    total_latency_ms: float

