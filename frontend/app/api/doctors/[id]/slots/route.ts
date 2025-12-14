import { NextResponse } from "next/server"
import { mockDoctors } from "@/mocks/data/users"
import { mockAppointments } from "@/mocks/data/appointments"
import type { TimeSlot } from "@/types"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")

  if (!date) {
    return NextResponse.json({ message: "Date is required" }, { status: 400 })
  }

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const doctor = mockDoctors.find((d) => d.id === id)

  if (!doctor) {
    return NextResponse.json({ message: "Doctor not found" }, { status: 404 })
  }

  const requestedDate = new Date(date)
  const dayOfWeek = requestedDate.getDay() === 0 ? 7 : requestedDate.getDay()

  const availability = doctor.availability.find((a) => a.dayOfWeek === dayOfWeek)

  if (!availability) {
    return NextResponse.json([])
  }

  // Generate time slots
  const slots: TimeSlot[] = []
  const [startHour, startMin] = availability.startTime.split(":").map(Number)
  const [endHour, endMin] = availability.endTime.split(":").map(Number)
  const slotDuration = availability.slotDuration

  let currentTime = startHour * 60 + startMin
  const endTime = endHour * 60 + endMin

  // Get existing appointments for this doctor on this date
  const existingAppointments = mockAppointments.filter(
    (apt) => apt.doctorId === id && apt.date === date && apt.status !== "cancelled",
  )

  while (currentTime + slotDuration <= endTime) {
    const hours = Math.floor(currentTime / 60)
    const mins = currentTime % 60
    const timeString = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`

    const isBooked = existingAppointments.some((apt) => apt.startTime === timeString)

    slots.push({
      id: `${id}-${date}-${timeString}`,
      startTime: timeString,
      endTime: `${Math.floor((currentTime + slotDuration) / 60)
        .toString()
        .padStart(2, "0")}:${((currentTime + slotDuration) % 60).toString().padStart(2, "0")}`,
      isAvailable: !isBooked,
    })

    currentTime += slotDuration
  }

  return NextResponse.json(slots)
}
