"""
LungGuard AI — X-ray Model Inference Module
=============================================
Loads the trained ResNet18 chest X-ray model and provides prediction interface.
"""

import os
import io
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

# ── Configuration ───────────────────────────────────────────────────
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MODEL_PATH = os.path.join(_PROJECT_ROOT, "saved_models", "xray_resnet18.pth")
_CLASSES_PATH = os.path.join(_PROJECT_ROOT, "saved_models", "xray_classes.txt")
_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Default classes (overridden by saved class file if available)
_DEFAULT_CLASSES = ["NORMAL", "PNEUMONIA"]

# ── Model cache ─────────────────────────────────────────────────────
_model = None
_class_names = None

# ── Image preprocessing pipeline ───────────────────────────────────
_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def _load_class_names() -> list:
    """Load class names from saved file or use defaults."""
    global _class_names
    if _class_names is not None:
        return _class_names

    if os.path.exists(_CLASSES_PATH):
        with open(_CLASSES_PATH, 'r') as f:
            _class_names = [line.strip() for line in f.readlines() if line.strip()]
        print(f"   X-ray classes: {_class_names}")
    else:
        _class_names = _DEFAULT_CLASSES
        print(f"   X-ray classes (default): {_class_names}")

    return _class_names


def load_model() -> nn.Module:
    """Load the X-ray ResNet18 model from disk (cached singleton)."""
    global _model
    if _model is not None:
        return _model

    class_names = _load_class_names()
    num_classes = len(class_names)

    # Build model architecture
    try:
        model = models.resnet18(weights=None)
    except TypeError:
        model = models.resnet18(pretrained=False)

    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(num_ftrs, num_classes)
    )

    # Load trained weights
    if os.path.exists(_MODEL_PATH):
        try:
            state_dict = torch.load(_MODEL_PATH, map_location=_DEVICE)
            model.load_state_dict(state_dict, strict=False)
            print(f"[OK] X-ray model loaded from: {_MODEL_PATH}")
        except Exception as e:
            print(f"[WARN] Error loading X-ray model weights: {e}. Using initialized weights.")
    else:
        print(f"[WARN] X-ray model not found at: {_MODEL_PATH}. Using initialized weights.")

    model = model.to(_DEVICE)
    model.eval()
    _model = model
    return _model


def predict(image_bytes: bytes) -> dict:
    """
    Predict chest X-ray classification.

    Parameters:
        image_bytes: Raw image file bytes

    Returns:
        Dictionary with: prediction (str), confidence (float), message (str)
    """
    model = load_model()
    class_names = _load_class_names()

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        input_tensor = _transform(image).unsqueeze(0).to(_DEVICE)
    except Exception as e:
        return {
            "prediction": "ERROR",
            "confidence": 0.0,
            "message": f"Invalid image file: {str(e)}"
        }

    try:
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)

        confidence, class_idx = torch.max(probabilities, dim=0)
        prediction = class_names[class_idx.item()]
        confidence_val = round(confidence.item() * 100, 2)

        # Generate diagnostic message
        if prediction.upper() == "NORMAL":
            message = (
                "No significant abnormalities detected in the chest X-ray. "
                "Lungs appear clear with normal heart silhouette and lung fields."
            )
        elif prediction.upper() == "PNEUMONIA":
            message = (
                "Signs consistent with Pneumonia detected (localized consolidation or infiltrates). "
                "Clinical correlation and follow-up imaging recommended. "
                "Please consult a pulmonologist for detailed evaluation."
            )
        else:
            message = (
                "Abnormal findings detected. Please consult a radiologist "
                "or pulmonologist for detailed evaluation."
            )

        return {
            "prediction": prediction,
            "confidence": confidence_val,
            "message": message
        }
    except Exception as e:
        return {
            "prediction": "ERROR",
            "confidence": 0.0,
            "message": f"Model inference error: {str(e)}"
        }
