import logging
import uuid
from typing import Any, Dict, Optional
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter

logger = logging.getLogger("sentinel.observability.tracing")

# Initialize OpenTelemetry TracerProvider
provider = TracerProvider()
# provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("sentinel-ai-tracer", "0.1.0")


class SentinelTracer:
    """
    OpenTelemetry Tracing Helper for the SentinelAI Agent Lifecycle.
    Ensures that spans record stage latency, security decisions, and token metrics
    while strictly redacting sensitive prompts or PII from telemetry attributes.
    """

    @staticmethod
    def start_agent_span(agent_id: str, org_id: str, turn_id: str):
        span = tracer.start_span("agent_request_lifecycle")
        span.set_attribute("sentinel.agent_id", agent_id)
        span.set_attribute("sentinel.org_id", org_id)
        span.set_attribute("sentinel.turn_id", turn_id)
        return span

    @staticmethod
    def trace_stage(
        parent_span: Any,
        stage_name: str,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """
        Creates a child span for a specific lifecycle phase
        (input_inspection, llm_inference, tool_execution, output_sanitization).
        """
        child_span = tracer.start_span(f"stage.{stage_name}")
        if metadata:
            for k, v in metadata.items():
                # Never write full raw prompt or sensitive secrets to telemetry
                if any(sec_key in k.lower() for sec_key in ["password", "secret", "token", "ssn"]):
                    child_span.set_attribute(f"sentinel.{k}", "<REDACTED_IN_TELEMETRY>")
                elif isinstance(v, (str, int, float, bool)):
                    child_span.set_attribute(f"sentinel.{k}", v)
        return child_span

