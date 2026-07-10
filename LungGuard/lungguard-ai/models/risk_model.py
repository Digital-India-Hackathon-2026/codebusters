"""
LungGuard AI — Risk Model Inference Module
===========================================
Loads the trained RandomForest risk model and provides prediction interface.
"""

import os
import joblib
import numpy as np

# ── Model cache ─────────────────────────────────────────────────────
_models = None
_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "saved_models", "risk_model.pkl"
)


def load_model():
    """Load the risk model from disk (cached singleton)."""
    global _models
    if _models is not None:
        return _models

    if not os.path.exists(_MODEL_PATH):
        print(f"[WARN] Risk model not found at: {_MODEL_PATH}")
        return None

    try:
        _models = joblib.load(_MODEL_PATH)
        print(f"[OK] Risk model loaded from: {_MODEL_PATH}")
        if 'lung_metrics' in _models:
            print(f"   Lung  — MAE: {_models['lung_metrics']['mae']:.2f}, R²: {_models['lung_metrics']['r2']:.4f}")
        if 'liver_metrics' in _models:
            print(f"   Liver — MAE: {_models['liver_metrics']['mae']:.2f}, R²: {_models['liver_metrics']['r2']:.4f}")
        return _models
    except Exception as e:
        print(f"[ERROR] Error loading risk model: {e}")
        return None


def predict(features_dict: dict) -> dict:
    """
    Predict lung and liver risk scores from patient features.

    Parameters:
        features_dict: Dictionary with keys matching the API request schema:
            age, gender, weight, cigarettesPerDay, smokingYears,
            alcoholFrequency, hasCough, hasChestPain, hasBreathlessness

    Returns:
        Dictionary with: lungRiskScore, liverRiskScore
    """
    models = load_model()

    if models is None or 'lung_model' not in models or 'liver_model' not in models:
        return None

    # ── Map API fields → model features ─────────────────────────────
    # The model was trained on CSV columns:
    # sex, age, height, weight, waistline, SBP, DBP, BLDS, tot_chole,
    # HDL_chole, LDL_chole, triglyceride, hemoglobin, urine_protein,
    # serum_creatinine, SGOT_AST, SGOT_ALT, gamma_GTP, SMK_stat_type_cd, DRK_YN
    #
    # API only provides a subset, so we use sensible defaults for missing values.

    gender_num = 1 if str(features_dict.get('gender', '')).lower() == 'male' else 0

    # Map smoking info → SMK_stat_type_cd
    cigs = features_dict.get('cigarettesPerDay', 0)
    years = features_dict.get('smokingYears', 0)
    if cigs > 0 and years > 0:
        smk_stat = 3  # current smoker
    elif years > 0:
        smk_stat = 2  # used to smoke
    else:
        smk_stat = 1  # never smoked

    # Map alcohol frequency → DRK_YN
    alc = str(features_dict.get('alcoholFrequency', 'never')).lower()
    drk_yn = 1 if alc in ('monthly', 'weekly', 'daily') else 0

    # Estimate some biomarkers from available info for reasonable predictions
    age = features_dict.get('age', 30)
    weight = features_dict.get('weight', 70.0)

    # Height estimate (for BMI-based waistline approximation)
    height = 170  # default
    waistline = weight * 0.45 + 30  # rough approximation

    # Blood pressure estimates based on age and smoking
    base_sbp = 110 + (age - 20) * 0.5 + cigs * 0.5
    base_dbp = 70 + (age - 20) * 0.3 + cigs * 0.3

    # Cholesterol estimates
    base_chol = 150 + age * 0.8 + (cigs * 2)
    hdl = max(30, 55 - cigs * 0.5 - (1 if drk_yn else 0) * 5)
    ldl = base_chol * 0.6
    triglyceride = 80 + (30 if drk_yn else 0) + age * 0.3

    # Hemoglobin (smoking tends to increase it)
    hemoglobin = (15.0 if gender_num == 1 else 13.0) + cigs * 0.05

    # Liver enzymes (alcohol elevates these)
    alc_mult = {'never': 1.0, 'monthly': 1.2, 'weekly': 1.8, 'daily': 3.0}.get(alc, 1.0)
    sgot_ast = 25 * alc_mult
    sgot_alt = 22 * alc_mult
    gamma_gtp = 30 * alc_mult + cigs * 0.5

    # Blood sugar estimate
    blds = 90 + age * 0.2

    # Symptoms boost to risk biomarkers
    has_cough = 1 if features_dict.get('hasCough', False) else 0
    has_chest_pain = 1 if features_dict.get('hasChestPain', False) else 0
    has_breathless = 1 if features_dict.get('hasBreathlessness', False) else 0

    if has_cough:
        base_sbp += 5
    if has_chest_pain:
        base_sbp += 10
    if has_breathless:
        hemoglobin -= 0.5

    # ── Construct feature vector (same order as training) ───────────
    # feature_cols = ['sex', 'age', 'height', 'weight', 'waistline',
    #                 'SBP', 'DBP', 'BLDS', 'tot_chole', 'HDL_chole', 'LDL_chole',
    #                 'triglyceride', 'hemoglobin', 'urine_protein', 'serum_creatinine',
    #                 'SGOT_AST', 'SGOT_ALT', 'gamma_GTP', 'SMK_stat_type_cd', 'DRK_YN']

    features = np.array([[
        gender_num,           # sex
        age,                  # age
        height,               # height
        weight,               # weight
        waistline,            # waistline
        base_sbp,             # SBP
        base_dbp,             # DBP
        blds,                 # BLDS
        base_chol,            # tot_chole
        hdl,                  # HDL_chole
        ldl,                  # LDL_chole
        triglyceride,         # triglyceride
        hemoglobin,           # hemoglobin
        1.0,                  # urine_protein (normal)
        1.0,                  # serum_creatinine (normal)
        sgot_ast,             # SGOT_AST
        sgot_alt,             # SGOT_ALT
        gamma_gtp,            # gamma_GTP
        smk_stat,             # SMK_stat_type_cd
        drk_yn                # DRK_YN
    ]])

    try:
        lung_score = int(np.clip(models['lung_model'].predict(features)[0], 0, 100))
        liver_score = int(np.clip(models['liver_model'].predict(features)[0], 0, 100))
        return {
            'lungRiskScore': lung_score,
            'liverRiskScore': liver_score,
        }
    except Exception as e:
        print(f"[ERROR] Risk model prediction error: {e}")
        return None
