"""
Disease Prediction FastAPI Service
Integrates trained MultinomialNB model with MediPredict ASP.NET application
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import warnings
from typing import List, Dict, Any
import os

warnings.filterwarnings('ignore')

app = FastAPI(title="MediPredict ML Service", version="1.0.0")

# Enable CORS for ASP.NET application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your ASP.NET URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'Models', 'trained_model')
model = None

# 132 symptoms in exact order expected by model
SYMPTOMS_LIST = [
    'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing',
    'shivering', 'chills', 'joint_pain', 'stomach_pain', 'acidity',
    'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 'burning_micturition',
    'spotting_ urination', 'fatigue', 'weight_gain', 'anxiety',
    'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness',
    'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough',
    'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration',
    'indigestion', 'headache', 'yellowish_skin', 'dark_urine', 'nausea',
    'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'constipation',
    'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine',
    'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload',
    'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise',
    'blurred_and_distorted_vision', 'phlegm', 'throat_irritation',
    'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion',
    'chest_pain', 'weakness_in_limbs', 'fast_heart_rate',
    'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool',
    'irritation_in_anus', 'neck_pain', 'dizziness', 'cramps', 'bruising',
    'obesity', 'swollen_legs', 'swollen_blood_vessels', 'puffy_face_and_eyes',
    'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties',
    'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips',
    'slurred_speech', 'knee_pain', 'hip_joint_pain', 'muscle_weakness',
    'stiff_neck', 'swelling_joints', 'movement_stiffness',
    'spinning_movements', 'loss_of_balance', 'unsteadiness',
    'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort',
    'foul_smell_of urine', 'continuous_feel_of_urine', 'passage_of_gases',
    'internal_itching', 'toxic_look_(typhos)', 'depression', 'irritability',
    'muscle_pain', 'altered_sensorium', 'red_spots_over_body', 'belly_pain',
    'abnormal_menstruation', 'dischromic _patches', 'watering_from_eyes',
    'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum',
    'rusty_sputum', 'lack_of_concentration', 'visual_disturbances',
    'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma',
    'stomach_bleeding', 'distention_of_abdomen',
    'history_of_alcohol_consumption', 'fluid_overload', 'blood_in_sputum',
    'prominent_veins_on_calf', 'palpitations', 'painful_walking',
    'pus_filled_pimples', 'blackheads', 'scurring', 'skin_peeling',
    'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails',
    'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
]


@app.on_event("startup")
async def load_model():
    """Load the trained model on startup"""
    global model
    try:
        model = joblib.load(MODEL_PATH)
        print(f"✓ Model loaded successfully: {type(model).__name__}")
        print(f"✓ Model expects {len(SYMPTOMS_LIST)} symptoms")
        print(f"✓ Model can predict {len(model.classes_)} diseases")
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        raise


class PredictionRequest(BaseModel):
    """Request model for prediction endpoint"""
    symptoms: List[str]  # List of symptom names (e.g., ['itching', 'skin_rash'])


class DiseasePrediction(BaseModel):
    """Individual disease prediction"""
    disease: str
    probability: float


class PredictionResponse(BaseModel):
    """Response model for prediction results"""
    success: bool
    predicted_disease: str
    confidence: float
    top_predictions: List[DiseasePrediction]


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "MediPredict ML Prediction Service",
        "status": "running",
        "model_loaded": model is not None,
        "symptoms_count": len(SYMPTOMS_LIST),
        "diseases_count": len(model.classes_) if model else 0
    }


@app.get("/symptoms")
async def get_symptoms():
    """Get all available symptoms the model can process"""
    return {
        "symptoms": SYMPTOMS_LIST,
        "count": len(SYMPTOMS_LIST)
    }


@app.get("/diseases")
async def get_diseases():
    """Get all diseases the model can predict"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    return {
        "diseases": model.classes_.tolist(),
        "count": len(model.classes_)
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict_disease(request: PredictionRequest):
    """
    Predict disease based on symptoms
    
    Args:
        request: PredictionRequest containing list of symptom names
        
    Returns:
        PredictionResponse with predicted disease and confidence scores
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    if not request.symptoms:
        raise HTTPException(status_code=400, detail="No symptoms provided")
    
    try:
        print(f"\\n[DEBUG] Received symptoms: {request.symptoms}")
        
        # Create symptom vector (all zeros initially)
        symptoms_vector = [0] * 132
        
        # Mark present symptoms as 1
        matched_symptoms = 0
        unmatched_symptoms = []
        
        for symptom in request.symptoms:
            symptom_lower = symptom.lower().strip()
            print(f"[DEBUG] Processing symptom: '{symptom_lower}'")
            if symptom_lower in SYMPTOMS_LIST:
                index = SYMPTOMS_LIST.index(symptom_lower)
                symptoms_vector[index] = 1
                matched_symptoms += 1
                print(f"[DEBUG] Matched at index {index}")
            else:
                unmatched_symptoms.append(symptom)
                print(f"[DEBUG] No match for: '{symptom_lower}'")
        
        print(f"[DEBUG] Matched {matched_symptoms}/{len(request.symptoms)} symptoms")
        print(f"[DEBUG] Unmatched symptoms: {unmatched_symptoms}")
        
        if matched_symptoms == 0:
            raise HTTPException(
                status_code=400, 
                detail=f"No valid symptoms matched. Invalid symptoms: {unmatched_symptoms}"
            )
        
        # Convert to 2D array for model
        input_data = np.array([symptoms_vector])
        print(f"[DEBUG] Input data shape: {input_data.shape}")
        print(f"[DEBUG] Input data: {input_data}")
        
        # Get prediction
        print("[DEBUG] Making prediction...")
        predicted_disease = model.predict(input_data)[0]
        print(f"[DEBUG] Predicted disease: {predicted_disease}")
        
        # Get probability scores
        print("[DEBUG] Getting probabilities...")
        probabilities = model.predict_proba(input_data)[0]
        print(f"[DEBUG] Probabilities shape: {len(probabilities)}")
        confidence = float(probabilities.max() * 100)
        
        # Get top 5 predictions
        top5_indices = probabilities.argsort()[-5:][::-1]
        print(f"[DEBUG] Top 5 indices: {top5_indices}")
        top_predictions = [
            {
                "disease": str(model.classes_[idx]),  # Convert numpy string to Python string
                "probability": float(probabilities[idx] * 100)
            }
            for idx in top5_indices
        ]
        print(f"[DEBUG] Top predictions: {top_predictions}")
        
        response = PredictionResponse(
            success=True,
            predicted_disease=str(predicted_disease),  # Convert numpy string to Python string
            confidence=confidence,
            top_predictions=top_predictions
        )
        print(f"[DEBUG] Returning response")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Exception during prediction: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
