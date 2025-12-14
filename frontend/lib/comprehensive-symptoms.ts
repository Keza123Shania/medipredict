// Comprehensive symptom list (132 symptoms) organized by category
// Migrated from MediPredict Razor Pages application

export interface ComprehensiveSymptom {
  id: string
  name: string
  icon: string
  category: string
}

export interface ComprehensiveSymptomCategory {
  id: string
  name: string
  icon: string
  color: string
  symptoms: ComprehensiveSymptom[]
}

export const comprehensiveSymptomCategories: ComprehensiveSymptomCategory[] = [
  {
    id: "skin",
    name: "Skin & Dermatological",
    icon: "hand-sparkles",
    color: "from-pink-400 to-red-500",
    symptoms: [
      { id: "itching", name: "Itching", icon: "🎯", category: "skin" },
      { id: "skin_rash", name: "Skin Rash", icon: "🔴", category: "skin" },
      { id: "nodal_skin_eruptions", name: "Nodal Skin Eruptions", icon: "💢", category: "skin" },
      { id: "yellowish_skin", name: "Yellowish Skin", icon: "🟡", category: "skin" },
      { id: "red_spots_over_body", name: "Red Spots Over Body", icon: "🔴", category: "skin" },
      { id: "dischromic_patches", name: "Dischromic Patches", icon: "🎨", category: "skin" },
      { id: "pus_filled_pimples", name: "Pus Filled Pimples", icon: "⚪", category: "skin" },
      { id: "blackheads", name: "Blackheads", icon: "⚫", category: "skin" },
      { id: "scurring", name: "Scurring", icon: "🔀", category: "skin" },
      { id: "skin_peeling", name: "Skin Peeling", icon: "📄", category: "skin" },
      { id: "silver_like_dusting", name: "Silver Like Dusting", icon: "✨", category: "skin" },
      { id: "blister", name: "Blister", icon: "💧", category: "skin" },
      { id: "red_sore_around_nose", name: "Red Sore Around Nose", icon: "👃", category: "skin" },
      { id: "yellow_crust_ooze", name: "Yellow Crust Ooze", icon: "🟡", category: "skin" },
      { id: "brittle_nails", name: "Brittle Nails", icon: "💅", category: "skin" },
      { id: "small_dents_in_nails", name: "Small Dents In Nails", icon: "🔽", category: "skin" },
      { id: "inflammatory_nails", name: "Inflammatory Nails", icon: "🔥", category: "skin" },
      { id: "puffy_face_and_eyes", name: "Puffy Face And Eyes", icon: "😶", category: "skin" },
      { id: "bruising", name: "Bruising", icon: "🟣", category: "skin" },
    ],
  },
  {
    id: "respiratory",
    name: "Respiratory & ENT",
    icon: "lungs",
    color: "from-blue-400 to-cyan-500",
    symptoms: [
      { id: "continuous_sneezing", name: "Continuous Sneezing", icon: "🤧", category: "respiratory" },
      { id: "cough", name: "Cough", icon: "😷", category: "respiratory" },
      { id: "breathlessness", name: "Breathlessness", icon: "😮‍💨", category: "respiratory" },
      { id: "phlegm", name: "Phlegm", icon: "🫁", category: "respiratory" },
      { id: "throat_irritation", name: "Throat Irritation", icon: "🗣️", category: "respiratory" },
      { id: "sinus_pressure", name: "Sinus Pressure", icon: "💨", category: "respiratory" },
      { id: "runny_nose", name: "Runny Nose", icon: "👃", category: "respiratory" },
      { id: "congestion", name: "Congestion", icon: "🤧", category: "respiratory" },
      { id: "patches_in_throat", name: "Patches In Throat", icon: "👄", category: "respiratory" },
      { id: "mucoid_sputum", name: "Mucoid Sputum", icon: "💧", category: "respiratory" },
      { id: "rusty_sputum", name: "Rusty Sputum", icon: "🦠", category: "respiratory" },
      { id: "blood_in_sputum", name: "Blood In Sputum", icon: "🩸", category: "respiratory" },
    ],
  },
  {
    id: "digestive",
    name: "Digestive & Gastrointestinal",
    icon: "stomach",
    color: "from-green-400 to-emerald-500",
    symptoms: [
      { id: "stomach_pain", name: "Stomach Pain", icon: "🔴", category: "digestive" },
      { id: "acidity", name: "Acidity", icon: "🔥", category: "digestive" },
      { id: "ulcers_on_tongue", name: "Ulcers On Tongue", icon: "👅", category: "digestive" },
      { id: "vomiting", name: "Vomiting", icon: "🤮", category: "digestive" },
      { id: "burning_micturition", name: "Burning Micturition", icon: "🔥", category: "digestive" },
      { id: "constipation", name: "Constipation", icon: "🚽", category: "digestive" },
      { id: "abdominal_pain", name: "Abdominal Pain", icon: "😣", category: "digestive" },
      { id: "diarrhoea", name: "Diarrhoea", icon: "💩", category: "digestive" },
      { id: "indigestion", name: "Indigestion", icon: "🍽️", category: "digestive" },
      { id: "passage_of_gases", name: "Passage Of Gases", icon: "💨", category: "digestive" },
      { id: "internal_itching", name: "Internal Itching", icon: "🔥", category: "digestive" },
      { id: "stomach_bleeding", name: "Stomach Bleeding", icon: "🩸", category: "digestive" },
      { id: "distention_of_abdomen", name: "Distention Of Abdomen", icon: "🫃", category: "digestive" },
      { id: "pain_during_bowel_movements", name: "Pain During Bowel Movements", icon: "😖", category: "digestive" },
      { id: "pain_in_anal_region", name: "Pain In Anal Region", icon: "🔴", category: "digestive" },
      { id: "bloody_stool", name: "Bloody Stool", icon: "🩸", category: "digestive" },
      { id: "irritation_in_anus", name: "Irritation In Anus", icon: "🔥", category: "digestive" },
      { id: "belly_pain", name: "Belly Pain", icon: "😣", category: "digestive" },
    ],
  },
  {
    id: "systemic",
    name: "Systemic & General",
    icon: "activity",
    color: "from-pink-400 to-yellow-400",
    symptoms: [
      { id: "chills", name: "Chills", icon: "🥶", category: "systemic" },
      { id: "high_fever", name: "High Fever", icon: "🌡️", category: "systemic" },
      { id: "shivering", name: "Shivering", icon: "🥶", category: "systemic" },
      { id: "sweating", name: "Sweating", icon: "💦", category: "systemic" },
      { id: "dehydration", name: "Dehydration", icon: "🏜️", category: "systemic" },
      { id: "fatigue", name: "Fatigue", icon: "😴", category: "systemic" },
      { id: "malaise", name: "Malaise", icon: "😞", category: "systemic" },
      { id: "fast_heart_rate", name: "Fast Heart Rate", icon: "💗", category: "systemic" },
      { id: "mild_fever", name: "Mild Fever", icon: "🌡️", category: "systemic" },
      { id: "continuous_feel_of_urine", name: "Continuous Feel Of Urine", icon: "🚽", category: "systemic" },
      { id: "polyuria", name: "Polyuria", icon: "💧", category: "systemic" },
      { id: "irregular_sugar_level", name: "Irregular Sugar Level", icon: "🍭", category: "systemic" },
      { id: "increased_appetite", name: "Increased Appetite", icon: "🍽️", category: "systemic" },
      { id: "lack_of_concentration", name: "Lack Of Concentration", icon: "🤔", category: "systemic" },
      { id: "excessive_hunger", name: "Excessive Hunger", icon: "🍕", category: "systemic" },
      { id: "fluid_overload", name: "Fluid Overload", icon: "💧", category: "systemic" },
    ],
  },
  {
    id: "musculoskeletal",
    name: "Musculoskeletal",
    icon: "bone",
    color: "from-cyan-300 to-pink-300",
    symptoms: [
      { id: "joint_pain", name: "Joint Pain", icon: "🦴", category: "musculoskeletal" },
      { id: "muscle_wasting", name: "Muscle Wasting", icon: "💪", category: "musculoskeletal" },
      { id: "muscle_weakness", name: "Muscle Weakness", icon: "💪", category: "musculoskeletal" },
      { id: "stiff_neck", name: "Stiff Neck", icon: "🦴", category: "musculoskeletal" },
      { id: "swelling_joints", name: "Swelling Joints", icon: "🦴", category: "musculoskeletal" },
      { id: "movement_stiffness", name: "Movement Stiffness", icon: "🦴", category: "musculoskeletal" },
      { id: "painful_walking", name: "Painful Walking", icon: "🚶", category: "musculoskeletal" },
      { id: "knee_pain", name: "Knee Pain", icon: "🦵", category: "musculoskeletal" },
      { id: "hip_joint_pain", name: "Hip Joint Pain", icon: "🦴", category: "musculoskeletal" },
      { id: "muscle_pain", name: "Muscle Pain", icon: "💪", category: "musculoskeletal" },
      { id: "back_pain", name: "Back Pain", icon: "🧍", category: "musculoskeletal" },
      { id: "neck_pain", name: "Neck Pain", icon: "🦴", category: "musculoskeletal" },
    ],
  },
  {
    id: "neurological",
    name: "Neurological",
    icon: "brain",
    color: "from-purple-300 to-yellow-200",
    symptoms: [
      { id: "headache", name: "Headache", icon: "🤕", category: "neurological" },
      { id: "dizziness", name: "Dizziness", icon: "😵", category: "neurological" },
      { id: "loss_of_balance", name: "Loss Of Balance", icon: "🤸", category: "neurological" },
      { id: "altered_sensorium", name: "Altered Sensorium", icon: "🧠", category: "neurological" },
      { id: "spinning_movements", name: "Spinning Movements", icon: "🌀", category: "neurological" },
      { id: "unsteadiness", name: "Unsteadiness", icon: "⚖️", category: "neurological" },
      { id: "loss_of_smell", name: "Loss Of Smell", icon: "👃", category: "neurological" },
      { id: "anxiety", name: "Anxiety", icon: "😰", category: "neurological" },
      { id: "depression", name: "Depression", icon: "😔", category: "neurological" },
      { id: "irritability", name: "Irritability", icon: "😠", category: "neurological" },
      { id: "mood_swings", name: "Mood Swings", icon: "🎭", category: "neurological" },
      { id: "restlessness", name: "Restlessness", icon: "😫", category: "neurological" },
      { id: "lethargy", name: "Lethargy", icon: "😴", category: "neurological" },
      { id: "coma", name: "Coma", icon: "😵", category: "neurological" },
      { id: "slurred_speech", name: "Slurred Speech", icon: "🗣️", category: "neurological" },
    ],
  },
  {
    id: "cardiovascular",
    name: "Cardiovascular",
    icon: "heart-pulse",
    color: "from-red-400 to-pink-500",
    symptoms: [
      { id: "chest_pain", name: "Chest Pain", icon: "💔", category: "cardiovascular" },
      { id: "palpitations", name: "Palpitations", icon: "💓", category: "cardiovascular" },
      { id: "swelling_of_stomach", name: "Swelling Of Stomach", icon: "🫃", category: "cardiovascular" },
      { id: "swelled_lymph_nodes", name: "Swelled Lymph Nodes", icon: "🔴", category: "cardiovascular" },
      { id: "prominent_veins_on_calf", name: "Prominent Veins On Calf", icon: "🦵", category: "cardiovascular" },
      { id: "puffy_face_and_eyes", name: "Puffy Face And Eyes", icon: "😶", category: "cardiovascular" },
      { id: "enlarged_thyroid", name: "Enlarged Thyroid", icon: "🦴", category: "cardiovascular" },
      { id: "swollen_extremeties", name: "Swollen Extremeties", icon: "🦵", category: "cardiovascular" },
      { id: "swollen_blood_vessels", name: "Swollen Blood Vessels", icon: "🩸", category: "cardiovascular" },
    ],
  },
  {
    id: "urinary",
    name: "Urinary & Renal",
    icon: "droplet",
    color: "from-blue-300 to-indigo-400",
    symptoms: [
      { id: "bladder_discomfort", name: "Bladder Discomfort", icon: "🚽", category: "urinary" },
      { id: "foul_smell_of_urine", name: "Foul Smell Of Urine", icon: "🚽", category: "urinary" },
      { id: "dark_urine", name: "Dark Urine", icon: "🟤", category: "urinary" },
      { id: "yellow_urine", name: "Yellow Urine", icon: "🟡", category: "urinary" },
    ],
  },
  {
    id: "visual",
    name: "Visual & Ocular",
    icon: "eye",
    color: "from-sky-400 to-blue-500",
    symptoms: [
      { id: "blurred_and_distorted_vision", name: "Blurred And Distorted Vision", icon: "👁️", category: "visual" },
      { id: "visual_disturbances", name: "Visual Disturbances", icon: "👁️", category: "visual" },
      { id: "yellowing_of_eyes", name: "Yellowing Of Eyes", icon: "👁️", category: "visual" },
      { id: "watering_from_eyes", name: "Watering From Eyes", icon: "😢", category: "visual" },
      { id: "sunken_eyes", name: "Sunken Eyes", icon: "👁️", category: "visual" },
      { id: "red_spots_over_body", name: "Red Spots Over Body", icon: "🔴", category: "visual" },
    ],
  },
  {
    id: "weight",
    name: "Weight & Metabolism",
    icon: "scale",
    color: "from-green-300 to-lime-400",
    symptoms: [
      { id: "weight_loss", name: "Weight Loss", icon: "📉", category: "weight" },
      { id: "weight_gain", name: "Weight Gain", icon: "📈", category: "weight" },
      { id: "loss_of_appetite", name: "Loss Of Appetite", icon: "🍽️", category: "weight" },
      { id: "obesity", name: "Obesity", icon: "⚖️", category: "weight" },
    ],
  },
  {
    id: "liver",
    name: "Liver & Hepatic",
    icon: "activity",
    color: "from-yellow-300 to-orange-400",
    symptoms: [
      { id: "family_history", name: "Family History", icon: "👨‍👩‍👧‍👦", category: "liver" },
      { id: "receiving_blood_transfusion", name: "Receiving Blood Transfusion", icon: "🩸", category: "liver" },
      { id: "receiving_unsterile_injections", name: "Receiving Unsterile Injections", icon: "💉", category: "liver" },
      { id: "acute_liver_failure", name: "Acute Liver Failure", icon: "🫀", category: "liver" },
      { id: "swelling_of_stomach", name: "Swelling Of Stomach", icon: "🫃", category: "liver" },
      { id: "history_of_alcohol_consumption", name: "History Of Alcohol Consumption", icon: "🍺", category: "liver" },
    ],
  },
]

// Helper function to get all symptoms as a flat list
export function getAllSymptoms(): ComprehensiveSymptom[] {
  return comprehensiveSymptomCategories.flatMap((category) => category.symptoms)
}

// Helper function to get symptom by ID
export function getSymptomById(id: string): ComprehensiveSymptom | undefined {
  return getAllSymptoms().find((symptom) => symptom.id === id)
}

// Helper function to get category by ID
export function getCategoryById(id: string): ComprehensiveSymptomCategory | undefined {
  return comprehensiveSymptomCategories.find((category) => category.id === id)
}
