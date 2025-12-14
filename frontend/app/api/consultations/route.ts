import { NextResponse } from "next/server"
import { mockConsultations } from "@/mocks/data/consultations"
import type { Consultation } from "@/types"

export async function GET() {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json(mockConsultations)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const consultation: Consultation = {
      id: `cons-${Date.now()}`,
      appointmentId: data.appointmentId,
      patientId: "patient-1", // Would come from appointment in real app
      doctorId: "doctor-1", // Would come from auth in real app
      diagnosis: data.diagnosis,
      symptoms: data.symptoms,
      prescription: data.prescription || [],
      recommendations: data.recommendations,
      followUpDate: data.followUpDate,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(consultation)
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
