/**
 * Appointment Service
 * Handles appointment booking, retrieval, and management
 * Supports both mock data and real API calls
 */

import type {
  ApiResponse,
  AppointmentItemViewModel,
  AppointmentBookingViewModel,
  AppointmentDetailsViewModel,
} from "@/types/backend-types"
import { SERVICE_CONFIG, delay, mockApiResponse, getCurrentUserId, getCurrentUserRole } from "./config"
import { mockAppointments } from "./mock-data"

interface GetAppointmentsParams {
  userId: string
  role?: string
  status?: string
}

interface GetAppointmentsResponse {
  appointments: AppointmentItemViewModel[]
  doctors?: any[] // For booking modal
}

class AppointmentService {
  private baseUrl = `${SERVICE_CONFIG.apiBaseUrl}/api/Appointments`

  /**
   * Get appointments for a user
   */
  async getAppointments(params: GetAppointmentsParams): Promise<ApiResponse<GetAppointmentsResponse>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      let filteredAppointments = [...mockAppointments]

      // Filter by status if provided
      if (params.status && params.status !== "all") {
        filteredAppointments = filteredAppointments.filter(
          (apt) => apt.status.toLowerCase() === params.status?.toLowerCase(),
        )
      }

      return mockApiResponse<GetAppointmentsResponse>(
        {
          appointments: filteredAppointments,
          doctors: [], // Would include doctor list in real scenario
        },
        "Appointments retrieved successfully",
      )
    }

    // Real API call
    const queryParams = new URLSearchParams({
      userId: params.userId,
      ...(params.role && { role: params.role }),
      ...(params.status && { status: params.status }),
    })

    const response = await fetch(`${this.baseUrl}?${queryParams}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve appointments")
    }

    return response.json()
  }

  /**
   * Get single appointment by ID
   */
  async getAppointment(id: string, userId: string): Promise<ApiResponse<AppointmentDetailsViewModel>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const appointment = mockAppointments.find((apt) => apt.appointmentId === id)
      if (!appointment) {
        throw new Error("Appointment not found")
      }

      return mockApiResponse<AppointmentDetailsViewModel>(
        appointment as AppointmentDetailsViewModel,
        "Appointment retrieved successfully",
      )
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/${id}?userId=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve appointment")
    }

    return response.json()
  }

  /**
   * Book new appointment
   */
  async bookAppointment(data: AppointmentBookingViewModel, userId: string): Promise<ApiResponse<any>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const newAppointment = {
        appointmentId: `apt-${Date.now()}`,
        confirmationNumber: `CONF-${Date.now()}`,
        ...data,
        status: "Scheduled",
      }

      return mockApiResponse(newAppointment, "Appointment booked successfully")
    }

    // Real API call - Backend expects separate date and time fields
    const appointmentDate = data.appointmentDate.split('T')[0] // Extract date part
    const appointmentTime = data.timeSlot // Time slot is already in correct format

    const backendRequest = {
      userId,
      doctorId: data.doctorId,
      appointmentDate,
      appointmentTime,
      reasonForVisit: data.reasonForVisit,
      additionalNotes: data.additionalNotes,
      durationMinutes: data.durationMinutes,
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendRequest),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to book appointment" }))
      throw new Error(error.message || "Failed to book appointment")
    }

    return response.json()
  }

  /**
   * Create new appointment
   */
  async createAppointment(data: {
    userId: string
    doctorId: string
    appointmentDate: string
    appointmentTime: string
    durationMinutes: number
    reasonForVisit: string
    additionalNotes?: string
    symptomEntryId?: string
  }): Promise<ApiResponse<any>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const newAppointment = {
        appointmentId: `apt-${Date.now()}`,
        confirmationNumber: `CONF-${Date.now()}`,
        ...data,
        status: "Scheduled",
      }

      return mockApiResponse(newAppointment, "Appointment created successfully")
    }

    // Real API call
    try {
      console.log('Creating appointment with data:', data)
      const response = await fetch(`${this.baseUrl}/CreateAppointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })

      // Check if response is OK
      if (!response.ok) {
        let errorMessage = "Failed to create appointment"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = `${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Get response text first to check if it's empty
      const responseText = await response.text()
      
      if (!responseText) {
        throw new Error("Server returned empty response")
      }

      // Try to parse as JSON
      try {
        return JSON.parse(responseText)
      } catch (parseError) {
        console.error("Response text:", responseText)
        throw new Error("Server returned invalid JSON response")
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Network error occurred while creating appointment")
    }
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: string,
    userId: string,
  ): Promise<ApiResponse<any>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse({ appointmentId, status }, "Appointment updated successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/${appointmentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, userId }),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to update appointment")
    }

    return response.json()
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId: string, userId: string, reason?: string): Promise<ApiResponse<any>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse({ appointmentId, status: "Cancelled" }, "Appointment cancelled successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/${appointmentId}/cancel?userId=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      let errorMessage = "Failed to cancel appointment"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = `${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string,
    userId: string,
  ): Promise<ApiResponse<any>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse(
        { appointmentId, appointmentDate: newDate, appointmentTime: newTime },
        "Appointment rescheduled successfully",
      )
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/${appointmentId}/reschedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userId,
        newAppointmentDate: newDate,
        newAppointmentTime: newTime,
      }),
    })

    if (!response.ok) {
      let errorMessage = "Failed to reschedule appointment"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = `${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }
}

export const appointmentService = new AppointmentService()
