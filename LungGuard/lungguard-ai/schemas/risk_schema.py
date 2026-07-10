from pydantic import BaseModel

class RiskRequest(BaseModel):
    age: int
    gender: str
    weight: float
    cigarettesPerDay: int
    smokingYears: int
    alcoholFrequency: str
    hasCough: bool
    hasChestPain: bool
    hasBreathlessness: bool

class RiskResponse(BaseModel):
    lungRiskScore: int
    liverRiskScore: int
    riskCategory: str
    recommendation: str