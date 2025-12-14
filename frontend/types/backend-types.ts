/**
 * Backend-aligned types for MediPredict API
 * These types match the ASP.NET Web API ViewModels and Models
 */

// ===== API RESPONSE WRAPPER =====
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// ===== ENUMS =====
export enum Gender {
  Male = 1,
  Female = 2,
  Other = 3,
  PreferNotToSay = 4,
}

export enum AppointmentStatus {
  Scheduled = 1,
  Confirmed = 2,
  InProgress = 3,
  Completed = 4,
  Cancelled = 5,
  NoShow = 6,
  Rescheduled = 7,
}

export enum UserRole {
  Patient = "Patient",
  Doctor = "Doctor",
  Admin = "Admin",
}

// ===== USER & AUTHENTICATION =====
export interface ApplicationUser {
  id: string
  userName: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: Gender
  phoneNumber?: string
  address?: string
  profilePicture?: string
  role?: {
    id: string
    name: string
  }
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface LoginViewModel {
  email: string
  password: string
}

export interface UserRegistrationViewModel {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  gender: string
  phoneNumber?: string
  role: string
  password: string
  confirmPassword: string
  // Doctor-specific fields
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

export interface LoginResponse {
  userId: string
  email: string
  firstName: string
  lastName: string
  role: string
}

// ===== APPOINTMENTS =====
export interface AppointmentItemViewModel {
  appointmentId: string
  patientName: string
  doctorName: string
  doctorId: string
  doctorSpecialization: string
  doctorProfilePicture?: string
  appointmentDate: string
  appointmentTime: string
  timeSlot: string
  durationMinutes: number
  status: string
  reasonForVisit: string
  consultationFee: number
  confirmationNumber: string
}

export interface AppointmentBookingViewModel {
  doctorId: string
  appointmentDate: string
  timeSlot: string
  reasonForVisit: string
  additionalNotes?: string
  predictionId?: number
  durationMinutes: number
}

// Backend expects this exact structure
export interface BookAppointmentRequest {
  userId: string
  doctorId: string
  appointmentDate: string // Date part only (YYYY-MM-DD)
  appointmentTime: string // Time part only (HH:mm AM/PM)
  reasonForVisit: string
  additionalNotes?: string
  durationMinutes: number
}

export interface AppointmentDetailsViewModel extends AppointmentItemViewModel {
  patientId?: string
  notes?: string
  diagnosis?: string
  treatmentPlan?: string
}

// ===== CONSULTATIONS =====
export interface ConsultationSummaryViewModel {
  consultationRecordId: string
  appointmentId: string
  
  // Patient information (for doctor view)
  patientName?: string
  patientAge?: number
  patientGender?: string
  
  // Doctor information (for patient view)
  doctorName?: string
  doctorSpecialization?: string
  doctorProfilePicture?: string
  
  // Consultation details
  consultationDate: string
  officialDiagnosis: string
  aiPredictionUsed: boolean
  aiDiagnosisConfirmed: boolean
  aiPredictionCondition?: string
  aiPredictionConfidence?: number
  prescriptionsCount: number
  labTestsOrdered?: string
  reasonForVisit: string
}

export interface ConsultationViewModel {
  // Appointment Info
  appointmentId: string
  appointmentDate: string
  patientName: string
  reasonForVisit: string
  appointmentNotes: string

  // Patient Demographics
  patientId: string
  patientGender: string
  patientDateOfBirth?: string
  patientPhone: string
  patientEmail: string
  patientMedicalHistory: string
  patientAllergies: string

  // AI Prediction (if exists)
  aiPrediction?: AIPredictionViewModel

  // Consultation Form Data
  officialDiagnosis: string
  aiDiagnosisConfirmed: boolean
  consultationNotes: string
  treatmentPlan: string
  labTestsOrdered: string
  labReports: string
  specialistReferrals: string
  patientRecordNotes: string
  followUpRequired: boolean
  followUpDate?: string
  followUpInstructions: string

  // Prescriptions
  prescriptions: PrescriptionViewModel[]

  // Status
  isCompleted: boolean
  completedDate?: string
  consultationRecordId?: string

  // Doctor Information
  doctorName?: string
  doctorSpecialization?: string
  consultationDate?: string
  aiPredictionUsed?: boolean
}

export interface AIPredictionViewModel {
  id: string
  primaryCondition: string
  confidenceScore: number
  symptomsReported: string
  predictionResults: DiseaseProbability[]
  aiDisclaimer?: string
  createdAt: string
}

export interface PrescriptionViewModel {
  id?: string
  drugName: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export interface DiseaseProbability {
  diseaseName: string
  probability: number
  description?: string
}

// ===== DOCTORS =====
export interface DoctorProfileViewModel {
  doctorId: string
  userId: string
  fullName: string
  email: string
  phoneNumber: string
  specialization: string
  qualifications: string
  experience: number
  licenseNumber: string
  licenseState?: string
  licenseIssueDate?: string
  licenseExpiryDate?: string
  npiNumber?: string
  professionalTitle?: string
  educationTraining?: string
  boardCertifications?: string
  isVerified: boolean
  consultationFee: number
  bio?: string
  address?: string
  profilePicture?: string

  // Availability
  availableDays: string[]
  availableTimeStart?: string
  availableTimeEnd?: string

  // Ratings & Statistics
  averageRating: number
  totalReviews: number
  totalPatients: number
  completedConsultations: number
  recentReviews?: DoctorReviewViewModel[]
}

export interface DoctorReviewViewModel {
  reviewId: number
  patientName: string
  rating: number
  comment: string
  date: string
}

// ===== PREDICTIONS =====
export interface PredictionRequest {
  UserId: string
  Symptoms: string[]
  AdditionalNotes?: string
}

export interface PredictionResultViewModel {
  id?: number
  predictionId: string
  timestamp: string
  createdAt: string

  // Primary Prediction
  primaryDisease: string
  predictedDisease: string
  primaryConfidence: number
  confidenceScore: number
  symptomsCount: number
  urgencyLevel: string

  // Full Probability Breakdown
  allProbabilities: DiseaseProbability[]
  probabilityBreakdown: DiseaseProbability[]

  // Input Summary
  inputSummary: ComprehensivePredictionViewModel

  // Recommendations
  recommendations: string[]
  disclaimerMessage: string
  disclaimer: string
}

export interface ComprehensivePredictionViewModel {
  // Basic Information
  age: number
  sex: number // 1 = Male, 0 = Female

  // Cardiovascular & Physical Symptoms
  chestPainType: number // 0-3
  restingBloodPressure: number
  serumCholesterol: number
  fastingBloodSugar: number // 1 = true, 0 = false
  restingECG: number // 0-2
  maxHeartRate: number
  exerciseInducedAngina: number // 1 = yes, 0 = no
  stDepression: number
  slopeOfPeakExercise: number // 0-2
  numberOfMajorVessels: number // 0-3
  thalassemia: number // 0-3

  // Respiratory Symptoms
  cough: number
  shortnessOfBreath: number
  wheezing: number

  // General Symptoms
  fever: number
  fatigue: number
  headache: number

  // Digestive & Other Symptoms
  nauseaVomiting: number
  abdominalPain: number
  diarrhea: number
  lossOfAppetite: number

  // Additional Information
  additionalNotes?: string
  submittedAt: string
}

export interface PredictionHistoryItemViewModel {
  predictionId: string
  date: string
  primarySymptoms: string
  predictedCondition: string
  confidenceScore: number
  urgencyLevel: string
}

// ===== ADMIN =====
export interface AdminDashboardViewModel {
  statistics: SystemStatistics
  recentActivities: RecentActivityItem[]
  appointmentTrends: ChartDataPoint[]
  predictionTrends: ChartDataPoint[]
  topDoctors: TopDoctorViewModel[]
  pendingApprovals: PendingApprovalItem[]
}

export interface SystemStatistics {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  totalPredictions: number
  activePatients: number
  verifiedDoctors: number
  upcomingAppointments: number
  todayAppointments: number
  pendingDoctorApprovals: number
  pendingAppointmentCancellations: number
  totalRevenue: number
  monthlyRevenue: number
  patientGrowthRate: number
  doctorGrowthRate: number
  appointmentGrowthRate: number
  revenueGrowthRate: number
}

export interface RecentActivityItem {
  id: string
  activityType: string
  description: string
  userName: string
  timestamp: string
  iconClass: string
  colorClass: string
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface TopDoctorViewModel {
  doctorId: string
  name: string
  specialization: string
  profilePicture?: string
  rating: number
  totalAppointments: number
  revenue: number
  isVerified: boolean
}

export interface PendingApprovalItem {
  id: string
  type: string
  title: string
  description: string
  submittedDate: string
  status: string
  priority: number
}

export interface DoctorApprovalViewModel {
  doctorId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  specialization: string
  licenseNumber: string
  hospitalAffiliation?: string
  yearsOfExperience: number
  educationDetails: string
  createdAt: string
}

// ===== PROFILE =====
export interface PatientProfileSummaryViewModel {
  patientId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  gender: string
  address: string
  bloodType: string
  allergies: string
  medicalHistory: string
  emergencyContact?: string
  emergencyPhone?: string
  isPregnant?: boolean
  profilePicture?: string
  createdAt: string
}

export interface DoctorEditViewModel {
  firstName: string
  lastName: string
  phoneNumber: string
  specialization: string
  qualifications: string
  experience: number
  consultationFee: number
  bio: string
  address: string
  availableDays?: string[]
  availableTimeStart?: string
  availableTimeEnd?: string
}

// ===== HELPER FUNCTIONS =====
export function genderToString(gender: Gender): string {
  switch (gender) {
    case Gender.Male:
      return "Male"
    case Gender.Female:
      return "Female"
    case Gender.Other:
      return "Other"
    case Gender.PreferNotToSay:
      return "Prefer not to say"
    default:
      return "Unknown"
  }
}

export function stringToGender(gender: string): Gender {
  switch (gender.toLowerCase()) {
    case "male":
      return Gender.Male
    case "female":
      return Gender.Female
    case "other":
      return Gender.Other
    default:
      return Gender.PreferNotToSay
  }
}

export function appointmentStatusToString(status: AppointmentStatus): string {
  switch (status) {
    case AppointmentStatus.Scheduled:
      return "Scheduled"
    case AppointmentStatus.Confirmed:
      return "Confirmed"
    case AppointmentStatus.InProgress:
      return "In Progress"
    case AppointmentStatus.Completed:
      return "Completed"
    case AppointmentStatus.Cancelled:
      return "Cancelled"
    case AppointmentStatus.NoShow:
      return "No Show"
    case AppointmentStatus.Rescheduled:
      return "Rescheduled"
    default:
      return "Unknown"
  }
}

export function stringToAppointmentStatus(status: string): AppointmentStatus {
  switch (status.toLowerCase()) {
    case "scheduled":
      return AppointmentStatus.Scheduled
    case "confirmed":
      return AppointmentStatus.Confirmed
    case "inprogress":
    case "in progress":
      return AppointmentStatus.InProgress
    case "completed":
      return AppointmentStatus.Completed
    case "cancelled":
      return AppointmentStatus.Cancelled
    case "noshow":
    case "no show":
      return AppointmentStatus.NoShow
    case "rescheduled":
      return AppointmentStatus.Rescheduled
    default:
      return AppointmentStatus.Scheduled
  }
}
