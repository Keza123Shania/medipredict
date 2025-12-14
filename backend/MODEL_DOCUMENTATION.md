# Disease Prediction Model - Complete Documentation

## Model Overview
- **Model Type**: Multinomial Naive Bayes (`MultinomialNB`)
- **Library**: scikit-learn v0.21.3
- **Framework**: Joblib (for model serialization)
- **File**: `trained_model`

---

## 1. INPUT FORMAT

### Number of Features
**132 symptoms/features** (input vector length = 132)

### Input Type
**Binary input**: 
- `0` = symptom absent
- `1` = symptom present

### Input Shape
- 2D array: `[[feature1, feature2, ..., feature132]]`
- Example: `[[0, 1, 0, 0, 1, 1, 0, ..., 0]]` (132 values)

---

## 2. SYMPTOM NAMES (In Exact Order - Index 0 to 131)

The model expects symptoms in this **EXACT ORDER**:

```python
symptomslist = [
    'itching',                          # Index 0
    'skin_rash',                        # Index 1
    'nodal_skin_eruptions',             # Index 2
    'continuous_sneezing',              # Index 3
    'shivering',                        # Index 4
    'chills',                           # Index 5
    'joint_pain',                       # Index 6
    'stomach_pain',                     # Index 7
    'acidity',                          # Index 8
    'ulcers_on_tongue',                 # Index 9
    'muscle_wasting',                   # Index 10
    'vomiting',                         # Index 11
    'burning_micturition',              # Index 12
    'spotting_ urination',              # Index 13
    'fatigue',                          # Index 14
    'weight_gain',                      # Index 15
    'anxiety',                          # Index 16
    'cold_hands_and_feets',             # Index 17
    'mood_swings',                      # Index 18
    'weight_loss',                      # Index 19
    'restlessness',                     # Index 20
    'lethargy',                         # Index 21
    'patches_in_throat',                # Index 22
    'irregular_sugar_level',            # Index 23
    'cough',                            # Index 24
    'high_fever',                       # Index 25
    'sunken_eyes',                      # Index 26
    'breathlessness',                   # Index 27
    'sweating',                         # Index 28
    'dehydration',                      # Index 29
    'indigestion',                      # Index 30
    'headache',                         # Index 31
    'yellowish_skin',                   # Index 32
    'dark_urine',                       # Index 33
    'nausea',                           # Index 34
    'loss_of_appetite',                 # Index 35
    'pain_behind_the_eyes',             # Index 36
    'back_pain',                        # Index 37
    'constipation',                     # Index 38
    'abdominal_pain',                   # Index 39
    'diarrhoea',                        # Index 40
    'mild_fever',                       # Index 41
    'yellow_urine',                     # Index 42
    'yellowing_of_eyes',                # Index 43
    'acute_liver_failure',              # Index 44
    'fluid_overload',                   # Index 45
    'swelling_of_stomach',              # Index 46
    'swelled_lymph_nodes',              # Index 47
    'malaise',                          # Index 48
    'blurred_and_distorted_vision',     # Index 49
    'phlegm',                           # Index 50
    'throat_irritation',                # Index 51
    'redness_of_eyes',                  # Index 52
    'sinus_pressure',                   # Index 53
    'runny_nose',                       # Index 54
    'congestion',                       # Index 55
    'chest_pain',                       # Index 56
    'weakness_in_limbs',                # Index 57
    'fast_heart_rate',                  # Index 58
    'pain_during_bowel_movements',      # Index 59
    'pain_in_anal_region',              # Index 60
    'bloody_stool',                     # Index 61
    'irritation_in_anus',               # Index 62
    'neck_pain',                        # Index 63
    'dizziness',                        # Index 64
    'cramps',                           # Index 65
    'bruising',                         # Index 66
    'obesity',                          # Index 67
    'swollen_legs',                     # Index 68
    'swollen_blood_vessels',            # Index 69
    'puffy_face_and_eyes',              # Index 70
    'enlarged_thyroid',                 # Index 71
    'brittle_nails',                    # Index 72
    'swollen_extremeties',              # Index 73
    'excessive_hunger',                 # Index 74
    'extra_marital_contacts',           # Index 75
    'drying_and_tingling_lips',         # Index 76
    'slurred_speech',                   # Index 77
    'knee_pain',                        # Index 78
    'hip_joint_pain',                   # Index 79
    'muscle_weakness',                  # Index 80
    'stiff_neck',                       # Index 81
    'swelling_joints',                  # Index 82
    'movement_stiffness',               # Index 83
    'spinning_movements',               # Index 84
    'loss_of_balance',                  # Index 85
    'unsteadiness',                     # Index 86
    'weakness_of_one_body_side',        # Index 87
    'loss_of_smell',                    # Index 88
    'bladder_discomfort',               # Index 89
    'foul_smell_of urine',              # Index 90
    'continuous_feel_of_urine',         # Index 91
    'passage_of_gases',                 # Index 92
    'internal_itching',                 # Index 93
    'toxic_look_(typhos)',              # Index 94
    'depression',                       # Index 95
    'irritability',                     # Index 96
    'muscle_pain',                      # Index 97
    'altered_sensorium',                # Index 98
    'red_spots_over_body',              # Index 99
    'belly_pain',                       # Index 100
    'abnormal_menstruation',            # Index 101
    'dischromic _patches',              # Index 102
    'watering_from_eyes',               # Index 103
    'increased_appetite',               # Index 104
    'polyuria',                         # Index 105
    'family_history',                   # Index 106
    'mucoid_sputum',                    # Index 107
    'rusty_sputum',                     # Index 108
    'lack_of_concentration',            # Index 109
    'visual_disturbances',              # Index 110
    'receiving_blood_transfusion',      # Index 111
    'receiving_unsterile_injections',   # Index 112
    'coma',                             # Index 113
    'stomach_bleeding',                 # Index 114
    'distention_of_abdomen',            # Index 115
    'history_of_alcohol_consumption',   # Index 116
    'fluid_overload',                   # Index 117
    'blood_in_sputum',                  # Index 118
    'prominent_veins_on_calf',          # Index 119
    'palpitations',                     # Index 120
    'painful_walking',                  # Index 121
    'pus_filled_pimples',               # Index 122
    'blackheads',                       # Index 123
    'scurring',                         # Index 124
    'skin_peeling',                     # Index 125
    'silver_like_dusting',              # Index 126
    'small_dents_in_nails',             # Index 127
    'inflammatory_nails',               # Index 128
    'blister',                          # Index 129
    'red_sore_around_nose',             # Index 130
    'yellow_crust_ooze'                 # Index 131
]
```

---

## 3. ALL 41 DISEASE NAMES (In Alphabetical Order - Model Output)

The model returns diseases in this **ALPHABETICAL ORDER**:

```python
model.classes_ = [
    '(vertigo) Paroymsal  Positional Vertigo',  # Class 0
    'AIDS',                                      # Class 1
    'Acne',                                      # Class 2
    'Alcoholic hepatitis',                       # Class 3
    'Allergy',                                   # Class 4
    'Arthritis',                                 # Class 5
    'Bronchial Asthma',                          # Class 6
    'Cervical spondylosis',                      # Class 7
    'Chicken pox',                               # Class 8
    'Chronic cholestasis',                       # Class 9
    'Common Cold',                               # Class 10
    'Dengue',                                    # Class 11
    'Diabetes ',                                 # Class 12
    'Dimorphic hemmorhoids(piles)',              # Class 13
    'Drug Reaction',                             # Class 14
    'Fungal infection',                          # Class 15
    'GERD',                                      # Class 16
    'Gastroenteritis',                           # Class 17
    'Heart attack',                              # Class 18
    'Hepatitis B',                               # Class 19
    'Hepatitis C',                               # Class 20
    'Hepatitis D',                               # Class 21
    'Hepatitis E',                               # Class 22
    'Hypertension ',                             # Class 23
    'Hyperthyroidism',                           # Class 24
    'Hypoglycemia',                              # Class 25
    'Hypothyroidism',                            # Class 26
    'Impetigo',                                  # Class 27
    'Jaundice',                                  # Class 28
    'Malaria',                                   # Class 29
    'Migraine',                                  # Class 30
    'Osteoarthristis',                           # Class 31
    'Paralysis (brain hemorrhage)',              # Class 32
    'Peptic ulcer diseae',                       # Class 33
    'Pneumonia',                                 # Class 34
    'Psoriasis',                                 # Class 35
    'Tuberculosis',                              # Class 36
    'Typhoid',                                   # Class 37
    'Urinary tract infection',                   # Class 38
    'Varicose veins',                            # Class 39
    'hepatitis A'                                # Class 40
]
```

---

## 4. EXAMPLE INPUT/OUTPUT

### Example 1: Fungal Infection Symptoms

**Input Symptoms:**
- itching (index 0)
- skin_rash (index 1)
- nodal_skin_eruptions (index 2)

**Input Array:**
```python
input_vector = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
# Length = 132, with positions 0, 1, 2 set to 1
```

**Model Prediction:**
```python
predicted_disease = "Fungal infection"
confidence_score = 99.1%

# Top 3 predictions with probabilities:
1. Fungal infection: 99.1%
2. Drug Reaction: 0.74%
3. Chicken pox: 0.11%
```

### Example 2: Code Implementation

```python
import joblib
import numpy as np

# Load model
model = joblib.load('trained_model')

# Create symptom vector (all zeros initially)
symptoms_vector = [0] * 132

# Mark present symptoms as 1
# Example: Patient has itching, skin_rash, nodal_skin_eruptions
symptoms_vector[0] = 1  # itching
symptoms_vector[1] = 1  # skin_rash
symptoms_vector[2] = 1  # nodal_skin_eruptions

# Convert to 2D array (model expects batch input)
input_data = np.array([symptoms_vector])

# Get prediction
predicted_disease = model.predict(input_data)[0]
print(f"Predicted Disease: {predicted_disease}")

# Get probability scores for all diseases
probabilities = model.predict_proba(input_data)
confidence = probabilities.max() * 100
print(f"Confidence: {confidence:.2f}%")
```

---

## 5. PREPROCESSING & ENCODING

### 5.1 Input Encoding
✅ **Binary Encoding (0/1)**
- No severity levels
- No numerical values other than 0 and 1
- Simple presence/absence encoding

### 5.2 Feature Transformation
✅ **No transformation required**
- Model accepts raw binary features directly
- No scaling needed
- No normalization required
- No standardization applied

### 5.3 Data Flow in Django Application

```python
# Step 1: User selects symptoms from UI
user_symptoms = ['itching', 'skin_rash', 'nodal_skin_eruptions']

# Step 2: Create zero vector
symptoms_vector = [0] * 132

# Step 3: Match symptoms and set to 1
for i in range(len(symptomslist)):
    if symptomslist[i] in user_symptoms:
        symptoms_vector[i] = 1

# Step 4: Prepare input for model
input_test = [symptoms_vector]  # Wrap in list for batch format

# Step 5: Predict
predicted = model.predict(input_test)
predicted_disease = predicted[0]

# Step 6: Get confidence
probabilities = model.predict_proba(input_test)
confidence_score = probabilities.max() * 100
```

---

## 6. MODEL METHODS AVAILABLE

### 6.1 Prediction Methods

```python
# Main prediction
model.predict(input_data)
# Returns: array with predicted disease name

# Probability prediction
model.predict_proba(input_data)
# Returns: 2D array with probabilities for all 41 diseases

# Log probability
model.predict_log_proba(input_data)
# Returns: Log probabilities

# Joint log probability
model.predict_joint_log_proba(input_data)
# Returns: Joint log likelihood for each class
```

### 6.2 Model Attributes

```python
model.classes_           # Array of 41 disease names
model.class_count_       # Count of samples per class during training
model.feature_count_     # Feature count per class (shape: [41, 132])
model.class_log_prior_   # Log probability of each class
model.feature_log_prob_  # Log probability of features given class
model.alpha              # Smoothing parameter (Laplace smoothing)
```

---

## 7. IMPORTANT NOTES

### ⚠️ Version Compatibility
- Model trained with: **scikit-learn 0.21.3**
- May show warnings with newer versions
- Generally backward compatible but test thoroughly

### ⚠️ Symptom Matching
- Symptom names must **EXACTLY** match the list
- Case-sensitive matching
- Watch for typos (e.g., "spotting_ urination" has a space before underscore)
- "dischromic _patches" has space before underscore
- "foul_smell_of urine" has space before "urine"

### ⚠️ Index Order Critical
- The order of symptoms in the vector is **critical**
- Do not sort or reorder the symptoms list
- Always maintain the original index positions

### ⚠️ Input Shape
- Model expects 2D array: `[[...]]` not `[...]`
- Use `np.array([symptoms_vector])` or `[symptoms_vector]`

---

## 8. DOCTOR CONSULTATION MAPPING

Based on predicted disease, the system recommends specialist:

```python
specialist_mapping = {
    'Rheumatologist': ['Osteoarthristis', 'Arthritis'],
    
    'Cardiologist': ['Heart attack', 'Bronchial Asthma', 'Hypertension '],
    
    'ENT specialist': ['(vertigo) Paroymsal  Positional Vertigo', 'Hypothyroidism'],
    
    'Neurologist': ['Varicose veins', 'Paralysis (brain hemorrhage)', 
                    'Migraine', 'Cervical spondylosis'],
    
    'Allergist/Immunologist': ['Allergy', 'Pneumonia', 'AIDS', 'Common Cold', 
                                'Tuberculosis', 'Malaria', 'Dengue', 'Typhoid'],
    
    'Urologist': ['Urinary tract infection', 'Dimorphic hemmorhoids(piles)'],
    
    'Dermatologist': ['Acne', 'Chicken pox', 'Fungal infection', 
                      'Psoriasis', 'Impetigo'],
    
    'Gastroenterologist': ['Peptic ulcer diseae', 'GERD', 'Chronic cholestasis',
                           'Drug Reaction', 'Gastroenteritis', 'Hepatitis E',
                           'Alcoholic hepatitis', 'Jaundice', 'hepatitis A',
                           'Hepatitis B', 'Hepatitis C', 'Hepatitis D',
                           'Diabetes ', 'Hypoglycemia']
}
```

---

## 9. TESTING THE MODEL

### Quick Test Script

```python
import joblib
import warnings
warnings.filterwarnings('ignore')

# Load model
model = joblib.load('trained_model')

# Test with random symptoms
test_symptoms = [0] * 132
test_symptoms[24] = 1  # cough
test_symptoms[25] = 1  # high_fever
test_symptoms[31] = 1  # headache
test_symptoms[11] = 1  # vomiting

# Predict
prediction = model.predict([test_symptoms])
probabilities = model.predict_proba([test_symptoms])

print(f"Predicted: {prediction[0]}")
print(f"Confidence: {probabilities.max()*100:.2f}%")

# Show top 5 predictions
top5_indices = probabilities[0].argsort()[-5:][::-1]
print("\nTop 5 predictions:")
for idx in top5_indices:
    print(f"  {model.classes_[idx]}: {probabilities[0][idx]*100:.2f}%")
```

---

## 10. DATASET REFERENCE

**Original Dataset:** 
https://www.kaggle.com/neelima98/disease-prediction-using-machine-learning

**Training Details:**
- Algorithm: Multinomial Naive Bayes
- Features: 132 binary symptom features
- Classes: 41 disease categories
- Trained using scikit-learn 0.21.3

---

## Summary

| Aspect | Details |
|--------|---------|
| **Input Size** | 132 features |
| **Input Type** | Binary (0 or 1) |
| **Output** | 1 of 41 disease names |
| **Model Type** | MultinomialNB |
| **Preprocessing** | None required |
| **Scaling** | None required |
| **Critical Requirements** | Exact symptom order, binary encoding, 2D input shape |

