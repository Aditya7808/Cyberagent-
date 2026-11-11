import re
from typing import Any, Dict, List, Tuple


class InputSecurityInspector:
    """
    Inspects user inputs for adversarial attacks, prompt injections, and jailbreaks.
    """

    INJECTION_PATTERNS = [
        r"(?i)ignore\s+(all\s+)?(previous|prior)\s+instructions?",
        r"(?i)disregard\s+(the\s+)?(above|previous|system)\s+prompt",
        r"(?i)you\s+are\s+now\s+in\s+developer\s+mode",
        r"(?i)dan\s+mode|do\s+anything\s+now",
        r"(?i)system\s*:\s*you\s+are",
        r"(?i)reveal\s+(your\s+)?(system\s+prompt|internal\s+instructions|secret\s+key)",
        r"(?i)<\s*system\s*>",
        r"(?i)base64\s*decode",
    ]

    def inspect(self, text: str) -> Tuple[bool, List[str], Dict[str, Any]]:
        """
        Returns (is_safe, violation_reasons, metadata)
        """
        if not text:
            return True, [], {"risk_score": 0.0}

        violations = []
        for pattern in self.INJECTION_PATTERNS:
            if re.search(pattern, text):
                violations.append(f"Prompt injection pattern detected: {pattern}")

        is_safe = len(violations) == 0
        risk_score = min(1.0, len(violations) * 0.45)

        return is_safe, violations, {"risk_score": risk_score, "violations_count": len(violations)}
