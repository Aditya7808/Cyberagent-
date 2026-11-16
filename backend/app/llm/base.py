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
    Supports Google Gemini (Gemini Pro/Flash), Amazon Bedrock, or falls back to MockLLM.
    """
    from app.config import get_settings
    from app.llm.mock import MockLLM
    from app.llm.bedrock import BedrockLLM
    from app.llm.gemini import GeminiLLM

    settings = get_settings()

    # 1. Check for explicit mock request
    if model_id and model_id.startswith("mock"):
        return MockLLM(model_id=model_id, **kwargs)

    # 2. Check for Google Gemini configuration or model specification
    gemini_key = getattr(settings, "GEMINI_API_KEY", "")
    if gemini_key or (model_id and "gemini" in model_id.lower()):
        effective_model = model_id if (model_id and "gemini" in model_id.lower()) else getattr(settings, "GEMINI_MODEL_ID", "gemini-1.5-pro")
        return GeminiLLM(model_id=effective_model, api_key=gemini_key, **kwargs)

    # 3. Check for AWS Bedrock configuration
    if getattr(settings, "AWS_ACCESS_KEY_ID", "") or (model_id and ("claude" in model_id.lower() or "bedrock" in model_id.lower())):
        try:
            return BedrockLLM(model_id=model_id or settings.AWS_BEDROCK_MODEL_ID, **kwargs)
        except Exception:
            return MockLLM(model_id=f"mock-fallback-{model_id}", **kwargs)

    # 4. Default zero-config fallback to MockLLM
    return MockLLM(model_id=model_id or "mock-default", **kwargs)

