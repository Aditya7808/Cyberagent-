from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Dict, List, Optional


@dataclass
class LLMMessage:
    role: str  # "system" | "user" | "assistant" | "tool"
    content: str
    tool_call_id: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None


@dataclass
class LLMResponse:
    content: str
    model_id: str
    input_tokens: int = 0
    output_tokens: int = 0
    latency_ms: float = 0.0
    tool_calls: List[Dict[str, Any]] = field(default_factory=list)
    finish_reason: str = "stop"
    raw_response: Optional[Dict[str, Any]] = None


class BaseLLM(ABC):
    """Abstract base class for all LLM providers."""

    def __init__(self, model_id: str, **kwargs: Any):
        self.model_id = model_id
        self.config = kwargs

    @abstractmethod
    async def invoke(
        self,
        messages: List[LLMMessage],
        system_prompt: str = "",
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> LLMResponse:
        """Send messages to the LLM and get a response."""
        ...

    @abstractmethod
    async def stream(
        self,
        messages: List[LLMMessage],
        system_prompt: str = "",
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        """Stream response tokens from the LLM."""
        ...


def get_llm_provider(model_id: str = "", **kwargs: Any) -> BaseLLM:
    """
    Factory function to instantiate the correct LLM provider.
    Falls back to MockLLM when no AWS credentials or model_id starts with 'mock'.
    """
    from app.llm.mock import MockLLM
    from app.llm.bedrock import BedrockLLM

    if not model_id or model_id.startswith("mock"):
        return MockLLM(model_id=model_id or "mock-default", **kwargs)

    try:
        return BedrockLLM(model_id=model_id, **kwargs)
    except Exception:
        # If Bedrock init fails (no creds), fall back to mock
        return MockLLM(model_id=f"mock-fallback-{model_id}", **kwargs)

