import { NextResponse } from "next/server"
import { mockPredictions, symptomCategories } from "@/mocks/data/predictions"
import type { PredictionResult, PredictedCondition } from "@/types"

export async function GET() {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json(mockPredictions)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate mock prediction based on symptoms
    const prediction = generateMockPrediction(data)

    return NextResponse.json(prediction)
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function generateMockPrediction(input: {
  symptoms: string[]
  age: number
  gender: string
}): PredictionResult {
  // Map symptom IDs to names
  const allSymptoms = symptomCategories.flatMap((c) => c.symptoms)
  const symptomNames = input.symptoms.map((id) => allSymptoms.find((s) => s.id === id)?.name || id).join(", ")

  // Generate conditions based on symptoms
  const conditions: PredictedCondition[] = []

  // Simple mock logic - in real app this would be ML model
  if (input.symptoms.some((s) => ["fever", "cough", "fatigue", "runny-nose", "congestion"].includes(s))) {
    conditions.push({
      name: "Common Cold",
      probability: 0.65 + Math.random() * 0.2,
      description: "A viral infection affecting the upper respiratory tract.",
      urgency: "low",
      commonTreatments: ["Rest", "Hydration", "Over-the-counter cold medicine", "Warm liquids"],
      whenToSeekHelp: ["Symptoms persist beyond 10 days", "High fever (above 103°F)", "Difficulty breathing"],
    })
  }

  if (input.symptoms.some((s) => ["headache", "dizziness", "fatigue", "stress"].includes(s))) {
    conditions.push({
      name: "Tension Headache",
      probability: 0.55 + Math.random() * 0.15,
      description: "A common type of headache often associated with stress and muscle tension.",
      urgency: "low",
      commonTreatments: ["Pain relievers", "Rest", "Stress management", "Good posture"],
      whenToSeekHelp: ["Severe or sudden headache", "Headache with fever and stiff neck", "Vision changes"],
    })
  }

  if (input.symptoms.some((s) => ["chest-pain", "shortness-breath", "palpitations"].includes(s))) {
    conditions.push({
      name: "Possible Cardiac Issue",
      probability: 0.4 + Math.random() * 0.2,
      description: "Symptoms that may indicate heart-related concerns requiring evaluation.",
      urgency: "high",
      commonTreatments: ["Medical evaluation required", "ECG/EKG", "Stress test", "Lifestyle modifications"],
      whenToSeekHelp: ["Chest pain radiating to arm or jaw", "Sudden severe shortness of breath", "Fainting"],
    })
  }

  if (input.symptoms.some((s) => ["anxiety", "depression", "insomnia", "panic-attacks"].includes(s))) {
    conditions.push({
      name: "Anxiety/Stress-Related Symptoms",
      probability: 0.5 + Math.random() * 0.2,
      description: "Physical and emotional symptoms that may be related to anxiety or stress.",
      urgency: "medium",
      commonTreatments: ["Therapy", "Relaxation techniques", "Exercise", "Sleep hygiene"],
      whenToSeekHelp: ["Symptoms interfere with daily life", "Thoughts of self-harm", "Panic attacks"],
    })
  }

  // Default condition if no specific match
  if (conditions.length === 0) {
    conditions.push({
      name: "General Health Concern",
      probability: 0.5,
      description: "Your symptoms require further evaluation by a healthcare professional.",
      urgency: "medium",
      commonTreatments: ["Professional medical evaluation", "Symptom monitoring", "Rest"],
      whenToSeekHelp: ["Symptoms worsen", "New symptoms develop", "No improvement after 7 days"],
    })
  }

  // Sort by probability
  conditions.sort((a, b) => b.probability - a.probability)

  // Determine overall urgency
  const urgencies = conditions.map((c) => c.urgency)
  const overallUrgency = urgencies.includes("critical")
    ? "critical"
    : urgencies.includes("high")
      ? "high"
      : urgencies.includes("medium")
        ? "medium"
        : "low"

  // Generate recommendations
  const recommendations = [
    "Monitor your symptoms and track any changes",
    "Maintain adequate hydration and rest",
    overallUrgency === "high" || overallUrgency === "critical"
      ? "Seek medical attention promptly"
      : "Consider scheduling an appointment if symptoms persist",
    "Keep a symptom diary to share with your healthcare provider",
  ]

  // Suggested specializations based on conditions
  const specializations = new Set<string>()
  if (conditions.some((c) => c.name.includes("Cardiac"))) specializations.add("Cardiology")
  if (conditions.some((c) => c.name.includes("Anxiety"))) specializations.add("Psychiatry")
  if (specializations.size === 0) specializations.add("General Practice")

  return {
    id: `pred-${Date.now()}`,
    userId: "patient-1",
    createdAt: new Date().toISOString(),
    input: {
      symptoms: input.symptoms,
      age: input.age,
      gender: input.gender as "male" | "female" | "other",
    },
    conditions,
    overallUrgency,
    recommendations,
    suggestedSpecializations: Array.from(specializations),
  }
}
