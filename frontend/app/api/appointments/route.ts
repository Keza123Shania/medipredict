import { NextResponse } from "next/server"
import { mockAppointments } from "@/mocks/data/appointments"
import { mockDoctors } from "@/mocks/data/users"
import type { Appointment } from "@/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  let filteredAppointments = [...mockAppointments]

  if (status && status !== "all") {
    filteredAppointments = filteredAppointments.filter((a) => a.status === status)
  }

  // Sort by date descending
  filteredAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const total = filteredAppointments.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const appointments = filteredAppointments.slice(start, start + limit)

  return NextResponse.json({
    appointments,
    total,
    page,
    totalPages,
  })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const doctor = mockDoctors.find((d) => d.id === data.doctorId)

    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 })
    }

    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: "patient-1", // Would come from auth in real app
      doctorId: data.doctorId,
      date: data.date,
      startTime: data.timeSlot,
      endTime: calculateEndTime(data.timeSlot, 30),
      type: data.type,
      status: "pending",
      reason: data.reason,
      symptoms: data.symptoms,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: {
        id: "patient-1",
        firstName: "John",
        lastName: "Doe",
      },
      doctor: {
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
      },
    }

    return NextResponse.json(appointment)
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, mins] = startTime.split(":").map(Number)
  const totalMins = hours * 60 + mins + durationMinutes
  return `${Math.floor(totalMins / 60)
    .toString()
    .padStart(2, "0")}:${(totalMins % 60).toString().padStart(2, "0")}`
}
