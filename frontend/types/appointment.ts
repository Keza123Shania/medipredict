export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled"
export type AppointmentType = "in-person" | "video" | "phone"

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  predictionId?: string
  date: string
  startTime: string
  endTime: string
  type: AppointmentType
  status: AppointmentStatus
  reason: string
  notes?: string
  symptoms?: string[]
  createdAt: string
  updatedAt: string
  patient?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  doctor?: {
    id: string
    firstName: string
    lastName: string
    specialization: string
    avatar?: string
  }
}

export interface BookingData {
  doctorId: string
  date: string
  timeSlot: string
  type: AppointmentType
  reason: string
  symptoms?: string[]
  notes?: string
}
