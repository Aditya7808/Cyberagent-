from typing import Any, Dict, List, Tuple
from app.security.pii_detector import PIIDetector


class OutputSecurityInspector:
    """
    Inspects model output for data leaks, PII exposure, and policy violations.
    """

    def __init__(self):
        self.pii_detector = PIIDetector()

    def inspect_and_sanitize(
        self, text: str, redact_pii: bool = True
    ) -> Tuple[str, bool, List[str], Dict[str, Any]]:
        """
        Returns (sanitized_text, is_compliant, violations, metadata)
        """
        if not text:
            return text, True, [], {}

        violations = []
        sanitized_text = text
        pii_entities = []

        if redact_pii:
            sanitized_text, pii_entities = self.pii_detector.analyze_and_mask(text)
            if pii_entities:
                violations.append(f"Detected {len(pii_entities)} PII occurrences in output")

        is_compliant = len(violations) == 0
        metadata = {
            "pii_detected_count": len(pii_entities),
            "pii_entities": pii_entities,
            "was_redacted": redact_pii and len(pii_entities) > 0,
        }

        return sanitized_text, is_compliant, violations, metadata

