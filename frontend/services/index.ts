/**
 * Service Layer Index
 * Central export point for all services
 */

export { authService } from "./auth.service"
export { appointmentService } from "./appointment.service"
export { doctorService } from "./doctor.service"
export { consultationService } from "./consultation.service"
export { predictionService } from "./prediction.service"
export { adminService } from "./admin.service"
export { profileService } from "./profile.service"
export { SERVICE_CONFIG } from "./config"

// Re-export types for convenience
export type * from "@/types/backend-types"
