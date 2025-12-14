"use client"

import useSWR from "swr"
import { apiClient } from "@/api/client"
import { useCallback } from "react"

const fetcher = (url: string) => apiClient.get(url)

export function useConsultations(params?: { status?: string; doctorId?: string; patientId?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set("status", params.status)
  if (params?.doctorId) searchParams.set("doctorId", params.doctorId)
  if (params?.patientId) searchParams.set("patientId", params.patientId)

  const queryString = searchParams.toString()
  const url = `/consultations${queryString ? `?${queryString}` : ""}`

  const { data, error, isLoading, mutate } = useSWR(url, fetcher)

  const submitReview = useCallback(
    async (
      consultationId: string,
      review: {
        feedback: string
        aiAccuracy: "accurate" | "partially_accurate" | "inaccurate"
        correctedDiagnosis?: string
        recommendations?: string[]
      },
    ) => {
      const updated = await apiClient.patch(`/consultations/${consultationId}/review`, review)
      mutate()
      return updated
    },
    [mutate],
  )

  return {
    consultations: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
    submitReview,
  }
}

export function useConsultation(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/consultations/${id}` : null, fetcher)

  return {
    consultation: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
