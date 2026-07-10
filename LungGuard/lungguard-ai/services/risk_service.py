"""
LungGuard AI — Risk Prediction Service
========================================
Handles risk prediction requests using the trained RandomForest model.
Falls back to rule-based calculation if model is unavailable.
"""

import os
from schemas.risk_schema import RiskRequest, RiskResponse
from models.risk_model import load_model as load_risk_model, predict as ml_predict


def load_models():
    """Pre-load risk models at startup."""
    return load_risk_model()


def predict_risk(request: RiskRequest) -> RiskResponse:
    """Predict lung and liver risk scores from patient data."""

    # ── Attempt ML prediction ───────────────────────────────────────
    features_dict = {
        'age': request.age,
        'gender': request.gender,
        'weight': request.weight,
        'cigarettesPerDay': request.cigarettesPerDay,
        'smokingYears': request.smokingYears,
        'alcoholFrequency': request.alcoholFrequency,
        'hasCough': request.hasCough,
        'hasChestPain': request.hasChestPain,
        'hasBreathlessness': request.hasBreathlessness,
    }

    result = ml_predict(features_dict)

    if result is not None:
        lung_score = result['lungRiskScore']
        liver_score = result['liverRiskScore']
    else:
        # ── Rule-based fallback ─────────────────────────────────────
        print("[WARN] ML model unavailable. Using rule-based risk prediction.")
        return _rule_based_fallback(request)

    # ── Determine risk category and recommendation ──────────────────
    highest = max(lung_score, liver_score)

    if highest <= 30:
        category = "LOW"
        recommendation = (
            "Your risk levels are currently low. Maintain a healthy lifestyle, "
            "avoid smoking and excessive alcohol consumption, and continue "
            "regular health checkups."
        )
    elif highest <= 60:
        category = "MEDIUM"
        recommendation = (
            "Moderate risk detected. Consider reducing or eliminating smoking "
            "and alcohol intake. Schedule regular health checkups and consult "
            "a healthcare provider about preventive measures."
        )
    else:
        category = "HIGH"
        recommendation = (
            "[!] High risk detected. Please consult a doctor or pulmonologist "
            "as soon as possible. Immediate lifestyle changes are strongly "
            "recommended including smoking cessation and alcohol reduction."
        )

    return RiskResponse(
        lungRiskScore=lung_score,
        liverRiskScore=liver_score,
        riskCategory=category,
        recommendation=recommendation,
    )


def _rule_based_fallback(request: RiskRequest) -> RiskResponse:
    """Rule-based risk scoring when ML model is unavailable."""
    lung_score = 0
    liver_score = 0

    # Lung risk factors
    lung_score += request.cigarettesPerDay * 2
    lung_score += request.smokingYears * 3
    if request.hasCough:
        lung_score += 10
    if request.hasChestPain:
        lung_score += 15
    if request.hasBreathlessness:
        lung_score += 20
    if request.age > 40:
        lung_score += 10
    if request.age > 60:
        lung_score += 20

    # Liver risk factors
    alcohol = request.alcoholFrequency.lower()
    if alcohol == "monthly":
        liver_score += 10
    elif alcohol == "weekly":
        liver_score += 25
    elif alcohol == "daily":
        liver_score += 40
    if request.age > 40:
        liver_score += 10
    if request.smokingYears > 10:
        liver_score += 10

    lung_score = min(lung_score, 100)
    liver_score = min(liver_score, 100)
    highest = max(lung_score, liver_score)

    if highest <= 30:
        category = "LOW"
        recommendation = "Maintain a healthy lifestyle and avoid smoking or alcohol."
    elif highest <= 60:
        category = "MEDIUM"
        recommendation = "Reduce smoking/alcohol intake and consider regular health checkups."
    else:
        category = "HIGH"
        recommendation = "High risk detected. Please consult a doctor or pulmonologist as soon as possible."

    return RiskResponse(
        lungRiskScore=lung_score,
        liverRiskScore=liver_score,
        riskCategory=category,
        recommendation=recommendation,
    )