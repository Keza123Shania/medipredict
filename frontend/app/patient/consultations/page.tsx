"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { consultationService, profileService } from "@/services"
import { ConsultationSummaryViewModel } from "@/types/backend-types"
import { formatDate } from "@/lib/formatters"
import {
  FileText,
  Calendar,
  User,
  Stethoscope,
  Pill,
  Activity,
  Eye,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PatientConsultationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [consultations, setConsultations] = useState<ConsultationSummaryViewModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [patientId, setPatientId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadPatientProfile()
    }
  }, [user?.id])

  useEffect(() => {
    if (patientId) {
      loadConsultations()
    }
  }, [patientId])

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
      }
    } catch (error) {
      console.error("Error loading patient profile:", error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to load patient profile",
        variant: "destructive"
      })
    }
  }

  const loadConsultations = async () => {
    try {
      setIsLoading(true)
      const response = await consultationService.getPatientConsultationHistory(patientId!)

      if (response.success && response.data) {
        // Sort by consultation date, most recent first
        const sorted = response.data.sort((a, b) => 
          new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime()
        )
        setConsultations(sorted)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load consultation history",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error loading consultations:", error)
      toast({
        title: "Error",
        description: "Failed to load consultation history",
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

  const viewConsultation = (consultationId: string) => {
    router.push(`/patient/consultations/${consultationId}`)
  }

  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            <FileText className="inline-block mr-2 h-8 w-8 text-blue-600" />
            My Consultations
          </h1>
          <p className="text-slate-600">View your medical consultation history and records</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && consultations.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-slate-100 p-6">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Consultations Yet</h3>
                <p className="text-slate-600 mb-6">
                  You haven't had any consultations yet. Book an appointment to get started.
                </p>
                <Button onClick={() => router.push("/patient/appointments")}>
                  Book Appointment
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Consultations List */}
        {!isLoading && consultations.length > 0 && (
          <div className="grid gap-6">
            {consultations.map((consultation) => (
              <Card
                key={consultation.consultationRecordId}
                className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                onClick={() => viewConsultation(consultation.consultationRecordId!)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 border-2 border-blue-100">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                          {getInitials(consultation.doctorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl mb-1">
                          Dr. {consultation.doctorName}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Stethoscope className="h-4 w-4" />
                            <span>{consultation.doctorSpecialization}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(consultation.consultationDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                      <Activity className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Diagnosis */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-slate-900">Diagnosis:</span>
                      </div>
                      <p className="text-slate-700 pl-6">{consultation.officialDiagnosis}</p>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      {consultation.prescriptions && consultation.prescriptions.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Pill className="h-4 w-4 text-purple-600" />
                          <span className="text-slate-600">
                            {consultation.prescriptions.length} Prescription{consultation.prescriptions.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      
                      {consultation.labTestsOrdered && (
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="h-4 w-4 text-teal-600" />
                          <span className="text-slate-600">Lab Tests Ordered</span>
                        </div>
                      )}

                      {consultation.aiPrediction && (
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <span className="text-slate-600">
                            AI Prediction: {consultation.aiPrediction.primaryCondition}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          viewConsultation(consultation.consultationRecordId!)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Full Consultation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
