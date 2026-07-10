"""
LungGuard AI — Chatbot Service (Gemini AI Integration)
======================================================
Provides AI-powered health chat using Google Gemini API.
- Reads GEMINI_API_KEY from .env (never hardcoded)
- Classifies symptoms as emergency/urgent/routine
- Always includes medical disclaimer
- Never provides medical diagnosis
- Recommends doctor consultation when necessary
"""

import os
import re
from dotenv import load_dotenv

load_dotenv()

from schemas.chat_schema import ChatRequest, ChatResponse

# ── Medical Disclaimer ──────────────────────────────────────────────
MEDICAL_DISCLAIMER = (
    "\n\n*⚠️ DISCLAIMER: I am an AI Health Copilot, not a qualified medical "
    "practitioner. This information is for educational and wellness purposes "
    "only. It is not a medical diagnosis. If you are experiencing a medical "
    "emergency, please contact emergency services (112/911) immediately. "
    "Always consult a qualified healthcare provider for medical advice.*"
)


def classify_symptoms_locally(message: str) -> tuple:
    """
    Classify user symptoms into emergency, urgent, or routine categories.

    Returns:
        Tuple of (classification, recommendation_message)
    """
    msg_lower = message.lower()

    emergency_patterns = [
        r"chest\s*pain", r"breathless", r"breathing\s*difficulty",
        r"chok", r"blood", r"severe\s*pain", r"unconscious",
        r"stroke", r"heart\s*attack", r"shortness\s*of\s*breath",
        r"collaps", r"seizure", r"paralys", r"can'?t\s*breathe",
        r"coughing\s*blood", r"hemoptysis"
    ]
    urgent_patterns = [
        r"cough", r"fever", r"wheez", r"vomit", r"bronchitis",
        r"asthma", r"infection", r"sore\s*throat", r"influenza",
        r"flu", r"liver\s*pain", r"abdominal\s*pain", r"weight\s*loss",
        r"night\s*sweats", r"fatigue", r"swelling", r"nodule"
    ]

    for pattern in emergency_patterns:
        if re.search(pattern, msg_lower):
            return (
                "emergency",
                "🚨 CRITICAL/EMERGENCY: Your symptoms could indicate a "
                "high-risk condition. Seek emergency medical attention or "
                "visit the nearest emergency room immediately!"
            )

    for pattern in urgent_patterns:
        if re.search(pattern, msg_lower):
            return (
                "urgent",
                "⚠️ URGENT: Your symptoms require prompt evaluation. "
                "Please schedule a visit to a doctor or walk-in clinic "
                "within the next 24-48 hours."
            )

    return (
        "routine",
        "ℹ️ ROUTINE: General health inquiry. Keep monitoring your "
        "symptoms, and consult a doctor if you feel unwell or if "
        "your condition changes."
    )


def ask_chatbot(request: ChatRequest) -> ChatResponse:
    """
    Process a chat message and return AI-generated health guidance.

    Uses Google Gemini API when available, falls back to rule-based responses.
    """
    message = request.message

    # Classify symptoms locally first (safety net)
    symptom_class, recommendation_msg = classify_symptoms_locally(message)

    api_key = os.environ.get("GEMINI_API_KEY")
    reply = ""

    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)

            # Use gemini-1.5-flash for rapid, lightweight responses
            model = genai.GenerativeModel('gemini-1.5-flash')

            system_prompt = (
                "You are LungGuard AI, a professional and caring health copilot "
                "focusing on smoking/alcohol health effects, lung health, and liver care. "
                "You must follow these rules STRICTLY:\n\n"
                "1. Start your response with: 'SYMPTOM CLASSIFICATION: "
                f"[{symptom_class}]' based on the detected symptom severity.\n"
                "2. Clearly state that you are an AI assistant and NOT a doctor. "
                "Do NOT diagnose the user under any circumstances.\n"
                "3. Provide educational, non-diagnostic guidance, quit-smoking/"
                "drinking support, and wellness advice.\n"
                "4. ALWAYS advise consulting a professional healthcare provider "
                "for any health complaints.\n"
                "5. Keep the response formatted in clean, easy-to-read Markdown "
                "bullet points.\n"
                "6. If symptoms sound serious (chest pain, blood, severe "
                "breathing difficulty), urge IMMEDIATE emergency care.\n"
                "7. Never prescribe medication. Only suggest general wellness tips."
            )

            response = model.generate_content([system_prompt, message])
            reply = response.text

            # Ensure disclaimer is always included
            if "disclaimer" not in reply.lower():
                reply += MEDICAL_DISCLAIMER

        except Exception as e:
            print(f"Gemini API Error: {e}. Falling back to rule-based response.")
            reply = _get_offline_response(message, symptom_class, recommendation_msg)
    else:
        print("GEMINI_API_KEY not set. Running in offline/fallback mode.")
        reply = _get_offline_response(message, symptom_class, recommendation_msg)

    return ChatResponse(reply=reply)


def _get_offline_response(message: str, symptom_class: str, recommendation_msg: str) -> str:
    """Generate a rule-based response when Gemini API is unavailable."""
    msg_lower = message.lower()

    reply = f"**SYMPTOM CLASSIFICATION:** {symptom_class.upper()}\n\n"
    reply += f"**Recommended Action:** {recommendation_msg}\n\n"

    if "cough" in msg_lower:
        reply += (
            "**Information on Coughing:**\n"
            "- A persistent cough can be caused by bronchial irritation "
            "due to smoking or exposure to toxins.\n"
            "- To ease a minor cough, stay well-hydrated, use warm liquids, "
            "and avoid tobacco smoke exposure.\n"
            "- If the cough is accompanied by blood, shortness of breath, "
            "or lasts more than 3 weeks, consult a doctor immediately."
        )
    elif "chest pain" in msg_lower:
        reply += (
            "**Information on Chest Pain:**\n"
            "- Chest pain is a serious symptom that can indicate cardiac strain, "
            "lung inflammation, or other critical issues.\n"
            "- Avoid any physical activity immediately and seek medical evaluation "
            "to rule out heart attack or acute pulmonary conditions."
        )
    elif "smoking" in msg_lower or "cigarette" in msg_lower:
        reply += (
            "**Smoking Cessation Guidance:**\n"
            "- Quitting smoking is the single best action to improve lung health.\n"
            "- Within 20 minutes, your heart rate drops. Within 2-12 weeks, "
            "lung function increases.\n"
            "- Consider nicotine replacement therapy (NRT) or consulting a "
            "quit-line support program."
        )
    elif "alcohol" in msg_lower or "liver" in msg_lower:
        reply += (
            "**Alcohol and Liver Health Guidance:**\n"
            "- The liver is highly resilient but chronic alcohol intake leads to "
            "fatty liver disease, hepatitis, and cirrhosis.\n"
            "- Reducing or eliminating alcohol allows the liver to regenerate "
            "and reduces system-wide inflammation.\n"
            "- Try setting limits, replacing alcoholic beverages with sparkling "
            "water, and seeking counseling if needed."
        )
    else:
        reply += (
            "**General Health Recommendations:**\n"
            "- Focus on deep breathing exercises, cardiovascular workouts, "
            "and hydration to support lung capacity.\n"
            "- Eat a diet rich in antioxidants (leafy greens, berries) to "
            "combat oxidative stress from past smoking/alcohol habits.\n"
            "- Let me know if you have specific symptoms (like cough or "
            "breathlessness) so I can help categorize them."
        )

    reply += MEDICAL_DISCLAIMER
    return reply