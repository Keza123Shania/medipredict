"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { consultationService, profileService } from "@/services"
import { ConsultationViewModel } from "@/types/backend-types"
import { formatDate } from "@/lib/formatters"
import {
  ArrowLeft,
  Calendar,
  User,
  Stethoscope,
  FileText,
  Pill,
  Activity,
  Brain,
  AlertCircle,
  ClipboardList
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PatientConsultationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [consultation, setConsultation] = useState<ConsultationViewModel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [patientId, setPatientId] = useState<string | null>(null)

  const consultationId = params.id as string

  useEffect(() => {
    if (user?.id) {
      loadPatientProfile()
    }
  }, [user?.id])

  useEffect(() => {
    if (patientId && consultationId) {
      loadFullConsultation()
    }
  }, [patientId, consultationId])

  const loadPatientProfile = async () => {
    try {
      const response = await profileService.getPatientProfile(user!.id)
      if (response.success && response.data) {
        setPatientId(response.data.patientId)
      } else {
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Patient profile not found",
          variant: "destructive"
        })
        router.push("/patient/consultations")
      }
    } catch (error) {
      console.error("Error loading patient profile:", error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to load patient profile",
        variant: "destructive"
      })
      router.push("/patient/consultations")
    }
  }

  const loadFullConsultation = async () => {
    if (!patientId) {
      console.error("Patient ID not found")
      return
    }

    try {
      setIsLoading(true)
      // Get full consultation details using patientId and consultationRecordId
      const response = await consultationService.getPatientConsultationDetail(
        patientId,
        consultationId
      )

      if (response.success && response.data) {
        setConsultation(response.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load consultation details",
          variant: "destructive"
        })
        router.push("/patient/consultations")
      }
    } catch (error) {
      console.error("Error loading full consultation:", error)
      toast({
        title: "Error",
        description: "Failed to load consultation details",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={["patient"]}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!consultation) {
    return (
      <DashboardLayout allowedRoles={["patient"]}>
        <div className="max-w-5xl mx-auto">
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Consultation Not Found</h3>
            <Button onClick={() => router.push("/patient/consultations")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Consultations
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/patient/consultations")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Consultations
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Consultation Details</h1>
              <p className="text-slate-600">{formatDate(consultation.consultationDate)}</p>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800 text-lg px-4 py-2">
              <Activity className="mr-2 h-4 w-4" />
              Completed
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Doctor Info & AI Prediction */}
          <div className="lg:col-span-1 space-y-6">
            {/* Doctor Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Doctor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4 border-2 border-blue-100">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-semibold">
                      {getInitials(consultation.doctorName)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">Dr. {consultation.doctorName}</h3>
                  <p className="text-sm text-slate-600 mb-4">{consultation.doctorSpecialization}</p>
                  
                  <Separator className="my-4" />
                  
                  <div className="w-full space-y-2 text-left">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-700">{formatDate(consultation.consultationDate)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Prediction Card (if available) */}
            {consultation.aiPrediction && (
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Primary Condition</p>
                    <p className="font-semibold text-purple-900">{consultation.aiPrediction.primaryCondition}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Confidence</span>
                      <span className="text-sm font-semibold text-purple-900">
                        {(consultation.aiPrediction.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={consultation.aiPrediction.confidenceScore * 100} className="h-2" />
                  </div>

                  {consultation.aiDiagnosisConfirmed ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        AI prediction confirmed by doctor
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Doctor diagnosis differs from AI
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Consultation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Diagnosis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Official Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-slate-900">{consultation.officialDiagnosis}</p>
              </CardContent>
            </Card>

            {/* Consultation Notes */}
            {consultation.consultationNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    Consultation Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{consultation.consultationNotes}</p>
                </CardContent>
              </Card>
            )}

            {/* Treatment Plan */}
            {consultation.treatmentPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    Treatment Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{consultation.treatmentPlan}</p>
                </CardContent>
              </Card>
            )}

            {/* Prescriptions */}
            {consultation.prescriptions && consultation.prescriptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-purple-600" />
                    Prescriptions ({consultation.prescriptions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {consultation.prescriptions.map((prescription, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-slate-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Medication</p>
                            <p className="font-semibold text-slate-900">{prescription.drugName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Dosage</p>
                            <p className="font-semibold text-slate-900">{prescription.dosage}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Frequency</p>
                            <p className="text-slate-700">{prescription.frequency}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Duration</p>
                            <p className="text-slate-700">{prescription.duration}</p>
                          </div>
                          {prescription.instructions && (
                            <div className="col-span-2">
                              <p className="text-xs text-slate-600 mb-1">Special Instructions</p>
                              <p className="text-slate-700">{prescription.instructions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lab Tests */}
            {consultation.labTestsOrdered && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-teal-600" />
                    Lab Tests Ordered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{consultation.labTestsOrdered}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
