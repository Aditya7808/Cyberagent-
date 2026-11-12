import pytest
from app.observability.tracing import SentinelTracer
from app.observability.metrics import SentinelMetrics


def test_sentinel_tracer_lifecycle_span():
    span = SentinelTracer.start_agent_span(
        agent_id="test-agent-01",
        org_id="acme-corp",
        turn_id="turn-994",
    )
    assert span is not None

    # Trace a stage with both safe and sensitive metadata
    stage_span = SentinelTracer.trace_stage(
        parent_span=span,
        stage_name="input_inspection",
        metadata={
            "risk_score": 0.85,
            "secret_token": "SUPER_SECRET_VALUE",
            "is_safe": False,
        },
    )
    assert stage_span is not None

    stage_span.end()
    span.end()


def test_sentinel_metrics_record_turn():
    # Verify no unhandled exception when recording metrics
    SentinelMetrics.record_turn(
        agent_id="test-agent-01",
        org_id="acme-corp",
        latency_ms=315.5,
        is_blocked=True,
        pii_count=2,
        tools_count=1,
        requires_approval=True,
    )
