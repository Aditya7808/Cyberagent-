import logging
import re
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("sentinel.security.pii")


class CustomPIIEngine:
    """
    Enterprise PII & Secrets Detection & Masking Engine.
    Combines Microsoft Presidio with regex pattern matchers for:
    - AWS Access Keys & Secrets
    - API Tokens & Private Keys
    - Bank Account & Routing Numbers
    - US SSNs & Employee Badges
    - Phone Numbers & Emails
    """

    CUSTOM_PATTERNS = {
        "AWS_ACCESS_KEY": (
            r"\b(AKIA[0-9A-Z]{16})\b",
            "<AWS_KEY_REDACTED>",
        ),
        "AWS_SECRET_KEY": (
            r"(?i)aws_secret_access_key\s*=\s*['\"]?([a-zA-Z0-9/+=]{40})['\"]?",
            "aws_secret_access_key=<SECRET_REDACTED>",
        ),
        "GENERIC_API_TOKEN": (
            r"\b(?:api[_-]?key|auth[_-]?token|bearer\s+)([a-zA-Z0-9_\-\.]{24,})\b",
            "<API_TOKEN_REDACTED>",
        ),
        "US_SSN": (
            r"\b\d{3}-\d{2}-\d{4}\b",
            "<SSN_REDACTED>",
        ),
        "BANK_ACCOUNT": (
            r"\b(?:account|acct)[\s#:]*(\d{8,14})\b",
            "<BANK_ACCT_REDACTED>",
        ),
        "BANK_ROUTING": (
            r"\b(?:routing[\s#:]*)(\d{9})\b",
            "<ROUTING_REDACTED>",
        ),
        "EMPLOYEE_BADGE": (
            r"\b(?:ACM|GLB|WYN)-\d{3,4}\b",
            "<BADGE_REDACTED>",
        ),
        "PHONE_NUMBER": (
            r"\+?\b(?:\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b",
            "<PHONE_REDACTED>",
        ),
        "EMAIL_ADDRESS": (
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b",
            "<EMAIL_REDACTED>",
        ),
    }

    def __init__(self):
        # Optional Presidio Analyzer/Anonymizer integration
        try:
            from presidio_analyzer import AnalyzerEngine
            from presidio_anonymizer import AnonymizerEngine
            self.presidio_analyzer = AnalyzerEngine()
            self.presidio_anonymizer = AnonymizerEngine()
            self.has_presidio = True
        except Exception:
            self.has_presidio = False
            logger.info("Presidio optional modules not loaded. Using deterministic regex engine.")

    def scan_and_redact(
        self,
        text: str,
        policy_action: str = "mask",  # mask | block | flag
        allowed_entities: Optional[List[str]] = None,
    ) -> Tuple[str, List[Dict[str, Any]], bool]:
        """
        Scans text for sensitive data and PII.
        
        Returns:
            (sanitized_text, detected_entities, should_block)
        """
        if not text:
            return text, [], False

        detected: List[Dict[str, Any]] = []
        sanitized = text

        for entity_type, (pattern, replacement) in self.CUSTOM_PATTERNS.items():
            if allowed_entities and entity_type not in allowed_entities:
                continue

            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            for match in matches:
                val = match.group(0)
                detected.append({
                    "entity_type": entity_type,
                    "matched_text": val[:4] + "***" if len(val) > 4 else "***",
                    "start": match.start(),
                    "end": match.end(),
                })

            if matches and policy_action == "mask":
                sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)

        should_block = (policy_action == "block" and len(detected) > 0)

        return sanitized, detected, should_block
