import type { Consultation } from "@/types"

export const mockConsultations: Consultation[] = [
  {
    id: "cons-1",
    appointmentId: "apt-3",
    patientId: "patient-2",
    doctorId: "doctor-2",
    diagnosis: "Contact Dermatitis - allergic reaction to a new skincare product",
    symptoms: ["Rash on arms", "Itching", "Redness"],
    prescription: [
      {
        medication: "Hydrocortisone Cream 1%",
        dosage: "Apply thin layer",
        frequency: "Twice daily",
        duration: "7 days",
        instructions: "Apply to affected areas only. Wash hands after application.",
      },
      {
        medication: "Cetirizine 10mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "5 days",
        instructions: "Take with or without food. May cause drowsiness.",
      },
    ],
    recommendations: [
      "Discontinue use of the new skincare product immediately",
      "Use fragrance-free, hypoallergenic products",
      "Avoid hot showers as they can worsen irritation",
      "Keep the affected area moisturized with gentle lotion",
    ],
    followUpDate: "2024-12-24",
    notes:
      "Patient reported using a new facial cleanser 3 days before symptoms appeared. Classic presentation of allergic contact dermatitis. Advised patch testing if symptoms recur.",
    createdAt: "2024-12-10T12:00:00Z",
    updatedAt: "2024-12-10T12:00:00Z",
  },
  {
    id: "cons-2",
    appointmentId: "apt-4",
    patientId: "patient-1",
    doctorId: "doctor-4",
    diagnosis: "Generalized Anxiety Disorder with sleep disturbance",
    symptoms: ["Anxiety", "Sleep difficulties", "Racing thoughts", "Difficulty concentrating"],
    prescription: [
      {
        medication: "Sertraline 50mg",
        dosage: "1 tablet",
        frequency: "Once daily in the morning",
        duration: "Ongoing - reassess in 6 weeks",
        instructions: "Take with food. May take 4-6 weeks for full effect.",
      },
    ],
    recommendations: [
      "Practice relaxation techniques daily (deep breathing, progressive muscle relaxation)",
      "Maintain a consistent sleep schedule",
      "Limit caffeine intake, especially after noon",
      "Consider starting a mindfulness meditation practice",
      "Regular exercise (30 minutes, 5 times per week)",
    ],
    followUpDate: "2025-01-06",
    notes:
      "Patient has been experiencing increased work-related stress over the past 3 months. Started with mild symptoms that have progressively worsened. Good insight into condition. Motivated for treatment.",
    createdAt: "2024-11-25T10:00:00Z",
    updatedAt: "2024-11-25T10:00:00Z",
  },
]
