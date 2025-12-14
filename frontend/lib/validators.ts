import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    role: z.enum(["patient", "doctor"]),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),
    phoneNumber: z.string().optional(),
    specialization: z.string().optional(),
    professionalTitle: z.string().optional(),
    licenseNumber: z.string().optional(),
    licenseState: z.string().optional(),
    licenseIssueDate: z.string().optional(),
    licenseExpiryDate: z.string().optional(),
    npiNumber: z.string().optional(),
    experience: z.number().optional(),
    qualifications: z.string().optional(),
    educationTraining: z.string().optional(),
    boardCertifications: z.string().optional(),
    consultationFee: z.number().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "doctor") {
        return (
          data.specialization &&
          data.licenseNumber &&
          data.licenseState &&
          data.licenseExpiryDate &&
          data.experience !== undefined &&
          data.qualifications &&
          data.consultationFee !== undefined &&
          data.phoneNumber
        )
      }
      return true
    },
    {
      message: "All doctor fields are required (specialization, license info, experience, qualifications, consultation fee, phone)",
      path: ["specialization"],
    },
  )

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const symptomEntrySchema = z.object({
  age: z.number().min(1, "Age is required").max(120, "Please enter a valid age"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select your gender" }),
  }),
  symptoms: z.array(z.string()).min(1, "Please select at least one symptom"),
  symptomDetails: z
    .record(
      z.object({
        severity: z.enum(["mild", "moderate", "severe"]).optional(),
        duration: z.string().optional(),
        frequency: z.string().optional(),
      }),
    )
    .optional(),
  medicalHistory: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  lifestyle: z
    .object({
      smoking: z.boolean(),
      alcohol: z.boolean(),
      exercise: z.enum(["none", "light", "moderate", "heavy"]),
    })
    .optional(),
  additionalNotes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
})

export const bookingSchema = z.object({
  doctorId: z.string().min(1, "Please select a doctor"),
  date: z.string().min(1, "Please select a date"),
  timeSlot: z.string().min(1, "Please select a time slot"),
  type: z.enum(["in-person", "video", "phone"]),
  reason: z.string().min(10, "Please provide a reason for the appointment"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
})

export const consultationSchema = z.object({
  diagnosis: z.string().min(10, "Please provide a detailed diagnosis"),
  symptoms: z.array(z.string()).min(1, "Please list the symptoms"),
  prescription: z
    .array(
      z.object({
        medication: z.string().min(1, "Medication name is required"),
        dosage: z.string().min(1, "Dosage is required"),
        frequency: z.string().min(1, "Frequency is required"),
        duration: z.string().min(1, "Duration is required"),
        instructions: z.string().optional(),
      }),
    )
    .optional(),
  recommendations: z.array(z.string()).min(1, "Please provide recommendations"),
  followUpDate: z.string().optional(),
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type SymptomEntryFormData = z.infer<typeof symptomEntrySchema>
export type BookingFormData = z.infer<typeof bookingSchema>
export type ConsultationFormData = z.infer<typeof consultationSchema>
