"""
app.py — FastAPI application for the Prescription NER Extractor.

Start the server with:
    uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000

Or from the backend/ directory:
    uvicorn app:app --reload --host 0.0.0.0 --port 8000

Interactive API docs will be available at http://localhost:8000/docs
"""

import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from schemas import ExtractionRequest, ExtractionResponse, HealthResponse, Entity
import extractor

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Prescription NER Extractor API",
    description=(
        "Extract structured medical information — **medicine name**, **dosage**, "
        "**frequency**, and **duration** — from raw prescription text using a "
        "custom-trained spaCy NER model (F1 ≈ 98.5 %)."
    ),
    version="1.0.0",
    contact={
        "name": "Ansh Rajput",
        "url": "https://github.com/anshrajput277-prog/prescription-ner-extractor",
    },
    license_info={"name": "MIT"},
)

# ---------------------------------------------------------------------------
# CORS — allow all origins during development so the React frontend can call
# the API from localhost (any port).  Restrict origins in production.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    tags=["Utility"],
)
def health() -> HealthResponse:
    """
    Returns the health status of the API and whether the NER model is loaded.
    Use this endpoint to verify the server is running before sending extraction
    requests.
    """
    return HealthResponse(
        status="ok",
        model_loaded=extractor.is_model_loaded(),
        model_labels=extractor.get_model_labels(),
    )


@app.post(
    "/extract",
    response_model=ExtractionResponse,
    summary="Extract entities from prescription text",
    tags=["NER"],
    responses={
        422: {"description": "Validation error — text is empty or too long."},
        503: {"description": "Model not loaded — server is still starting up."},
        500: {"description": "Internal extraction error."},
    },
)
def extract(request: ExtractionRequest) -> ExtractionResponse:
    """
    Submit raw prescription text and receive structured extracted entities.

    **Example input:**
    ```json
    { "text": "Tab. Dolo 650mg BD x 5 days" }
    ```

    **Example output:**
    ```json
    {
      "input_text": "Tab. Dolo 650mg BD x 5 days",
      "entities": [
        {"text": "Dolo",   "label": "MEDICINE",   "start": 5,  "end": 9},
        {"text": "650mg",  "label": "DOSAGE",     "start": 10, "end": 15},
        {"text": "BD",     "label": "FREQUENCY",  "start": 16, "end": 18},
        {"text": "5 days", "label": "DURATION",   "start": 21, "end": 27}
      ],
      "medicine":  "Dolo",
      "dosage":    "650mg",
      "frequency": "BD",
      "duration":  "5 days"
    }
    ```
    """
    if not extractor.is_model_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="NER model is not loaded yet. Please try again in a moment.",
        )

    try:
        result = extractor.extract(request.text)
    except Exception as exc:
        logger.exception("Extraction failed for text: %r", request.text)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Extraction error: {exc}",
        ) from exc

    return ExtractionResponse(
        input_text=result["input_text"],
        entities=[Entity(**e) for e in result["entities"]],
        medicine=result["medicine"],
        dosage=result["dosage"],
        frequency=result["frequency"],
        duration=result["duration"],
    )


# ---------------------------------------------------------------------------
# Entry point for direct execution: python app.py
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
