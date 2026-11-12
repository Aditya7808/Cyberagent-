import re
from typing import Any, Dict, List, Tuple


class InjectionAttackDetector:
    """
    Multi-vector attack detector for LLM agents.
    Detects Direct Injections, Jailbreak Personas, Data Extraction probes,
    and Delimiter manipulation.
    """

    ATTACK_VECTORS = {
        "DIRECT_INJECTION": [
            r"(?i)ignore\s+(all\s+)?(previous|prior|system)\s+instructions?",
            r"(?i)disregard\s+(all\s+)?(above|previous|system)\s+(prompt|rules|constraints)",
            r"(?i)from\s+now\s+on\s*,\s*you\s+(must|will|should)\s+ignore",
            r"(?i)overwrite\s+(your\s+)?system\s+directive",
            r"(?i)forget\s+(everything\s+)?you\s+(were|have\s+been)\s+told",
        ],
        "JAILBREAK_ROLEPLAY": [
            r"(?i)you\s+are\s+now\s+in\s+developer\s+mode",
            r"(?i)\bDAN\s+(mode|jailbreak)\b",
            r"(?i)do\s+anything\s+now",
            r"(?i)pretend\s+you\s+have\s+no\s+(rules|restrictions|filters|guidelines)",
            r"(?i)act\s+as\s+an\s+unfiltered\s+(AI|assistant|model)",
            r"(?i)hypothetical\s+scenario\s+where\s+safety\s+does\s+not\s+apply",
        ],
        "DATA_EXTRACTION": [
            r"(?i)reveal\s+(your\s+)?(system\s+prompt|internal\s+instructions|base\s+prompt)",
            r"(?i)print\s+(your\s+)?initial\s+instructions?\s+verbatim",
            r"(?i)what\s+are\s+the\s+hidden\s+(rules|prompts|credentials|keys)",
            r"(?i)dump\s+(all\s+)?environment\s+variables",
            r"(?i)show\s+me\s+the\s+database\s+password",
        ],
        "DELIMITER_INJECTION": [
            r"(?i)<\s*system\s*>",
            r"(?i)\[\s*system\s*\]",
            r"(?i)\[\s*admin\s*\]",
            r"(?i)---BEGIN\s+(SYSTEM|ROOT|ADMIN)\s+PROMPT---",
            r"(?i)```system",
        ],
    }

    ZERO_WIDTH_CHARS = re.compile(r"[\u200B\u200C\u200D\uFEFF\u2060]")

    def detect_attacks(self, text: str) -> Tuple[bool, List[Dict[str, Any]], float]:
        """
        Analyzes input string across all attack vectors.
        
        Returns:
            (is_flagged, detected_attacks, composite_risk_score)
        """
        if not text:
            return False, [], 0.0

        # Check for invisible / zero-width obfuscation
        stripped_obfuscation = self.ZERO_WIDTH_CHARS.sub("", text)
        has_invisible_chars = len(stripped_obfuscation) < len(text)

        detected: List[Dict[str, Any]] = []

        if has_invisible_chars:
            detected.append({
                "vector": "OBFUSCATION",
                "severity": "HIGH",
                "pattern": "Zero-width invisible Unicode characters detected",
                "confidence": 0.95,
            })

        # Run vector matchers on cleaned text
        for vector_name, patterns in self.ATTACK_VECTORS.items():
            for pat in patterns:
                match = re.search(pat, stripped_obfuscation)
                if match:
                    detected.append({
                        "vector": vector_name,
                        "severity": "CRITICAL" if vector_name in ["DIRECT_INJECTION", "DATA_EXTRACTION"] else "HIGH",
                        "pattern": pat,
                        "matched_string": match.group(0),
                        "confidence": 0.92,
                    })
                    break  # One match per vector is sufficient to classify

        is_flagged = len(detected) > 0
        risk_score = min(1.0, len(detected) * 0.40)

        return is_flagged, detected, risk_score
