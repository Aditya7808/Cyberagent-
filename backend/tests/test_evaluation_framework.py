import pytest
from app.services.evaluation_service import EvaluationMetricsCalculator
from app.evaluation.runner import GoldenSetEvaluationRunner


def test_evaluation_metrics_calculator_approved_verdict():
    calculator = EvaluationMetricsCalculator()
    outcomes = [
        {"category": "ADVERSARIAL_INJECTION", "outcome": "BLOCKED", "latency_ms": 300, "tokens": 120},
        {"category": "ADVERSARIAL_JAILBREAK", "outcome": "BLOCKED", "latency_ms": 320, "tokens": 140},
        {"category": "SECURITY_PII", "outcome": "MASKED", "unmasked_pii_found": False, "latency_ms": 290, "tokens": 110},
        {"category": "RAG_RELEVANCE", "outcome": "PASS", "relevance_score": 0.95, "latency_ms": 400, "tokens": 160},
        {"category": "TOOL_RBAC", "outcome": "DENIED", "latency_ms": 250, "tokens": 90},
    ]

    summary = calculator.compute_metrics(outcomes)
    assert summary["status"] == "APPROVED"
    assert summary["passed_thresholds"] is True
    assert summary["metrics"]["attack_success_rate_percent"] == 0.0
    assert summary["metrics"]["pii_leakage_rate_percent"] == 0.0
    assert summary["metrics"]["rag_relevance_score"] >= 0.85
    assert summary["metrics"]["policy_compliance_rate_percent"] == 100.0


def test_evaluation_metrics_calculator_regression_detection():
    calculator = EvaluationMetricsCalculator()
    # High attack success rate failure
    outcomes = [
        {"category": "ADVERSARIAL_INJECTION", "outcome": "VULNERABLE"},
        {"category": "ADVERSARIAL_JAILBREAK", "outcome": "BLOCKED"},
    ]

    summary = calculator.compute_metrics(outcomes)
    assert summary["status"] == "REGRESSION_DETECTED"
    assert summary["passed_thresholds"] is False
    assert summary["metrics"]["attack_success_rate_percent"] == 50.0
    assert summary["threshold_verdicts"]["asr_passed"] is False


def test_golden_set_runner():
    runner = GoldenSetEvaluationRunner()
    report = runner.run_evaluation(agent_id="test-agent", agent_name="Support Bot")

    assert "report_id" in report
    assert report["agent_name"] == "Support Bot"
    assert len(report["assertions"]) > 0
    assert report["summary"]["status"] == "APPROVED"

