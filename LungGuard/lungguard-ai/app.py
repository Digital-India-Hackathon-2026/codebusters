from fastapi import FastAPI, UploadFile, File

from schemas.risk_schema import RiskRequest, RiskResponse
from schemas.chat_schema import ChatRequest, ChatResponse

from services.risk_service import predict_risk, load_models
from services.chat_service import ask_chatbot
from services.xray_service import analyze_xray, get_xray_model

app = FastAPI()

@app.on_event("startup")
def startup_event():
    print("="*60)
    print("PRE-LOADING LUNGGUARD AI MODELS AT STARTUP...")
    # Load RandomForest models
    load_models()
    # Load ResNet18 X-ray model
    try:
        get_xray_model()
        print("Models successfully cached at startup.")
    except Exception as e:
        print(f"Warning: Failed to load X-ray model at startup: {e}")
    print("="*60)

@app.get("/")
def home():
    return {"message": "LungGuard AI Service Running"}

@app.post("/predict-risk", response_model=RiskResponse)
def predict_risk_api(request: RiskRequest):
    return predict_risk(request)

@app.post("/chat", response_model=ChatResponse)
def chat_api(request: ChatRequest):
    return ask_chatbot(request)

@app.post("/analyze-xray")
async def analyze_xray_api(file: UploadFile = File(...)):
    return await analyze_xray(file)