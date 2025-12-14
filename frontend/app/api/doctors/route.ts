import { NextResponse } from "next/server"
import { mockDoctors } from "@/mocks/data/users"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const specialization = searchParams.get("specialization")
  const search = searchParams.get("search")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  let filteredDoctors = mockDoctors.filter((d) => d.isVerified)

  if (specialization && specialization !== "all") {
    filteredDoctors = filteredDoctors.filter((d) => d.specialization.toLowerCase() === specialization.toLowerCase())
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filteredDoctors = filteredDoctors.filter(
      (d) =>
        d.firstName.toLowerCase().includes(searchLower) ||
        d.lastName.toLowerCase().includes(searchLower) ||
        d.specialization.toLowerCase().includes(searchLower),
    )
  }

  const total = filteredDoctors.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const doctors = filteredDoctors.slice(start, start + limit)

  return NextResponse.json({
    doctors,
    total,
    page,
    totalPages,
  })
}
