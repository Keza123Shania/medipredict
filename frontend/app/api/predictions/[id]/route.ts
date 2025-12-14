import { NextResponse } from "next/server"
import { mockPredictions } from "@/mocks/data/predictions"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const prediction = mockPredictions.find((p) => p.id === id)

  if (!prediction) {
    return NextResponse.json({ message: "Prediction not found" }, { status: 404 })
  }

  return NextResponse.json(prediction)
}
