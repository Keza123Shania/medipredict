export type UserRole = "patient" | "doctor" | "admin"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  phone?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  address?: string
  createdAt: string
  updatedAt: string
}

export interface Patient extends User {
  role: "patient"
  bloodType?: string
  allergies?: string[]
  chronicConditions?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

export interface Doctor extends User {
  role: "doctor"
  specialization: string
  licenseNumber: string
  experience: number
  bio?: string
  education: string[]
  languages: string[]
  consultationFee: number
  rating: number
  reviewCount: number
  isVerified: boolean
  availability: DoctorAvailability[]
}

export interface DoctorAvailability {
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration: number
}

export interface Admin extends User {
  role: "admin"
  permissions: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "patient" | "doctor"
  dateOfBirth?: string
  gender?: string
  phoneNumber?: string
  specialization?: string
  licenseNumber?: string
  licenseState?: string
  licenseIssueDate?: string
  licenseExpiryDate?: string
  npiNumber?: string
  professionalTitle?: string
  experience?: number
  qualifications?: string
  educationTraining?: string
  boardCertifications?: string
  consultationFee?: number
}
