from pydantic import BaseModel


class LungCancerResponse(BaseModel):
    """Response schema for lung cancer CT scan analysis."""
    fileName: str
    prediction: str
    confidence: float
    message: str
