import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { doctorService } from "@/services"
import type { DoctorProfileViewModel } from "@/types/backend-types"

interface DoctorsParams {
  specialization?: string
  name?: string
  search?: string
  isVerified?: boolean
  page?: number
  pageSize?: number
  limit?: number
}

export function useDoctors(params?: DoctorsParams) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: () =>
      doctorService.getDoctors({
        specialization: params?.specialization,
        name: params?.name || params?.search,
        isVerified: params?.isVerified,
        page: params?.page,
        pageSize: params?.pageSize || params?.limit,
      }),
  })
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => doctorService.getDoctor(id),
    enabled: !!id,
  })
}

export function useDoctorByUserId(userId: string) {
  return useQuery({
    queryKey: ["doctor", "user", userId],
    queryFn: () => doctorService.getDoctorByUserId(userId),
    enabled: !!userId,
  })
}

export function useDoctorSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: ["doctor-slots", doctorId, date],
    queryFn: () => doctorService.getAvailableTimeSlots(doctorId, date),
    enabled: !!doctorId && !!date,
  })
}

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ doctorId, data }: { doctorId: string; data: Partial<DoctorProfileViewModel> }) =>
      doctorService.updateDoctorProfile(doctorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor"] })
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
    },
  })
}
