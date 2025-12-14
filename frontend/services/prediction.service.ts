/**
 * Prediction Service
 * Handles AI symptom analysis and predictions
 * Supports both mock data and real API calls
 */

import type {
  ApiResponse,
  PredictionRequest,
  PredictionResultViewModel,
  PredictionHistoryItemViewModel,
} from "@/types/backend-types"
import { SERVICE_CONFIG, delay, mockApiResponse } from "./config"
import { mockPredictions } from "./mock-data"
import { apiClient } from "@/api/client"

class PredictionService {
  private baseUrl = `${SERVICE_CONFIG.apiBaseUrl}/api/Predictions`

  /**
   * Create new prediction from symptoms
   */
  async createPrediction(data: PredictionRequest): Promise<ApiResponse<PredictionResultViewModel>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay * 2) // Longer delay to simulate AI processing

      // Return mock prediction with the submitted symptoms
      const mockPrediction: PredictionResultViewModel = {
        id: Date.now(),
        predictionId: `pred-${Date.now()}`,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        primaryDisease: "Common Cold",
        predictedDisease: "Common Cold",
        primaryConfidence: 72.3,
        confidenceScore: 72.3,
        symptomsCount: data.symptoms.length,
        urgencyLevel: "Low",
        allProbabilities: [
          { diseaseName: "Common Cold", probability: 72.3 },
          { diseaseName: "Influenza", probability: 15.2 },
          { diseaseName: "Allergic Rhinitis", probability: 8.5 },
          { diseaseName: "Sinusitis", probability: 4.0 },
        ],
        probabilityBreakdown: [
          { diseaseName: "Common Cold", probability: 72.3 },
          { diseaseName: "Influenza", probability: 15.2 },
          { diseaseName: "Allergic Rhinitis", probability: 8.5 },
          { diseaseName: "Sinusitis", probability: 4.0 },
        ],
        inputSummary: {
          age: 30,
          sex: 1,
          chestPainType: 0,
          restingBloodPressure: 120,
          serumCholesterol: 200,
          fastingBloodSugar: 0,
          restingECG: 0,
          maxHeartRate: 150,
          exerciseInducedAngina: 0,
          stDepression: 0,
          slopeOfPeakExercise: 1,
          numberOfMajorVessels: 0,
          thalassemia: 2,
          cough: 1,
          shortnessOfBreath: 0,
          wheezing: 0,
          fever: 1,
          fatigue: 1,
          headache: 1,
          nauseaVomiting: 0,
          abdominalPain: 0,
          diarrhea: 0,
          lossOfAppetite: 0,
          submittedAt: new Date().toISOString(),
        },
        recommendations: [
          "Get adequate rest and stay hydrated",
          "Use over-the-counter medications for symptom relief",
          "If symptoms worsen or persist beyond 7-10 days, consult a doctor",
          "Practice good hand hygiene to prevent spread",
        ],
        disclaimerMessage:
          "This AI prediction is for informational purposes only and should not replace professional medical advice.",
        disclaimer:
          "This AI prediction is for informational purposes only and should not replace professional medical advice.",
      }

      return mockApiResponse(mockPrediction, "Prediction generated successfully")
    }

    // Real API call using apiClient to include credentials/session cookies
    return apiClient.post<ApiResponse<PredictionResultViewModel>>("/api/Predictions", data)
  }

  /**
   * Get prediction by ID
   */
  async getPrediction(entryId: string): Promise<ApiResponse<PredictionResultViewModel>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const prediction = mockPredictions.find((p) => p.predictionId === entryId || p.id?.toString() === entryId)
      if (!prediction) {
        throw new Error("Prediction not found")
      }

      return mockApiResponse(prediction, "Prediction retrieved successfully")
    }

    // Real API call using apiClient
    return apiClient.get<ApiResponse<PredictionResultViewModel>>(`/api/Predictions/${entryId}`)
  }

  /**
   * Get prediction history for a user
   */
  async getPredictionHistory(userId: string): Promise<ApiResponse<PredictionHistoryItemViewModel[]>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const history: PredictionHistoryItemViewModel[] = mockPredictions.map((p) => ({
        predictionId: p.predictionId,
        date: p.timestamp,
        primarySymptoms: "Various symptoms",
        predictedCondition: p.primaryDisease,
        confidenceScore: p.primaryConfidence,
        urgencyLevel: p.urgencyLevel,
      }))

      return mockApiResponse(history, "Prediction history retrieved successfully")
    }

    // Real API call using apiClient
    return apiClient.get<ApiResponse<PredictionHistoryItemViewModel[]>>(`/api/Predictions/history/${userId}`)
  }
}

export const predictionService = new PredictionService()
