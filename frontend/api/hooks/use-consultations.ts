import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { consultationService } from "@/services"
import type { ConsultationViewModel } from "@/types/backend-types"
import { getCurrentUserId } from "@/services/config"

export function useConsultations() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: ["consultations", "doctor", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated")
      return consultationService.getDoctorConsultations(userId)
    },
    enabled: !!userId,
  })
}

export function useConsultation(id: string) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: ["consultation", id],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated")
      return consultationService.getConsultationByAppointment(id, userId)
    },
    enabled: !!id && !!userId,
  })
}

export function useConsultationByAppointment(appointmentId: string) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: ["consultation", "appointment", appointmentId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated")
      return consultationService.getConsultationByAppointment(appointmentId, userId)
    },
    enabled: !!appointmentId && !!userId,
  })
}

export function useCreateConsultation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ConsultationViewModel) => consultationService.saveConsultation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] })
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}
