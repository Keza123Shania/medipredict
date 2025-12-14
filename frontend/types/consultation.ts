export interface Consultation {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  diagnosis: string
  symptoms: string[]
  prescription?: Prescription[]
  recommendations: string[]
  followUpDate?: string
  notes?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface Prescription {
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface ConsultationFormData {
  appointmentId: string
  diagnosis: string
  symptoms: string[]
  prescription: Prescription[]
  recommendations: string[]
  followUpDate?: string
  notes?: string
}
