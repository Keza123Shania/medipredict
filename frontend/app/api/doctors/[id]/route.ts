import { NextResponse } from "next/server"
import { mockDoctors } from "@/mocks/data/users"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const doctor = mockDoctors.find((d) => d.id === id)

  if (!doctor) {
    return NextResponse.json({ message: "Doctor not found" }, { status: 404 })
  }

  return NextResponse.json(doctor)
}
