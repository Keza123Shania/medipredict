export interface Symptom {
  id: string
  name: string
  category: string
  description?: string
  severity?: "mild" | "moderate" | "severe"
  duration?: string
  frequency?: string
}

export interface SymptomCategory {
  id: string
  name: string
  icon: string
  symptoms: Symptom[]
}

export interface PredictionInput {
  symptoms: string[]
  age: number
  gender: "male" | "female" | "other"
  medicalHistory?: string[]
  currentMedications?: string[]
  lifestyle?: {
    smoking: boolean
    alcohol: boolean
    exercise: "none" | "light" | "moderate" | "heavy"
  }
  additionalNotes?: string
}

export interface PredictionResult {
  id: string
  userId: string
  createdAt: string
  input: PredictionInput
  conditions: PredictedCondition[]
  overallUrgency: "low" | "medium" | "high" | "critical"
  recommendations: string[]
  suggestedSpecializations: string[]
  // Backend response properties
  primaryDisease?: string
  confidence?: number
  urgencyLevel?: string
  allProbabilities?: Array<{
    diseaseName: string
    probability: number
    description: string
  }>
  disclaimer?: string
}

export interface PredictedCondition {
  name: string
  probability: number
  description: string
  urgency: "low" | "medium" | "high" | "critical"
  commonTreatments: string[]
  whenToSeekHelp: string[]
}
