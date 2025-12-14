/**
 * Doctor Service
 * Handles doctor profiles, search, and management
 * Supports both mock data and real API calls
 */

import type { ApiResponse, DoctorProfileViewModel } from "@/types/backend-types"
import { SERVICE_CONFIG, delay, mockApiResponse } from "./config"
import { mockDoctors } from "./mock-data"

interface GetDoctorsParams {
  specialization?: string
  name?: string
  isVerified?: boolean
  includeUnverified?: boolean
  page?: number
  pageSize?: number
}

interface GetDoctorsResponse {
  doctors: DoctorProfileViewModel[]
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
}

class DoctorService {
  private baseUrl = `${SERVICE_CONFIG.apiBaseUrl}/api/Doctors`

  /**
   * Get list of doctors with optional filters
   */
  async getDoctors(params?: GetDoctorsParams): Promise<ApiResponse<GetDoctorsResponse>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      let filteredDoctors = [...mockDoctors]

      // Apply filters
      if (params?.specialization) {
        filteredDoctors = filteredDoctors.filter((d) =>
          d.specialization.toLowerCase().includes(params.specialization!.toLowerCase()),
        )
      }

      if (params?.name) {
        filteredDoctors = filteredDoctors.filter(
          (d) =>
            d.fullName.toLowerCase().includes(params.name!.toLowerCase()) ||
            d.email.toLowerCase().includes(params.name!.toLowerCase()),
        )
      }

      if (params?.isVerified !== undefined) {
        filteredDoctors = filteredDoctors.filter((d) => d.isVerified === params.isVerified)
      }

      const page = params?.page || 1
      const pageSize = params?.pageSize || 12
      const startIndex = (page - 1) * pageSize
      const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + pageSize)

      return mockApiResponse<GetDoctorsResponse>(
        {
          doctors: paginatedDoctors,
          totalCount: filteredDoctors.length,
          currentPage: page,
          pageSize,
          totalPages: Math.ceil(filteredDoctors.length / pageSize),
        },
        "Doctors retrieved successfully",
      )
    }

    // Real API call
    const queryParams = new URLSearchParams()
    if (params?.specialization) queryParams.append("specialization", params.specialization)
    if (params?.name) queryParams.append("name", params.name)
    if (params?.isVerified !== undefined) queryParams.append("isVerified", String(params.isVerified))
    if (params?.includeUnverified !== undefined) queryParams.append("includeUnverified", String(params.includeUnverified))
    if (params?.page) queryParams.append("page", String(params.page))
    if (params?.pageSize) queryParams.append("pageSize", String(params.pageSize))

    const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams}` : ""}`
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve doctors")
    }

    return response.json()
  }

  /**
   * Get single doctor by ID
   */
  async getDoctor(id: string): Promise<ApiResponse<DoctorProfileViewModel>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const doctor = mockDoctors.find((d) => d.doctorId === id)
      if (!doctor) {
        throw new Error("Doctor not found")
      }

      return mockApiResponse(doctor, "Doctor retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve doctor")
    }

    return response.json()
  }

  /**
   * Get doctor profile by user ID
   */
  async getDoctorByUserId(userId: string): Promise<ApiResponse<DoctorProfileViewModel>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const doctor = mockDoctors.find((d) => d.userId === userId)
      if (!doctor) {
        throw new Error("Doctor profile not found")
      }

      return mockApiResponse(doctor, "Doctor profile retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/user/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve doctor profile")
    }

    return response.json()
  }

  /**
   * Update doctor profile
   */
  async updateDoctorProfile(doctorId: string, data: Partial<DoctorProfileViewModel>): Promise<ApiResponse<any>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse({ doctorId, ...data }, "Doctor profile updated successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/${doctorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to update doctor profile")
    }

    return response.json()
  }

  /**
   * Get available time slots for a doctor
   */
  async getAvailableTimeSlots(doctorId: string, date: string): Promise<ApiResponse<Array<{
    startTime: string
    endTime: string
    isAvailable: boolean
    dateTime: string
  }>>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      // Generate mock time slots
      const timeSlots = [
        { startTime: "09:00", endTime: "09:30", isAvailable: true, dateTime: `${date}T09:00:00` },
        { startTime: "09:30", endTime: "10:00", isAvailable: true, dateTime: `${date}T09:30:00` },
        { startTime: "10:00", endTime: "10:30", isAvailable: true, dateTime: `${date}T10:00:00` },
        { startTime: "10:30", endTime: "11:00", isAvailable: false, dateTime: `${date}T10:30:00` },
        { startTime: "11:00", endTime: "11:30", isAvailable: true, dateTime: `${date}T11:00:00` },
        { startTime: "11:30", endTime: "12:00", isAvailable: true, dateTime: `${date}T11:30:00` },
        { startTime: "14:00", endTime: "14:30", isAvailable: true, dateTime: `${date}T14:00:00` },
        { startTime: "14:30", endTime: "15:00", isAvailable: true, dateTime: `${date}T14:30:00` },
        { startTime: "15:00", endTime: "15:30", isAvailable: false, dateTime: `${date}T15:00:00` },
        { startTime: "15:30", endTime: "16:00", isAvailable: true, dateTime: `${date}T15:30:00` },
        { startTime: "16:00", endTime: "16:30", isAvailable: true, dateTime: `${date}T16:00:00` },
        { startTime: "16:30", endTime: "17:00", isAvailable: true, dateTime: `${date}T16:30:00` },
      ]

      return mockApiResponse(timeSlots, "Available time slots retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/${doctorId}/available-slots?date=${date}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve available time slots")
    }

    return response.json()
  }
}

export const doctorService = new DoctorService()
