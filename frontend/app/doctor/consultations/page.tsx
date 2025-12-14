"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { consultationService } from "@/services"
import { ConsultationSummaryViewModel } from "@/types/backend-types"
import { formatDate } from "@/lib/formatters"
import {
  FileText,
  Calendar,
  User,
  Search,
  Eye,
  Activity,
  AlertCircle,
  Pill,
  Brain
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"


export default function DoctorConsultationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [consultations, setConsultations] = useState<ConsultationSummaryViewModel[]>([])
  const [filteredConsultations, setFilteredConsultations] = useState<ConsultationSummaryViewModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (user?.id) {
      loadConsultations()
    }
  }, [user?.id])

  useEffect(() => {
    // Filter consultations based on search query
    if (searchQuery.trim() === "") {
      setFilteredConsultations(consultations)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = consultations.filter(
        (c) =>
          c.patientName.toLowerCase().includes(query) ||
          c.officialDiagnosis.toLowerCase().includes(query) ||
          (c.consultationNotes && c.consultationNotes.toLowerCase().includes(query))
      )
      setFilteredConsultations(filtered)
    }
  }, [searchQuery, consultations])

  const loadConsultations = async () => {
    try {
      setIsLoading(true)
      const response = await consultationService.getDoctorConsultations(user!.id)

      if (response.success && response.data) {
        // Sort by consultation date, most recent first
        const sorted = response.data.sort(
          (a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime()
        )
        setConsultations(sorted)
        setFilteredConsultations(sorted)
      }
    } catch (error) {
      console.error("Error loading consultations:", error)
      toast({
        title: "Error",
        description: "Failed to load consultations",
        variant: "destructive",
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

  const viewConsultation = (consultation: ConsultationSummaryViewModel) => {
    router.push(`/doctor/consultations/${consultation.appointmentId}?appointmentId=${consultation.appointmentId}`)
  }

  return (
    <DashboardLayout allowedRoles={["doctor"]}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            <FileText className="inline-block mr-2 h-8 w-8 text-blue-600" />
            My Consultations
          </h1>
          <p className="text-slate-600">View and manage your consultation history</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient name, diagnosis, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Consultations</p>
                  <p className="text-3xl font-bold text-blue-600">{consultations.length}</p>
                </div>
                <FileText className="h-12 w-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">AI Predictions Used</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {consultations.filter((c) => c.aiPredictionUsed).length}
                  </p>
                </div>
                <Brain className="h-12 w-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">AI Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {consultations.filter((c) => c.aiDiagnosisConfirmed).length}
                  </p>
                </div>
                <Activity className="h-12 w-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
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
                  You haven't conducted any consultations yet. Check your appointments to start consultations.
                </p>
                <Button onClick={() => router.push("/doctor/appointments")}>View Appointments</Button>
              </div>
            </div>
          </Card>
        )}

        {/* No Search Results */}
        {!isLoading && consultations.length > 0 && filteredConsultations.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Search className="h-12 w-12 text-slate-400" />
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Results Found</h3>
                <p className="text-slate-600">Try adjusting your search query</p>
              </div>
            </div>
          </Card>
        )}

        {/* Consultations List */}
        {!isLoading && filteredConsultations.length > 0 && (
          <div className="grid gap-6">
            {filteredConsultations.map((consultation) => (
              <Card
                key={consultation.consultationRecordId}
                className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                onClick={() => viewConsultation(consultation)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 border-2 border-blue-100">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                          {getInitials(consultation.patientName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl mb-1">{consultation.patientName}</CardTitle>
                        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>
                              {consultation.patientAge} years • {consultation.patientGender}
                            </span>
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                      {consultation.prescriptionsCount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Pill className="h-4 w-4 text-purple-600" />
                          <span className="text-slate-600">
                            {consultation.prescriptionsCount} Prescription{consultation.prescriptionsCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}

                      {consultation.labTestsOrdered && (
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="h-4 w-4 text-teal-600" />
                          <span className="text-slate-600">Lab Tests Ordered</span>
                        </div>
                      )}

                      {consultation.aiPredictionUsed && (
                        <div className="flex items-center gap-2 text-sm">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="text-slate-600">AI Prediction Used</span>
                        </div>
                      )}

                      {consultation.aiDiagnosisConfirmed && consultation.aiPredictionUsed && (
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">AI Confirmed</span>
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
                          viewConsultation(consultation)
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

