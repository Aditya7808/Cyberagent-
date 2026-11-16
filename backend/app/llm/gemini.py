import json
import logging
import time
import uuid
from typing import Any, AsyncIterator, Dict, List, Optional
import httpx

from app.config import get_settings
from app.llm.base import BaseLLM, LLMMessage, LLMResponse

logger = logging.getLogger("sentinel.llm.gemini")


class GeminiLLM(BaseLLM):
    """
    Google Gemini LLM provider supporting Gemini 1.5 Pro and Gemini 1.5/2.0 Flash.
    Uses Google AI Studio REST API asynchronously via httpx.
    Falls back gracefully to MockLLM if no credentials or network error.
    """

    def __init__(self, model_id: str = "gemini-1.5-pro", api_key: str = "", **kwargs: Any):
        super().__init__(model_id, **kwargs)
        settings = get_settings()
        self.api_key = api_key or getattr(settings, "GEMINI_API_KEY", "")
        # Normalize model identifier (e.g., gemini-pro -> gemini-1.5-pro)
        if self.model_id == "gemini-pro":
            self.model_id = "gemini-1.5-pro"
        logger.info(f"GeminiLLM initialized: {self.model_id} (API key present: {bool(self.api_key)})")

    def _format_contents(self, messages: List[LLMMessage]) -> List[Dict[str, Any]]:
        """Format internal messages into Gemini contents array."""
        contents = []
        for msg in messages:
            if msg.role == "system":
                continue  # system instruction is passed separately
            role = "user" if msg.role == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg.content}]
            })
        return contents

    def _format_tools(self, tools: Optional[List[Dict[str, Any]]]) -> Optional[List[Dict[str, Any]]]:
        """Convert standard JSON tool schemas to Gemini function declarations."""
        if not tools:
            return None

        declarations = []
        for tool in tools:
            dec: Dict[str, Any] = {
                "name": tool.get("name", "unnamed_tool"),
                "description": tool.get("description", ""),
            }
            if "parameters" in tool:
                dec["parameters"] = tool["parameters"]
            declarations.append(dec)

        return [{"function_declarations": declarations}]

    async def invoke(
        self,
        messages: List[LLMMessage],
        system_prompt: str = "",
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> LLMResponse:
        start_time = time.time()

        if not self.api_key:
            logger.warning("No GEMINI_API_KEY configured in environment. Falling back to MockLLM.")
            from app.llm.mock import MockLLM
            return await MockLLM(model_id=self.model_id).invoke(
                messages=messages,
                system_prompt=system_prompt,
                tools=tools,
                temperature=temperature,
                max_tokens=max_tokens,
            )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_id}:generateContent?key={self.api_key}"

        payload: Dict[str, Any] = {
            "contents": self._format_contents(messages),
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            }
        }

        if system_prompt:
            payload["system_instruction"] = {
                "parts": [{"text": system_prompt}]
            }

        gemini_tools = self._format_tools(tools)
        if gemini_tools:
            payload["tools"] = gemini_tools

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code != 200:
                    err_msg = res.text
                    logger.warning(f"Gemini API returned status {res.status_code}: {err_msg[:200]}. Falling back to MockLLM.")
                    from app.llm.mock import MockLLM
                    return await MockLLM(model_id=self.model_id).invoke(
                        messages=messages,
                        system_prompt=system_prompt,
                        tools=tools,
                        temperature=temperature,
                        max_tokens=max_tokens,
                    )

                data = res.json()
        except Exception as e:
            logger.warning(f"Error calling Gemini API ({e}). Falling back to MockLLM.")
            from app.llm.mock import MockLLM
            return await MockLLM(model_id=self.model_id).invoke(
                messages=messages,
                system_prompt=system_prompt,
                tools=tools,
                temperature=temperature,
                max_tokens=max_tokens,
            )

        latency_ms = (time.time() - start_time) * 1000

        # Parse Gemini response
        response_text = ""
        tool_calls = []

        candidates = data.get("candidates", [])
        if candidates:
            first_cand = candidates[0]
            parts = first_cand.get("content", {}).get("parts", [])
            for p in parts:
                if "text" in p:
                    response_text += p["text"]
                elif "functionCall" in p:
                    fn = p["functionCall"]
                    tool_calls.append({
                        "id": f"call-{uuid.uuid4().hex[:8]}",
                        "name": fn.get("name", ""),
                        "arguments": fn.get("args", {}),
                    })

        usage = data.get("usageMetadata", {})
        input_tokens = usage.get("promptTokenCount", 0)
        output_tokens = usage.get("candidatesTokenCount", 0)

        return LLMResponse(
            content=response_text,
            model_id=self.model_id,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
            tool_calls=tool_calls,
            finish_reason="tool_use" if tool_calls else "stop",
            raw_response=data,
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
            messages=messages,
            system_prompt=system_prompt,
            tools=tools,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        for word in response.content.split(" "):
            yield word + " "
