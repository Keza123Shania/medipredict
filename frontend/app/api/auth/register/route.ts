import { NextResponse } from "next/server"
import { findUserByEmail } from "@/mocks/data/users"
import type { Patient, Doctor } from "@/types"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if user exists
    if (findUserByEmail(data.email)) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 })
    }

    // Create new user based on role
    const baseUser = {
      id: `${data.role}-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    let user: Patient | Doctor

    if (data.role === "patient") {
      user = {
        ...baseUser,
        role: "patient",
        allergies: [],
        chronicConditions: [],
      } as Patient
    } else {
      user = {
        ...baseUser,
        role: "doctor",
        specialization: data.specialization || "General Practice",
        licenseNumber: data.licenseNumber || "",
        experience: 0,
        education: [],
        languages: ["English"],
        consultationFee: 100,
        rating: 0,
        reviewCount: 0,
        isVerified: false,
        availability: [],
      } as Doctor
    }

    // Generate mock JWT token
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    }
    const token = btoa(JSON.stringify(tokenPayload))

    return NextResponse.json({ user, token })
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
