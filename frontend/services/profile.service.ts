/**
 * Profile Service
 * Handles user profile operations (view and edit)
 */

import type {
  ApiResponse,
  PatientProfileSummaryViewModel,
  DoctorProfileViewModel,
} from "@/types/backend-types"
import { SERVICE_CONFIG, delay, mockApiResponse, getCurrentUserId } from "./config"

class ProfileService {
  private baseUrl = `${SERVICE_CONFIG.apiBaseUrl}/api/Profile`

  /**
   * Get patient profile
   */
  async getPatientProfile(userId: string): Promise<ApiResponse<PatientProfileSummaryViewModel>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const mockProfile: PatientProfileSummaryViewModel = {
        patientId: "patient-123",
        userId: userId,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phoneNumber: "+250788123456",
        dateOfBirth: "1990-05-15",
        gender: "Male",
        address: "123 Main St, Kigali, Rwanda",
        bloodType: "O+",
        allergies: "Peanuts, Penicillin",
        medicalHistory: "No major surgeries. Occasional migraines.",
        profilePicture: undefined,
        createdAt: "2024-01-15T10:00:00Z",
      }

      return mockApiResponse(mockProfile, "Patient profile retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/patient/${userId}?userId=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error("Profile API Error:", response.status, errorData)
      throw new Error(errorData?.message || `Failed to retrieve patient profile (${response.status})`)
    }

    return response.json()
  }

  /**
   * Update patient profile
   */
  async updatePatientProfile(
    userId: string,
    data: PatientProfileSummaryViewModel,
  ): Promise<ApiResponse<object>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse({}, "Patient profile updated successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/patient/${userId}?userId=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update profile" }))
      throw new Error(error.message || "Failed to update profile")
    }

    return response.json()
  }

  /**
   * Get doctor profile
   */
  async getDoctorProfile(userId: string): Promise<ApiResponse<DoctorProfileViewModel>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const mockProfile: DoctorProfileViewModel = {
        doctorId: "doc-1",
        userId: userId,
        fullName: "Dr. Sarah Smith",
        email: "dr.smith@email.com",
        phoneNumber: "+250788654321",
        specialization: "Cardiology",
        qualifications: "MD, FACC, Board Certified Cardiologist",
        experience: 15,
        licenseNumber: "MD12345",
        isVerified: true,
        consultationFee: 50000,
        bio: "Experienced cardiologist with focus on preventive care.",
        address: "456 Medical Plaza, Kigali, Rwanda",
        profilePicture: undefined,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        availableTimeStart: "09:00",
        availableTimeEnd: "17:00",
        totalPatients: 0,
        completedConsultations: 0,
        averageRating: 0,
        totalReviews: 0,
      }

      return mockApiResponse(mockProfile, "Doctor profile retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/doctor/${userId}?userId=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error("Get Doctor Profile Error:", response.status, errorData)
      throw new Error(errorData?.message || `Failed to retrieve doctor profile (${response.status})`)
    }

    return response.json()
  }

  /**
   * Update doctor profile
   */
  async updateDoctorProfile(userId: string, data: any): Promise<ApiResponse<object>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse({}, "Doctor profile updated successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/doctor/${userId}?userId=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update profile" }))
      throw new Error(error.message || "Failed to update profile")
    }

    return response.json()
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(userId: string, file: File, role: string): Promise<ApiResponse<string>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse("/uploads/profiles/mock-profile.jpg", "Profile picture uploaded successfully")
    }

    // Real API call
    const formData = new FormData()
    formData.append("picture", file)

    const response = await fetch(`${this.baseUrl}/picture/${userId}?role=${role}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to upload profile picture" }))
      throw new Error(error.message || "Failed to upload profile picture")
    }

    return response.json()
  }
}

export const profileService = new ProfileService()
