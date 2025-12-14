"use client"

import useSWR from "swr"
import { apiClient } from "@/api/client"
import type { Appointment } from "@/types"
import { useCallback } from "react"

const fetcher = (url: string) => apiClient.get(url)

export function useAppointments(params?: { status?: string; patientId?: string; doctorId?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set("status", params.status)
  if (params?.patientId) searchParams.set("patientId", params.patientId)
  if (params?.doctorId) searchParams.set("doctorId", params.doctorId)

  const queryString = searchParams.toString()
  const url = `/appointments${queryString ? `?${queryString}` : ""}`

  const { data, error, isLoading, mutate } = useSWR<Appointment[]>(url, fetcher)

  const createAppointment = useCallback(
    async (appointmentData: Partial<Appointment>) => {
      const newAppointment = await apiClient.post<Appointment>("/appointments", appointmentData)
      mutate()
      return newAppointment
    },
    [mutate],
  )

  const updateAppointment = useCallback(
    async (id: string, updates: Partial<Appointment>) => {
      const updated = await apiClient.patch<Appointment>(`/appointments/${id}`, updates)
      mutate()
      return updated
    },
    [mutate],
  )

  const cancelAppointment = useCallback(
    async (id: string, reason?: string) => {
      const updated = await apiClient.patch<Appointment>(`/appointments/${id}`, {
        status: "cancelled",
        cancellationReason: reason,
      })
      mutate()
      return updated
    },
    [mutate],
  )

  return {
    appointments: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
    createAppointment,
    updateAppointment,
    cancelAppointment,
  }
}

export function useAppointment(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Appointment>(id ? `/appointments/${id}` : null, fetcher)

  return {
    appointment: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
