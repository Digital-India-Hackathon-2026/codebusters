"""
LungGuard AI — Lung Cancer CT Analysis Service
================================================
Handles lung cancer CT scan image uploads and prediction
using the trained ResNet18 model.

Classes: Benign, Malignant, Normal
"""

import os
from fastapi import UploadFile
from models.lung_cancer_model import load_model as load_lc_model, predict as lc_predict

# Upload directory
_UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "uploads"
)
os.makedirs(_UPLOAD_DIR, exist_ok=True)


def get_lung_cancer_model():
    """Pre-load the lung cancer model at startup."""
    return load_lc_model()


async def analyze_lung_cancer(file: UploadFile) -> dict:
    """
    Analyze a lung CT scan image for cancer classification.

    Parameters:
        file: Uploaded CT scan image file (JPEG/PNG)

    Returns:
        Dictionary with fileName, prediction, confidence, message
    """
    # Read file bytes
    try:
        contents = await file.read()
    except Exception as e:
        return {
            "fileName": file.filename,
            "prediction": "ERROR",
            "confidence": 0.0,
            "message": f"Failed to read uploaded file: {str(e)}"
        }

    # Save to uploads directory for record-keeping
    try:
        file_path = os.path.join(_UPLOAD_DIR, f"ct_{file.filename}")
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        print(f"[WARN] Could not save uploaded file: {e}")

    # Run prediction
    result = lc_predict(contents)

    return {
        "fileName": file.filename,
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "message": result["message"]
    }
