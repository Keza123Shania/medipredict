import { NextResponse } from "next/server"
import { findUserByEmail } from "@/mocks/data/users"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // For mock purposes, accept any password with valid email
    const user = findUserByEmail(email)

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Generate mock JWT token
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    }
    const token = btoa(JSON.stringify(tokenPayload))

    return NextResponse.json({ user, token })
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
