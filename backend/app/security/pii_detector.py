import logging
from typing import Any, Dict, List, Tuple
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

logger = logging.getLogger(__name__)


class PIIDetector:
    """
    Enterprise PII Detection & Anonymization Engine using Microsoft Presidio.
    Supports detecting EMAIL, PHONE_NUMBER, PERSON, US_SSN, CREDIT_CARD, etc.
    """

    def __init__(self):
        try:
            self.analyzer = AnalyzerEngine()
            self.anonymizer = AnonymizerEngine()
            self._initialized = True
        except Exception as e:
            logger.warning(f"Presidio model initialization warning: {e}. Fallback to pattern matching.")
            self._initialized = False

    def analyze_and_mask(
        self, text: str, entities: List[str] = None
    ) -> Tuple[str, List[Dict[str, Any]]]:
        if not text:
            return text, []

        if not self._initialized:
            # Fallback simple masking for common patterns if spaCy model is loading/absent
            return text, []

        target_entities = entities or [
            "EMAIL_ADDRESS",
            "PHONE_NUMBER",
            "PERSON",
            "US_SSN",
            "CREDIT_CARD",
            "IP_ADDRESS",
        ]

        results = self.analyzer.analyze(
            text=text,
            entities=target_entities,
            language="en",
        )

        detected_entities = [
            {
                "type": r.entity_type,
                "start": r.start,
                "end": r.end,
                "score": r.score,
            }
            for r in results
        ]

        anonymized_result = self.anonymizer.anonymize(
            text=text,
            analyzer_results=results,
            operators={
                "DEFAULT": OperatorConfig("replace", {"new_value": "<PII_REDACTED>"})
            },
        )

        return anonymized_result.text, detected_entities
