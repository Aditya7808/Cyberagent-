import json
import logging
import time
from typing import Any, AsyncIterator, Dict, List, Optional

from app.llm.base import BaseLLM, LLMMessage, LLMResponse

logger = logging.getLogger("sentinel.llm.bedrock")


class BedrockLLM(BaseLLM):
    """
    Amazon Bedrock LLM provider using the Converse API.
    Requires valid AWS credentials and region configuration.
    """

    def __init__(self, model_id: str, **kwargs: Any):
        super().__init__(model_id, **kwargs)
        import boto3
        from app.config import get_settings

        settings = get_settings()
        self.client = boto3.client(
            "bedrock-runtime",
            region_name=kwargs.get("region", settings.AWS_REGION),
        )
        logger.info(f"BedrockLLM initialized with model: {model_id}")

    def _format_messages(
        self, messages: List[LLMMessage]
    ) -> List[Dict[str, Any]]:
        """Convert internal message format to Bedrock Converse API format."""
        formatted = []
        for msg in messages:
            if msg.role == "system":
                continue  # system prompt handled separately
            entry: Dict[str, Any] = {
                "role": msg.role,
                "content": [{"text": msg.content}],
            }
            formatted.append(entry)
        return formatted

    def _format_tools(
        self, tools: Optional[List[Dict[str, Any]]]
    ) -> Optional[Dict[str, Any]]:
        """Format tools into Bedrock toolConfig."""
        if not tools:
            return None
        tool_specs = []
        for tool in tools:
            tool_specs.append(
                {
                    "toolSpec": {
                        "name": tool["name"],
                        "description": tool.get("description", ""),
                        "inputSchema": {
                            "json": tool.get("parameters", {})
                        },
                    }
                }
            )
        return {"tools": tool_specs}

    async def invoke(
        self,
        messages: List[LLMMessage],
        system_prompt: str = "",
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> LLMResponse:
        start_time = time.time()

        request_params: Dict[str, Any] = {
            "modelId": self.model_id,
            "messages": self._format_messages(messages),
            "inferenceConfig": {
                "temperature": temperature,
                "maxTokens": max_tokens,
            },
        }

        if system_prompt:
            request_params["system"] = [{"text": system_prompt}]

        tool_config = self._format_tools(tools)
        if tool_config:
            request_params["toolConfig"] = tool_config

        try:
            response = self.client.converse(**request_params)
        except Exception as e:
            logger.error(f"Bedrock API call failed: {e}")
            raise

        latency_ms = (time.time() - start_time) * 1000

        # Parse response
        output = response.get("output", {})
        message = output.get("message", {})
        content_blocks = message.get("content", [])

        response_text = ""
        tool_calls = []

        for block in content_blocks:
            if "text" in block:
                response_text += block["text"]
            elif "toolUse" in block:
                tool_use = block["toolUse"]
                tool_calls.append(
                    {
                        "id": tool_use.get("toolUseId", ""),
                        "name": tool_use.get("name", ""),
                        "arguments": tool_use.get("input", {}),
                    }
                )

        usage = response.get("usage", {})
        stop_reason = response.get("stopReason", "end_turn")

        return LLMResponse(
            content=response_text,
            model_id=self.model_id,
            input_tokens=usage.get("inputTokens", 0),
            output_tokens=usage.get("outputTokens", 0),
            latency_ms=latency_ms,
            tool_calls=tool_calls,
            finish_reason=stop_reason,
            raw_response=response,
        )

    async def stream(
        self,
        messages: List[LLMMessage],
        system_prompt: str = "",
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        """Stream is not yet implemented — falls back to invoke."""
        response = await self.invoke(
            messages, system_prompt, tools, temperature, max_tokens
        )
        for word in response.content.split(" "):
            yield word + " "

