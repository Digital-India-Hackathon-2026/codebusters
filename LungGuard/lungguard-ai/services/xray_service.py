"""
LungGuard AI — X-ray Analysis Service
=======================================
Handles chest X-ray image uploads and prediction using the trained ResNet18 model.
"""

import os
from fastapi import UploadFile
from models.xray_model import load_model as load_xray_model, predict as xray_predict

# Upload directory
_UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "uploads"
)
os.makedirs(_UPLOAD_DIR, exist_ok=True)


def get_xray_model():
    """Pre-load the X-ray model at startup."""
    return load_xray_model()


async def analyze_xray(file: UploadFile) -> dict:
    """
    Analyze a chest X-ray image.

    Parameters:
        file: Uploaded image file (JPEG/PNG)

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
        file_path = os.path.join(_UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        print(f"[WARN] Could not save uploaded file: {e}")

    # Run prediction
    result = xray_predict(contents)

    return {
        "fileName": file.filename,
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "message": result["message"]
    }