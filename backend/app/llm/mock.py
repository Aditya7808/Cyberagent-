import asyncio
import json
import logging
import random
import time
from typing import Any, AsyncIterator, Dict, List, Optional

from app.llm.base import BaseLLM, LLMMessage, LLMResponse

logger = logging.getLogger("sentinel.llm.mock")

# Canned enterprise-style responses for realistic Playground testing
MOCK_RESPONSES = {
    "default": (
        "Based on the organization's internal documentation, here is what I found:\n\n"
        "According to the company policy, the standard procedure involves reviewing "
        "the relevant guidelines and consulting with the appropriate department head. "
        "I've ensured that my response complies with the tenant's access control policies "
        "and does not expose any restricted information.\n\n"
        "Would you like me to look up any specific section or policy detail?"
    ),
    "leave_policy": (
        "According to Acme Corporation's HR Policy (Document Classification: CONFIDENTIAL):\n\n"
        "• Full-time employees accrue **20 days** of paid annual leave per calendar year.\n"
        "• Up to 5 unused PTO days can be rolled over into Q1 of the following year.\n"
        "• Medical certificates are mandatory for absences exceeding 3 consecutive days.\n"
        "• Primary caregivers receive 16 weeks of fully paid parental leave.\n\n"
        "Contact: HR Operations Lead <PII_REDACTED> for further details.\n\n"
        "ℹ️ Note: Employee SSN and salary details were automatically redacted by SentinelAI's output security layer."
    ),
    "financial": (
        "Based on Acme Corporation's Q3 2026 Executive Financial Summary:\n\n"
        "• Consolidated Revenue: $48.2 Million (18.4% YoY growth)\n"
        "• Gross Margin: 74.2%\n"
        "• Operating Income: $12.8M\n"
        "• R&D Expenditure: $14.6M\n\n"
        "⚠️ Bank account details and signatory SSNs have been masked per output security policy.\n"
        "CFO contact: <PII_REDACTED>"
    ),
    "tool_call": None,  # Will trigger tool call response
}

MOCK_TOOL_CALL_RESPONSE = {
    "content": "",
    "tool_calls": [
        {
            "id": "mock-tool-call-001",
            "name": "search_documents",
            "arguments": {
                "query": "company leave policy",
                "tenant_id": "acme-corp",
                "top_k": 3,
            },
        }
    ],
}


class MockLLM(BaseLLM):
    """
    Mock LLM provider for local development and testing.
    Returns realistic enterprise-style responses without requiring AWS credentials.
    Simulates tool calls, PII in responses, and variable latency.
    """

    def __init__(self, model_id: str = "mock-default", **kwargs: Any):
        super().__init__(model_id, **kwargs)
        logger.info(f"MockLLM initialized: {model_id} (no cloud credentials needed)")

    def _pick_response(self, messages: List[LLMMessage]) -> Dict[str, Any]:
        """Select an appropriate mock response based on the last user message."""
        last_user_msg = ""
        for msg in reversed(messages):
            if msg.role == "user":
                last_user_msg = msg.content.lower()
                break

        # Match keywords to response templates
        if any(kw in last_user_msg for kw in ["leave", "pto", "vacation", "hr", "holiday"]):
            return {"content": MOCK_RESPONSES["leave_policy"], "tool_calls": []}
        elif any(kw in last_user_msg for kw in ["revenue", "financial", "budget", "earnings", "salary"]):
            return {"content": MOCK_RESPONSES["financial"], "tool_calls": []}
        elif any(kw in last_user_msg for kw in ["search", "find", "look up", "retrieve", "document"]):
            return MOCK_TOOL_CALL_RESPONSE
        else:
            return {"content": MOCK_RESPONSES["default"], "tool_calls": []}

    async def invoke(
        self,
        messages: List[LLMMessage],
        system_prompt: str = "",
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> LLMResponse:
        start_time = time.time()

        # Simulate realistic API latency (200ms–800ms)
        await asyncio.sleep(random.uniform(0.2, 0.8))

        picked = self._pick_response(messages)
        content = picked.get("content", "")
        tool_calls = picked.get("tool_calls", [])

        latency_ms = (time.time() - start_time) * 1000

        # Simulate token counts
        all_text = system_prompt + " ".join(m.content for m in messages)
        input_tokens = len(all_text.split()) * 2  # rough approximation
        output_tokens = len(content.split()) * 2 if content else 20

        return LLMResponse(
            content=content,
            model_id=self.model_id,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
            tool_calls=tool_calls,
            finish_reason="tool_use" if tool_calls else "stop",
            raw_response={"mock": True, "picked_template": "matched"},
        )

    async def stream(
        self,
        messages: List[LLMMessage],
        system_prompt: str = "",
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        response = await self.invoke(
            messages, system_prompt, tools, temperature, max_tokens
        )
        # Simulate streaming by yielding word by word with small delays
        words = response.content.split(" ")
        for word in words:
            await asyncio.sleep(random.uniform(0.01, 0.05))
            yield word + " "

