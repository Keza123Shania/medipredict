"use client"

import useSWR from "swr"
import { apiClient } from "@/api/client"
import type { Prediction, SymptomInput } from "@/types"
import { useCallback, useState } from "react"

const fetcher = (url: string) => apiClient.get(url)

export function usePredictions(patientId?: string) {
  const url = patientId ? `/predictions?patientId=${patientId}` : "/predictions"

  const { data, error, isLoading, mutate } = useSWR<Prediction[]>(url, fetcher)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const createPrediction = useCallback(
    async (symptoms: SymptomInput) => {
      setIsSubmitting(true)
      try {
        const prediction = await apiClient.post<Prediction>("/predictions", symptoms)
        mutate()
        return prediction
      } finally {
        setIsSubmitting(false)
      }
    },
    [mutate],
  )

  return {
    predictions: data || [],
    isLoading,
    isSubmitting,
    isError: !!error,
    error,
    mutate,
    createPrediction,
  }
}

export function usePrediction(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Prediction>(id ? `/predictions/${id}` : null, fetcher)

  return {
    prediction: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
