"""
Pydantic schemas for the Prescription NER Extractor API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class ExtractionRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Raw prescription text to extract entities from.",
        examples=["Tab. Dolo 650mg BD x 5 days"],
    )


class Entity(BaseModel):
    text: str = Field(..., description="The extracted entity text.")
    label: str = Field(..., description="Entity type: MEDICINE, DOSAGE, FREQUENCY, or DURATION.")
    start: int = Field(..., description="Character start offset in the original text.")
    end: int = Field(..., description="Character end offset in the original text.")


class ExtractionResponse(BaseModel):
    input_text: str = Field(..., description="The original prescription text that was processed.")
    entities: List[Entity] = Field(default_factory=list, description="List of extracted entities.")
    medicine: Optional[str] = Field(None, description="Extracted medicine name (first match).")
    dosage: Optional[str] = Field(None, description="Extracted dosage (first match).")
    frequency: Optional[str] = Field(None, description="Extracted frequency (first match).")
    duration: Optional[str] = Field(None, description="Extracted duration (first match).")


class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Human-readable error description.")


class HealthResponse(BaseModel):
    status: str = Field("ok", description="Server health status.")
    model_loaded: bool = Field(..., description="Whether the NER model is loaded successfully.")
    model_labels: List[str] = Field(default_factory=list, description="Entity labels the model recognises.")
