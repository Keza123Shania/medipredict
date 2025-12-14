/**
 * Consultation Service
 * Handles consultation records and medical records
 * Supports both mock data and real API calls
 */

import type { ApiResponse, ConsultationViewModel, ConsultationSummaryViewModel } from "@/types/backend-types"
import { SERVICE_CONFIG, delay, mockApiResponse } from "./config"
import { mockConsultations } from "./mock-data"

class ConsultationService {
  private baseUrl = `${SERVICE_CONFIG.apiBaseUrl}/api/Consultations`

  /**
   * Get consultation by appointment ID (Doctor only)
   */
  async getConsultationByAppointment(
    appointmentId: string,
    userId: string,
  ): Promise<ApiResponse<ConsultationViewModel>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const consultation = mockConsultations.find((c) => c.appointmentId === appointmentId)
      if (!consultation) {
        // Return empty consultation template
        const emptyConsultation: ConsultationViewModel = {
          appointmentId,
          appointmentDate: new Date().toISOString(),
          patientName: "",
          reasonForVisit: "",
          appointmentNotes: "",
          patientId: "",
          patientGender: "",
          patientPhone: "",
          patientEmail: "",
          patientMedicalHistory: "",
          patientAllergies: "",
          officialDiagnosis: "",
          aiDiagnosisConfirmed: false,
          consultationNotes: "",
          treatmentPlan: "",
          labTestsOrdered: "",
          labReports: "",
          specialistReferrals: "",
          patientRecordNotes: "",
          followUpRequired: false,
          followUpInstructions: "",
          prescriptions: [],
          isCompleted: false,
        }
        return mockApiResponse(emptyConsultation, "No existing consultation found")
      }

      return mockApiResponse(consultation, "Consultation data retrieved successfully")
    }

    // Real API call (Doctor endpoint)
    const response = await fetch(`${this.baseUrl}/appointment/${appointmentId}?userId=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve consultation")
    }

    return response.json()
  }

  /**
   * Get patient's full consultation details by consultation ID
   */
  async getPatientConsultationDetail(
    patientId: string,
    consultationId: string,
  ): Promise<ApiResponse<ConsultationViewModel>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const consultation = mockConsultations.find((c) => c.consultationRecordId === consultationId)
      if (!consultation) {
        // Return empty consultation template
        const emptyConsultation: ConsultationViewModel = {
          appointmentId: "",
          appointmentDate: new Date().toISOString(),
          patientName: "",
          reasonForVisit: "",
          appointmentNotes: "",
          patientId,
          patientGender: "",
          patientPhone: "",
          patientEmail: "",
          patientMedicalHistory: "",
          patientAllergies: "",
          officialDiagnosis: "",
          aiDiagnosisConfirmed: false,
          consultationNotes: "",
          treatmentPlan: "",
          labTestsOrdered: "",
          labReports: "",
          specialistReferrals: "",
          patientRecordNotes: "",
          followUpRequired: false,
          followUpInstructions: "",
          prescriptions: [],
          isCompleted: false,
        }
        return mockApiResponse(emptyConsultation, "No existing consultation found")
      }

      return mockApiResponse(consultation, "Consultation data retrieved successfully")
    }

    // Real API call (Patient endpoint)
    const response = await fetch(
      `${this.baseUrl}/patient/${patientId}/consultation/${consultationId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    )

    if (!response.ok) {
      throw new Error("Failed to retrieve consultation details")
    }

    return response.json()
  }

  /**
   * Get consultation by consultation record ID
   */
  async getConsultationById(
    consultationRecordId: string,
    userId: string,
  ): Promise<ApiResponse<ConsultationViewModel>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const consultation = mockConsultations.find((c) => c.consultationRecordId === consultationRecordId)
      if (!consultation) {
        throw new Error("Consultation not found")
      }

      return mockApiResponse(consultation, "Consultation data retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/${consultationRecordId}?userId=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve consultation")
    }

    return response.json()
  }

  /**
   * Save or update consultation
   */
  async saveConsultation(data: ConsultationViewModel): Promise<ApiResponse<any>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const consultationId = data.consultationRecordId || `consult-${Date.now()}`
      return mockApiResponse(
        { consultationId, ...data },
        data.consultationRecordId ? "Consultation updated successfully" : "Consultation saved successfully",
      )
    }

    // Real API call
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to save consultation" }))
      throw new Error(error.message || "Failed to save consultation")
    }

    return response.json()
  }

  /**
   * Get consultation history for a patient
   */
  async getPatientConsultationHistory(patientId: string): Promise<ApiResponse<ConsultationSummaryViewModel[]>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const patientConsultations = mockConsultations.filter((c) => c.patientId === patientId)
      return mockApiResponse(patientConsultations, "Consultation history retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/patient/${patientId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve consultation history")
    }

    return response.json()
  }

  /**
   * Get consultations for a doctor
   */
  async getDoctorConsultations(userId: string): Promise<ApiResponse<ConsultationSummaryViewModel[]>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse(mockConsultations, "Consultations retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/doctor?userId=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve consultations")
    }

    return response.json()
  }
}

export const consultationService = new ConsultationService()
