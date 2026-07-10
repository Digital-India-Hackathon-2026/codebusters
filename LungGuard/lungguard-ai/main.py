"""
LungGuard AI — FastAPI Service
================================
Production-ready AI inference service with 4 endpoints:

  POST /predict-risk        → Risk score prediction from patient data
  POST /analyze-xray        → Chest X-ray analysis (Normal/Pneumonia)
  POST /analyze-lung-cancer → Lung cancer CT scan analysis (Benign/Malignant/Normal)
  POST /chat                → Gemini-powered health chatbot

Architecture:
  React Frontend → Spring Boot Backend → FastAPI AI Service → Trained Models → Response

All models are loaded ONCE at startup and cached in memory.
"""

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from schemas.risk_schema import RiskRequest, RiskResponse
from schemas.chat_schema import ChatRequest, ChatResponse

from services.risk_service import predict_risk, load_models
from services.chat_service import ask_chatbot
from services.xray_service import analyze_xray, get_xray_model
from services.lung_cancer_service import analyze_lung_cancer, get_lung_cancer_model

# ── FastAPI Application ─────────────────────────────────────────────
app = FastAPI(
    title="LungGuard AI Service",
    description="AI-powered health risk assessment, medical image analysis, and health chatbot.",
    version="2.0.0",
)

# ── CORS Middleware (allow React frontend) ──────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup: Pre-load all models ────────────────────────────────────
@app.on_event("startup")
def startup_event():
    print("\n" + "=" * 60)
    print("  LUNGGUARD AI SERVICE — LOADING MODELS...")
    print("=" * 60)

    # 1. Load RandomForest Risk Models
    print("\n[1/3] Loading Risk Assessment Models...")
    try:
        load_models()
    except Exception as e:
        print(f"  ⚠️  Failed to load risk models: {e}")

    # 2. Load ResNet18 X-ray Model
    print("\n[2/3] Loading Chest X-ray Model...")
    try:
        get_xray_model()
    except Exception as e:
        print(f"  ⚠️  Failed to load X-ray model: {e}")

    # 3. Load ResNet18 Lung Cancer Model
    print("\n[3/3] Loading Lung Cancer CT Model...")
    try:
        get_lung_cancer_model()
    except Exception as e:
        print(f"  ⚠️  Failed to load lung cancer model: {e}")

    print("\n" + "=" * 60)
    print("  ALL MODELS LOADED — SERVICE READY")
    print("=" * 60 + "\n")


# ── Health Check ────────────────────────────────────────────────────
@app.get("/")
def home():
    return {
        "service": "LungGuard AI",
        "status": "running",
        "version": "2.0.0",
        "endpoints": [
            "POST /predict-risk",
            "POST /analyze-xray",
            "POST /analyze-lung-cancer",
            "POST /chat",
        ]
    }


# ── Endpoint 1: Risk Prediction ────────────────────────────────────
@app.post("/predict-risk", response_model=RiskResponse)
def predict_risk_api(request: RiskRequest):
    """
    Predict lung and liver risk scores based on patient lifestyle data.

    Returns lungRiskScore (0-100), liverRiskScore (0-100),
    riskCategory (LOW/MEDIUM/HIGH), and a recommendation.
    """
    return predict_risk(request)


# ── Endpoint 2: Chest X-ray Analysis ───────────────────────────────
@app.post("/analyze-xray")
async def analyze_xray_api(file: UploadFile = File(...)):
    """
    Analyze a chest X-ray image for pneumonia detection.

    Accepts: JPEG/PNG image file
    Returns: prediction (Normal/Pneumonia), confidence (%), diagnostic message
    """
    return await analyze_xray(file)


# ── Endpoint 3: Lung Cancer CT Analysis ────────────────────────────
@app.post("/analyze-lung-cancer")
async def analyze_lung_cancer_api(file: UploadFile = File(...)):
    """
    Analyze a lung CT scan image for cancer classification.

    Accepts: JPEG/PNG CT scan image file
    Returns: prediction (Benign/Malignant/Normal), confidence (%), diagnostic message
    """
    return await analyze_lung_cancer(file)


# ── Endpoint 4: Health Chatbot ──────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
def chat_api(request: ChatRequest):
    """
    AI-powered health chatbot using Google Gemini.

    Provides health guidance, symptom classification (emergency/urgent/routine),
    and always includes a medical disclaimer. Never provides diagnosis.
    """
    return ask_chatbot(request)


# ── Run with uvicorn ────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
