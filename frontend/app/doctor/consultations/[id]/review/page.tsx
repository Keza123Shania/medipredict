"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  User,
  Brain,
  FileText,
  Stethoscope,
  Pill,
  FlaskConical,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Trash2,
  Save,
} from "lucide-react"
import Link from "next/link"

// Mock data - would come from API
const consultationData = {
  id: "1",
  patient: {
    name: "Sarah Wilson",
    age: 41,
    gender: "Female",
    phone: "+1 (555) 123-4567",
    email: "sarah.wilson@email.com",
    avatar: "/patient-sarah.jpg",
    reasonForVisit: "Experiencing persistent headaches and dizziness",
    medicalHistory: "Hypertension (diagnosed 2020), Type 2 Diabetes (diagnosed 2018)",
    allergies: "Penicillin, Sulfa drugs",
  },
  aiPrediction: {
    primaryCondition: "Hypertension Risk",
    confidenceScore: 87,
    symptomsReported: "Headaches, Dizziness, Shortness of breath, Chest discomfort",
    probabilityBreakdown: [
      { disease: "Hypertension", probability: 87 },
      { disease: "Migraine", probability: 65 },
      { disease: "Cardiac Arrhythmia", probability: 45 },
      { disease: "Anxiety Disorder", probability: 32 },
      { disease: "Anemia", probability: 28 },
    ],
    aiRecommendations: [
      "Monitor blood pressure regularly",
      "Reduce sodium intake",
      "Increase physical activity",
      "Consider medication evaluation",
    ],
    disclaimer: "This AI prediction is for informational purposes only and should not replace professional medical judgment.",
  },
  submittedAt: "2024-01-15T08:30:00Z",
}

interface Prescription {
  drugName: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export default function ConsultationReviewPage() {
  const router = useRouter()
  const params = useParams()
  const [officialDiagnosis, setOfficialDiagnosis] = useState("")
  const [aiConfirmed, setAiConfirmed] = useState<boolean | null>(null)
  const [consultationNotes, setConsultationNotes] = useState("")
  const [treatmentPlan, setTreatmentPlan] = useState("")
  const [labTests, setLabTests] = useState("")
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { drugName: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ])

  const addPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { drugName: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ])
  }

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
    const updated = [...prescriptions]
    updated[index][field] = value
    setPrescriptions(updated)
  }

  const handleSubmit = () => {
    // Handle form submission
    console.log({
      officialDiagnosis,
      aiConfirmed,
      consultationNotes,
      treatmentPlan,
      labTests,
      prescriptions: prescriptions.filter(p => p.drugName),
    })
    router.push("/doctor/consultations")
  }

  return (
    <DashboardLayout allowedRoles={["doctor"]}>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="border-l-4 border-emerald-600 pl-4">
            <h1 className="text-2xl font-bold text-slate-900">Review & Respond to Consultation</h1>
            <p className="text-slate-600 text-sm">Provide comprehensive medical assessment and treatment plan</p>
          </div>
          <Link href="/doctor/consultations">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Consultations
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Info & AI Prediction */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Information Card */}
            <Card className="border-2 border-slate-200 bg-white shadow-md">
              <CardHeader className="pb-4 bg-white border-b-2 border-emerald-100">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <Avatar className="h-16 w-16 border-2 border-slate-200">
                    <AvatarImage src={consultationData.patient.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-slate-100 text-slate-700">
                      {consultationData.patient.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">{consultationData.patient.name}</h3>
                    <p className="text-sm text-slate-600">
                      {consultationData.patient.age}y, {consultationData.patient.gender}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Phone:</span>
                    <p className="text-slate-600">{consultationData.patient.phone}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Email:</span>
                    <p className="text-slate-600">{consultationData.patient.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Reason for Visit:</span>
                    <p className="text-slate-600">{consultationData.patient.reasonForVisit}</p>
                  </div>
                  {consultationData.patient.medicalHistory && (
                    <div className="pt-2 border-t">
                      <span className="font-medium text-slate-700">Medical History:</span>
                      <p className="text-slate-600 mt-1">{consultationData.patient.medicalHistory}</p>
                    </div>
                  )}
                  {consultationData.patient.allergies && (
                    <div className="pt-2 border-t">
                      <span className="font-medium text-slate-700">Allergies:</span>
                      <p className="text-rose-600 font-medium mt-1">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        {consultationData.patient.allergies}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Prediction Card */}
            <Card className="border-2 border-emerald-200 bg-white shadow-md">
              <CardHeader className="pb-4 bg-white border-b-2 border-emerald-200">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-emerald-600" />
                  </div>
                  AI Prediction Report
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <span className="text-sm font-medium text-slate-600">Primary Condition:</span>
                  <h6 className="text-lg font-semibold mt-1 text-slate-900">
                    {consultationData.aiPrediction.primaryCondition}
                  </h6>
                </div>

                <div>
                  <span className="text-sm font-medium text-slate-600">Confidence Score:</span>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                        style={{ width: `${consultationData.aiPrediction.confidenceScore}%` }}
                      />
                    </div>
                    <span className="font-bold text-emerald-600">
                      {consultationData.aiPrediction.confidenceScore}%
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-slate-600">Symptoms Reported:</span>
                  <p className="text-sm text-slate-700 mt-1">{consultationData.aiPrediction.symptomsReported}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-slate-600">Probability Breakdown:</span>
                  <div className="mt-2 space-y-1">
                    {consultationData.aiPrediction.probabilityBreakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-slate-700">{item.disease}</span>
                        <span className="font-medium text-emerald-600">{item.probability}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-slate-600">AI Recommendations:</span>
                  <ul className="mt-2 space-y-1">
                    {consultationData.aiPrediction.aiRecommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      {consultationData.aiPrediction.disclaimer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Medical Assessment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Official Diagnosis Section */}
            <Card className="border-2 border-slate-200 bg-white shadow-md">
              <CardHeader className="pb-4 bg-white border-b-2 border-slate-200">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-emerald-600" />
                  </div>
                  Official Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <Label htmlFor="diagnosis" className="text-sm font-medium text-slate-700 mb-2 block">
                    Final Diagnosis <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter your official diagnosis..."
                    value={officialDiagnosis}
                    onChange={(e) => setOfficialDiagnosis(e.target.value)}
                    rows={4}
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    AI Diagnosis Accuracy <span className="text-rose-500">*</span>
                  </Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={aiConfirmed === true ? "default" : "outline"}
                      onClick={() => setAiConfirmed(true)}
                      className={aiConfirmed === true ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      AI Prediction Confirmed
                    </Button>
                    <Button
                      type="button"
                      variant={aiConfirmed === false ? "default" : "outline"}
                      onClick={() => setAiConfirmed(false)}
                      className={aiConfirmed === false ? "bg-amber-600 hover:bg-amber-700" : ""}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      AI Prediction Not Confirmed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Notes Section */}
            <Card className="border-2 border-slate-200 bg-white shadow-md">
              <CardHeader className="pb-4 bg-white border-b-2 border-slate-200">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-emerald-600" />
                  </div>
                  Consultation Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  placeholder="Enter detailed consultation notes, observations, and findings..."
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  rows={5}
                  className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </CardContent>
            </Card>

            {/* Treatment Plan Section */}
            <Card className="border-2 border-slate-200 bg-white shadow-md">
              <CardHeader className="pb-4 bg-white border-b-2 border-slate-200">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-emerald-600" />
                  </div>
                  Treatment Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  placeholder="Enter comprehensive treatment plan, recommendations, and follow-up instructions..."
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  rows={5}
                  className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </CardContent>
            </Card>

            {/* Prescriptions Section */}
            <Card className="border-2 border-slate-200 bg-white shadow-md">
              <CardHeader className="pb-4 bg-white border-b-2 border-slate-200">
                <CardTitle className="text-base font-bold flex items-center justify-between text-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Pill className="h-4 w-4 text-emerald-600" />
                    </div>
                    Prescriptions
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addPrescription}
                    className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Prescription
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {prescriptions.map((prescription, index) => (
                  <Card key={index} className="border-2 border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-slate-900">Prescription {index + 1}</h4>
                        {prescriptions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePrescription(index)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label className="text-xs font-medium text-slate-700">Drug Name</Label>
                          <Input
                            placeholder="e.g., Lisinopril"
                            value={prescription.drugName}
                            onChange={(e) => updatePrescription(index, "drugName", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Dosage</Label>
                          <Input
                            placeholder="e.g., 10mg"
                            value={prescription.dosage}
                            onChange={(e) => updatePrescription(index, "dosage", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Frequency</Label>
                          <Input
                            placeholder="e.g., Once daily"
                            value={prescription.frequency}
                            onChange={(e) => updatePrescription(index, "frequency", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs font-semibold text-slate-700">Duration</Label>
                          <Input
                            placeholder="e.g., 30 days"
                            value={prescription.duration}
                            onChange={(e) => updatePrescription(index, "duration", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs font-semibold text-slate-700">Instructions</Label>
                          <Textarea
                            placeholder="Special instructions for patient..."
                            value={prescription.instructions}
                            onChange={(e) => updatePrescription(index, "instructions", e.target.value)}
                            rows={2}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Lab Tests Section */}
            <Card className="border-2 border-slate-200 bg-white shadow-md">
              <CardHeader className="pb-4 bg-white border-b-2 border-slate-200">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <FlaskConical className="h-4 w-4 text-emerald-600" />
                  </div>
                  Lab Tests Ordered
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  placeholder="Enter lab tests ordered (e.g., Complete Blood Count, Lipid Panel, HbA1c)..."
                  value={labTests}
                  onChange={(e) => setLabTests(e.target.value)}
                  rows={4}
                  className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/doctor/consultations">
                <Button variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!officialDiagnosis || aiConfirmed === null}
                className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg"
              >
                <Save className="mr-2 h-5 w-5" />
                Submit Consultation Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
