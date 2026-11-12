import math
import pytest
import uuid
from app.models.document import DocumentAccessLevel
from app.models.user import UserRole
from app.services.rag_service import EmbeddingGenerator, TextChunker
from app.services.rag_engine import ROLE_PERMITTED_LEVELS


def test_text_chunker_splits_paragraphs():
    chunker = TextChunker(chunk_size=120, chunk_overlap=20)
    text = (
        "Acme Corporation is an enterprise technology provider pioneering next-generation cloud infrastructure.\n\n"
        "Our mission is to empower developers to build resilient, trustworthy, and auditable enterprise systems.\n\n"
        "Founded in 2018, Acme serves over 400 Global 2000 customers worldwide with high security."
    )

    chunks = chunker.split_text(text)
    assert len(chunks) >= 2
    for chunk in chunks:
        assert len(chunk) > 0


def test_embedding_generator_dimension_and_normalization():
    text = "Enterprise AI Agent Security & Reliability Platform"
    vector = EmbeddingGenerator.generate_embedding(text)

    # 1. Exactly 1536 dimensions
    assert len(vector) == 1536

    # 2. Unit norm check: sum(x^2) ≈ 1.0
    norm = math.sqrt(sum(x * x for x in vector))
    assert abs(norm - 1.0) < 1e-5


def test_role_permitted_access_levels():
    # Viewer cannot access CONFIDENTIAL or RESTRICTED
    viewer_levels = ROLE_PERMITTED_LEVELS[UserRole.VIEWER]
    assert DocumentAccessLevel.PUBLIC in viewer_levels
    assert DocumentAccessLevel.INTERNAL in viewer_levels
    assert DocumentAccessLevel.CONFIDENTIAL not in viewer_levels
    assert DocumentAccessLevel.RESTRICTED not in viewer_levels

    # Operator gets CONFIDENTIAL but not RESTRICTED
    operator_levels = ROLE_PERMITTED_LEVELS[UserRole.OPERATOR]
    assert DocumentAccessLevel.CONFIDENTIAL in operator_levels
    assert DocumentAccessLevel.RESTRICTED not in operator_levels

    # Admin gets all
    admin_levels = ROLE_PERMITTED_LEVELS[UserRole.ADMIN]
    assert DocumentAccessLevel.RESTRICTED in admin_levels

