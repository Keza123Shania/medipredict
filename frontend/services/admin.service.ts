/**
 * Admin Service
 * Handles admin dashboard, statistics, and management functions
 * Supports both mock data and real API calls
 */

import type {
  ApiResponse,
  AdminDashboardViewModel,
  SystemStatistics,
  DoctorApprovalViewModel,
} from "@/types/backend-types"
import { SERVICE_CONFIG, delay, mockApiResponse } from "./config"
import { mockAdminStats, mockPendingDoctors } from "./mock-data"

class AdminService {
  private baseUrl = `${SERVICE_CONFIG.apiBaseUrl}/api/Admin`

  /**
   * Get admin dashboard data
   */
  async getDashboard(): Promise<ApiResponse<AdminDashboardViewModel>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const dashboardData: AdminDashboardViewModel = {
        statistics: mockAdminStats,
        recentActivities: [
          {
            id: "1",
            activityType: "appointment",
            description: "New appointment booked",
            userName: "John Doe",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            iconClass: "calendar",
            colorClass: "primary",
          },
          {
            id: "2",
            activityType: "prediction",
            description: "AI prediction generated",
            userName: "Jane Smith",
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            iconClass: "brain",
            colorClass: "success",
          },
        ],
        appointmentTrends: [
          { label: "Jan", value: 120, color: "#2563eb" },
          { label: "Feb", value: 150, color: "#2563eb" },
          { label: "Mar", value: 180, color: "#2563eb" },
          { label: "Apr", value: 200, color: "#2563eb" },
          { label: "May", value: 220, color: "#2563eb" },
          { label: "Jun", value: 250, color: "#2563eb" },
        ],
        predictionTrends: [
          { label: "Jan", value: 80, color: "#10b981" },
          { label: "Feb", value: 95, color: "#10b981" },
          { label: "Mar", value: 110, color: "#10b981" },
          { label: "Apr", value: 130, color: "#10b981" },
          { label: "May", value: 145, color: "#10b981" },
          { label: "Jun", value: 165, color: "#10b981" },
        ],
        topDoctors: [
          {
            doctorId: "doc-1",
            name: "Dr. Sarah Smith",
            specialization: "Cardiology",
            rating: 4.8,
            totalAppointments: 245,
            revenue: 36750,
            isVerified: true,
          },
          {
            doctorId: "doc-2",
            name: "Dr. Michael Chen",
            specialization: "Dermatology",
            rating: 4.6,
            totalAppointments: 198,
            revenue: 23760,
            isVerified: true,
          },
        ],
        pendingApprovals: [
          {
            id: "pend-1",
            type: "doctor",
            title: "Dr. Robert Williams",
            description: "New doctor registration - Orthopedics",
            submittedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            status: "Pending",
            priority: 2,
          },
        ],
      }

      return mockApiResponse(dashboardData, "Dashboard data retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/dashboard`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve dashboard data")
    }

    return response.json()
  }

  /**
   * Get pending doctor approvals
   */
  async getPendingDoctors(): Promise<ApiResponse<DoctorApprovalViewModel[]>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse(mockPendingDoctors, "Pending doctors retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/doctors/pending`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve pending doctors")
    }

    return response.json()
  }

  /**
   * Approve doctor
   */
  async approveDoctor(doctorId: string): Promise<ApiResponse<any>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse({ doctorId, approved: true }, "Doctor approved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/doctors/${doctorId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      console.error("Approve doctor failed:", response.status, errorData)
      throw new Error(errorData.message || `Failed to approve doctor (${response.status})`)
    }

    return response.json()
  }

  /**
   * Reject doctor
   */
  async rejectDoctor(doctorId: string, reason: string): Promise<ApiResponse<any>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse({ doctorId, rejected: true, reason }, "Doctor rejected successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/doctors/${doctorId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(reason),
    })

    if (!response.ok) {
      throw new Error("Failed to reject doctor")
    }

    return response.json()
  }

  /**
   * Get system statistics
   */
  async getStatistics(): Promise<ApiResponse<SystemStatistics>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse(mockAdminStats, "Statistics retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/statistics`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve statistics")
    }

    return response.json()
  }

  /**
   * Get admin analytics data
   */
  async getAnalytics(): Promise<ApiResponse<any>> {
    // Real API call
    const response = await fetch(`${this.baseUrl}/analytics`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve analytics")
    }

    return response.json()
  }

  /**
   * Get all patients
   */
  async getPatients(search?: string, page: number = 1, pageSize: number = 20): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    params.append("page", page.toString())
    params.append("pageSize", pageSize.toString())

    const response = await fetch(`${this.baseUrl}/patients?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve patients")
    }

    return response.json()
  }

  /**
   * Get all appointments (admin view)
   */
  async getAppointments(status?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    if (status) params.append("status", status)

    const response = await fetch(`${SERVICE_CONFIG.apiBaseUrl}/api/Appointments?${params.toString()}`, {
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
   * Block patient
   */
  async blockPatient(patientId: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/patients/${patientId}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to block patient")
    }

    return response.json()
  }

  /**
   * Unblock patient
   */
  async unblockPatient(patientId: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/patients/${patientId}/unblock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to unblock patient")
    }

    return response.json()
  }
}

export const adminService = new AdminService()
