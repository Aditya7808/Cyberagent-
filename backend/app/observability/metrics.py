import logging
from typing import Dict
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider

logger = logging.getLogger("sentinel.observability.metrics")

metrics.set_meter_provider(MeterProvider())
meter = metrics.get_meter("sentinel-ai-metrics", "0.1.0")

# Telemetry Counters
agent_turns_counter = meter.create_counter(
    "sentinel_agent_turns_total",
    description="Total number of agent request turns orchestrated",
    unit="1",
)

security_blocks_counter = meter.create_counter(
    "sentinel_security_blocks_total",
    description="Total prompt injection or safety blocks intercepted",
    unit="1",
)

pii_redacted_counter = meter.create_counter(
    "sentinel_pii_entities_redacted_total",
    description="Total PII entities masked in agent outputs",
    unit="1",
)

tool_executions_counter = meter.create_counter(
    "sentinel_tool_executions_total",
    description="Total tool executions processed",
    unit="1",
)

tool_approvals_counter = meter.create_counter(
    "sentinel_tool_approvals_total",
    description="Total human-in-the-loop approvals requested",
    unit="1",
)

turn_latency_histogram = meter.create_histogram(
    "sentinel_turn_latency_ms",
    description="End-to-end agent turn execution latency",
    unit="ms",
)


class SentinelMetrics:
    """
    Helper for incrementing metrics and telemetry counters.
    """

    @staticmethod
    def record_turn(
        agent_id: str,
        org_id: str,
        latency_ms: float,
        is_blocked: bool = False,
        pii_count: int = 0,
        tools_count: int = 0,
        requires_approval: bool = False,
    ):
        attrs = {"agent_id": agent_id, "org_id": org_id}
        agent_turns_counter.add(1, attrs)
        turn_latency_histogram.record(latency_ms, attrs)

        if is_blocked:
            security_blocks_counter.add(1, attrs)
        if pii_count > 0:
            pii_redacted_counter.add(pii_count, attrs)
        if tools_count > 0:
            tool_executions_counter.add(tools_count, attrs)
        if requires_approval:
            tool_approvals_counter.add(1, attrs)

