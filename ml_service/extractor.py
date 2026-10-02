"""
extractor.py — loads the trained spaCy NER model and exposes an extract() function.

The model is loaded once at module import time so it's ready to serve all
incoming requests without the overhead of reloading for each call.
"""

import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

import spacy
from spacy.language import Language

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Resolve the path to model-best relative to this file's location so the
# backend can be launched from any working directory.
# ---------------------------------------------------------------------------
_BACKEND_DIR = Path(__file__).parent.resolve()
_PROJECT_ROOT = _BACKEND_DIR.parent
MODEL_PATH = _PROJECT_ROOT / "model" / "trained_model" / "model-best"

_nlp: Optional[Language] = None


def _load_model() -> Language:
    """Load and return the spaCy NER model. Raises RuntimeError if not found."""
    global _nlp
    if _nlp is not None:
        return _nlp

    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Trained model not found at '{MODEL_PATH}'. "
            "Make sure model/trained_model/model-best exists."
        )

    logger.info("Loading spaCy NER model from %s …", MODEL_PATH)
    _nlp = spacy.load(str(MODEL_PATH))
    labels = _nlp.get_pipe("ner").labels
    logger.info("Model loaded. Entity labels: %s", labels)
    return _nlp


def get_model() -> Language:
    """Return the cached model, loading it on first call."""
    return _load_model()


def is_model_loaded() -> bool:
    """Return True if the model has been loaded successfully."""
    return _nlp is not None


def get_model_labels() -> List[str]:
    """Return the list of entity labels supported by the model."""
    if _nlp is None:
        return []
    return list(_nlp.get_pipe("ner").labels)


# ---------------------------------------------------------------------------
# Core extraction function
# ---------------------------------------------------------------------------

def extract(text: str) -> Dict[str, Any]:
    """
    Run NER on *text* and return a structured dict with:
      - entities   : list of {text, label, start, end}
      - medicine   : first MEDICINE entity text (or None)
      - dosage     : first DOSAGE entity text (or None)
      - frequency  : first FREQUENCY entity text (or None)
      - duration   : first DURATION entity text (or None)
    """
    nlp = get_model()
    doc = nlp(text.strip())

    entities = [
        {
            "text": ent.text,
            "label": ent.label_,
            "start": ent.start_char,
            "end": ent.end_char,
        }
        for ent in doc.ents
    ]

    def _first(label: str) -> Optional[str]:
        return next((e["text"] for e in entities if e["label"] == label), None)

    return {
        "input_text": text,
        "entities": entities,
        "medicine": _first("MEDICINE"),
        "dosage": _first("DOSAGE"),
        "frequency": _first("FREQUENCY"),
        "duration": _first("DURATION"),
    }


# Eagerly load the model when the module is imported (e.g. on server start-up)
try:
    _load_model()
except RuntimeError as exc:
    logger.warning("Model could not be loaded at import time: %s", exc)
