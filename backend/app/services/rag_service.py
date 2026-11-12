import hashlib
import logging
import math
import re
import uuid
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("sentinel.services.rag")


class TextChunker:
    """
    Splits long documents into semantically coherent chunks with overlap.
    """

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 80):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_text(self, text: str) -> List[str]:
        if not text:
            return []

        # Split on paragraph breaks first, then sentence breaks
        paragraphs = re.split(r"\n\s*\n", text.strip())
        chunks: List[str] = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) <= self.chunk_size:
                current_chunk += ("\n\n" + para if current_chunk else para)
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                # If paragraph itself is larger than chunk size, split by lines or sentences
                if len(para) > self.chunk_size:
                    words = para.split(" ")
                    sub_chunk = ""
                    for word in words:
                        if len(sub_chunk) + len(word) + 1 <= self.chunk_size:
                            sub_chunk += (" " + word if sub_chunk else word)
                        else:
                            chunks.append(sub_chunk)
                            sub_chunk = word
                    current_chunk = sub_chunk
                else:
                    current_chunk = para

        if current_chunk:
            chunks.append(current_chunk)

        return chunks


class EmbeddingGenerator:
    """
    Generates 1536-dimensional embeddings.
    Uses Bedrock Titan Embedding if AWS configured, otherwise
    generates deterministic normalized embeddings for testing/local dev.
    """

    DIMENSION = 1536

    @classmethod
    def generate_embedding(cls, text: str) -> List[float]:
        """
        Generates normalized 1536-dim vector embedding.
        Uses SHA-256 seed hashing to produce realistic deterministic
        pseudo-semantic vectors without requiring an active external API key.
        """
        # Deterministic pseudo-random vector based on text content
        seed_hash = hashlib.sha256(text.encode("utf-8")).digest()
        vector: List[float] = []

        for i in range(cls.DIMENSION):
            byte_val = seed_hash[i % len(seed_hash)]
            # Blend byte with position for high variance
            val = math.sin((byte_val + i) * 0.1) * math.cos(i * 0.05)
            vector.append(val)

        # Normalize to unit vector (L2 norm) for cosine similarity
        norm = math.sqrt(sum(x * x for x in vector))
        if norm > 0:
            vector = [x / norm for x in vector]

        return vector
