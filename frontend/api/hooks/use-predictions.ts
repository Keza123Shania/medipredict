import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { predictionService } from "@/services"
import type { PredictionRequest } from "@/types/backend-types"
import { getCurrentUserId } from "@/services/config"

export function usePredictions() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: ["predictions", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated")
      return predictionService.getPredictionHistory(userId)
    },
    enabled: !!userId,
  })
}

export function usePrediction(id: string) {
  return useQuery({
    queryKey: ["prediction", id],
    queryFn: () => predictionService.getPrediction(id),
    enabled: !!id,
  })
}

export function useCreatePrediction() {
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  return useMutation({
    mutationFn: (symptoms: string[]) => {
      if (!userId) throw new Error("User not authenticated")
      const request: PredictionRequest = {
        UserId: userId,
        Symptoms: symptoms,
      }
      return predictionService.createPrediction(request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] })
    },
  })
}
