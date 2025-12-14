import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { appointmentService } from "@/services"
import type { AppointmentBookingViewModel } from "@/types/backend-types"
import { getCurrentUserId, getCurrentUserRole } from "@/services/config"

interface AppointmentsParams {
  status?: string
  page?: number
  limit?: number
}

export function useAppointments(params?: AppointmentsParams) {
  const userId = getCurrentUserId()
  const role = getCurrentUserRole()

  return useQuery({
    queryKey: ["appointments", params, userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated")
      return appointmentService.getAppointments({
        userId,
        role: role || undefined,
        status: params?.status,
      })
    },
    enabled: !!userId,
  })
}

export function useAppointment(id: string) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated")
      return appointmentService.getAppointment(id, userId)
    },
    enabled: !!id && !!userId,
  })
}

export function useBookAppointment() {
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  return useMutation({
    mutationFn: async (data: AppointmentBookingViewModel) => {
      if (!userId) throw new Error("User not authenticated")
      return appointmentService.bookAppointment(data, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      if (!userId) throw new Error("User not authenticated")
      return appointmentService.cancelAppointment(id, userId, reason)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  return useMutation({
    mutationFn: async ({ id, date, timeSlot }: { id: string; date: string; timeSlot: string }) => {
      if (!userId) throw new Error("User not authenticated")
      return appointmentService.rescheduleAppointment(id, date, timeSlot, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}
