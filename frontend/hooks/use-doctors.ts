"use client"

import useSWR from "swr"
import { apiClient } from "@/api/client"

const fetcher = (url: string) => apiClient.get(url)

export function useDoctors(params?: { specialization?: string; search?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.specialization) searchParams.set("specialization", params.specialization)
  if (params?.search) searchParams.set("search", params.search)

  const queryString = searchParams.toString()
  const url = `/doctors${queryString ? `?${queryString}` : ""}`

  const { data, error, isLoading, mutate } = useSWR(url, fetcher)

  return {
    doctors: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

export function useDoctor(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/doctors/${id}` : null, fetcher)

  return {
    doctor: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

export function useDoctorSlots(doctorId: string | null, date: string | null) {
  const url = doctorId && date ? `/doctors/${doctorId}/slots?date=${date}` : null

  const { data, error, isLoading, mutate } = useSWR(url, fetcher)

  return {
    slots: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
