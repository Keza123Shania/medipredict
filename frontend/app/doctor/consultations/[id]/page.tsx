"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Calendar,
  Stethoscope,
  Brain,
  Pill,
  FlaskRound,
  ClipboardList,
  Save,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Phone,
  Mail,
  Activity
} from "lucide-react"
import { formatDate } from "@/lib/formatters"
import { consultationService } from "@/services"
import { ConsultationViewModel } from "@/types/backend-types"
import { useToast } from "@/hooks/use-toast"

interface Prescription {
  drugName: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface LabTest {
  testName: string
  testType: string
  outcome: string
  notes: string
}

export default function ConsultationPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [consultation, setConsultation] = useState<ConsultationViewModel | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [labTests, setLabTests] = useState<LabTest[]>([])
  const [isViewOnly, setIsViewOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Get appointmentId from URL query parameter
  const appointmentId = searchParams.get("appointmentId") || params.id as string

  useEffect(() => {
    if (appointmentId && user?.id) {
      loadConsultation()
    }
  }, [appointmentId, user?.id])

  const loadConsultation = async () => {
    try {
      setIsLoading(true)
      const response = await consultationService.getConsultationByAppointment(
        appointmentId,
        user!.id
      )

      if (response.success && response.data) {
        setConsultation(response.data)
        setPrescriptions(response.data.prescriptions || [])
        
        // Parse lab tests if they exist as string (legacy format)
        if (response.data.labTestsOrdered && typeof response.data.labTestsOrdered === 'string') {
          // Split the lab tests string by comma or newline and create entries
          const labTestsList = response.data.labTestsOrdered
            .split(/[,\n]/)
            .map(test => test.trim())
            .filter(test => test.length > 0)
            .map(test => {
              // Parse format: "Test Name (Test Type) - Expected Outcome"
              let testName = test
              let testType = ""
              let outcome = ""
              let notes = ""

              // Extract test type from parentheses
              const typeMatch = test.match(/\(([^)]+)\)/)
              if (typeMatch) {
                testType = typeMatch[1].trim()
                testName = test.substring(0, typeMatch.index).trim()
                test = test.substring(typeMatch.index + typeMatch[0].length).trim()
              }

              // Extract outcome after dash
              const outcomeMatch = test.match(/[-–—]\s*(.+)/)
              if (outcomeMatch) {
                outcome = outcomeMatch[1].trim()
                if (!typeMatch) {
                  testName = test.substring(0, outcomeMatch.index).trim()
                }
              }

              return {
                testName: testName || test,
                testType,
                outcome,
                notes
              }
            })
          setLabTests(labTestsList)
        }
        
        // Set view-only mode if consultation is already completed
        setIsViewOnly(response.data.isCompleted)
      }
    } catch (error) {
      console.error("Error loading consultation:", error)
      toast({
        title: "Error",
        description: "Failed to load consultation data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

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
    updated[index] = { ...updated[index], [field]: value }
    setPrescriptions(updated)
  }

  const addLabTest = () => {
    setLabTests([
      ...labTests,
      { testName: "", testType: "", outcome: "", notes: "" },
    ])
  }

  const removeLabTest = (index: number) => {
    setLabTests(labTests.filter((_, i) => i !== index))
  }

  const updateLabTest = (index: number, field: keyof LabTest, value: string) => {
    const updated = [...labTests]
    updated[index] = { ...updated[index], [field]: value }
    setLabTests(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!consultation) return

    // Validation
    if (!consultation.officialDiagnosis.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide an official diagnosis",
        variant: "destructive"
      })
      return
    }

    // Validate prescriptions
    const invalidPrescription = prescriptions.find(
      p => !p.drugName || !p.dosage || !p.frequency || !p.duration
    )
    if (invalidPrescription) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required prescription fields (drug name, dosage, frequency, duration)",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSaving(true)

      // Convert lab tests array to comma-separated string for backend compatibility
      const labTestsString = labTests
        .map(lt => `${lt.testName} (${lt.testType})${lt.outcome ? ` - ${lt.outcome}` : ''}`)
        .join(', ')

      const saveData: ConsultationViewModel = {
        ...consultation,
        prescriptions: prescriptions.map(p => ({
          drugName: p.drugName,
          dosage: p.dosage,
          frequency: p.frequency,
          duration: p.duration,
          instructions: p.instructions
        })),
        labTestsOrdered: labTestsString
      }

      const response = await consultationService.saveConsultation(saveData)

      if (response.success) {
        toast({
          title: "Success",
          description: "Consultation saved successfully. Appointment marked as completed.",
        })
        router.push("/doctor/dashboard")
      } else {
        throw new Error(response.message || "Failed to save consultation")
      }
    } catch (error: any) {
      console.error("Error saving consultation:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save consultation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const calculateAge = (dob?: string) => {
    if (!dob) return "N/A"
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={["doctor"]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading consultation...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!consultation) {
    return (
      <DashboardLayout allowedRoles={["doctor"]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Consultation Not Found</h2>
            <p className="text-muted-foreground mb-4">
              Unable to load consultation data for this appointment.
            </p>
            <Button asChild>
              <Link href="/doctor/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["doctor"]}>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isViewOnly ? "Consultation Review" : "New Consultation"}
              </h1>
              <p className="text-blue-100">
                {formatDate(consultation.appointmentDate)} • {consultation.patientName}
              </p>
            </div>
            {isViewOnly && (
              <Badge className="bg-green-500 text-white">
                <Activity className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Patient Information */}
            <div className="space-y-6">
              {/* Patient Demographics Card */}
              <Card className="shadow-md">
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <Avatar className="h-16 w-16 border-2 border-blue-200">
                      <AvatarFallback className="bg-blue-600 text-white text-xl">
                        {getInitials(consultation.patientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{consultation.patientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {calculateAge(consultation.patientDateOfBirth)} years • {consultation.patientGender}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{consultation.patientPhone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{consultation.patientEmail || "Not provided"}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Reason for Visit:</p>
                        <p className="text-muted-foreground">{consultation.reasonForVisit}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-sm mb-1">Medical History:</p>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
                        {consultation.patientMedicalHistory || "No significant medical history recorded"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-1">Known Allergies:</p>
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                        {consultation.patientAllergies || "No known allergies"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Prediction Card */}
              {consultation.aiPrediction && (
                <Card className="shadow-md border-blue-200">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                      AI-Powered Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Primary Condition</p>
                      <p className="text-lg font-semibold text-blue-700">
                        {consultation.aiPrediction.primaryCondition}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-muted-foreground">Confidence Score</p>
                        <p className="text-sm font-semibold">
                          {consultation.aiPrediction.confidenceScore.toFixed(1)}%
                        </p>
                      </div>
                      <Progress value={consultation.aiPrediction.confidenceScore} className="h-2" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Symptoms Reported</p>
                      <p className="text-sm">{consultation.aiPrediction.symptomsReported}</p>
                    </div>

                    {consultation.aiPrediction.predictionResults && 
                     consultation.aiPrediction.predictionResults.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Alternative Possibilities</p>
                        <div className="space-y-2">
                          {consultation.aiPrediction.predictionResults.slice(0, 3).map((result, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span>{result.diseaseName}</span>
                              <span className="font-medium">{result.probability.toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-xs text-amber-800">
                        This is an AI-generated prediction for reference only. Please use your clinical judgment for the final diagnosis.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Consultation Form */}
            <div className="space-y-6">
              {/* Official Diagnosis */}
              <Card className="shadow-md">
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Official Diagnosis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="diagnosis" className="font-bold">Final Diagnosis *</Label>
                    <Textarea
                      id="diagnosis"
                      value={consultation.officialDiagnosis}
                      onChange={(e) => setConsultation({ ...consultation, officialDiagnosis: e.target.value })}
                      placeholder="Enter the official medical diagnosis..."
                      rows={3}
                      readOnly={isViewOnly}
                      className="mt-2"
                      required
                    />
                  </div>

                  {consultation.aiPrediction && (
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="ai-confirmed"
                        checked={consultation.aiDiagnosisConfirmed}
                        onCheckedChange={(checked) => 
                          setConsultation({ ...consultation, aiDiagnosisConfirmed: checked as boolean })
                        }
                        disabled={isViewOnly}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="ai-confirmed" className="font-bold cursor-pointer">
                          The AI prediction was accurate
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Check this box if the AI correctly predicted the condition
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Consultation Notes */}
              <Card className="shadow-md">
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    Consultation Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Label htmlFor="notes">Clinical Observations</Label>
                  <Textarea
                    id="notes"
                    value={consultation.consultationNotes}
                    onChange={(e) => setConsultation({ ...consultation, consultationNotes: e.target.value })}
                    placeholder="Record examination findings, patient complaints, and clinical observations..."
                    rows={4}
                    readOnly={isViewOnly}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              {/* Treatment Plan */}
              <Card className="shadow-md">
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="h-5 w-5 text-green-600" />
                    Treatment Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Label htmlFor="treatment">Treatment Recommendations</Label>
                  <Textarea
                    id="treatment"
                    value={consultation.treatmentPlan}
                    onChange={(e) => setConsultation({ ...consultation, treatmentPlan: e.target.value })}
                    placeholder="Outline the recommended treatment plan, follow-up instructions, and lifestyle modifications..."
                    rows={4}
                    readOnly={isViewOnly}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              {/* Prescriptions */}
              <Card className="shadow-md">
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pill className="h-5 w-5 text-orange-600" />
                    Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {prescriptions.map((prescription, index) => (
                    <div key={index} className="p-4 bg-white border-2 border-slate-200 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Drug Name *</Label>
                          <Input
                            value={prescription.drugName}
                            onChange={(e) => updatePrescription(index, "drugName", e.target.value)}
                            placeholder="e.g., Amoxicillin"
                            readOnly={isViewOnly}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Dosage *</Label>
                          <Input
                            value={prescription.dosage}
                            onChange={(e) => updatePrescription(index, "dosage", e.target.value)}
                            placeholder="e.g., 500mg"
                            readOnly={isViewOnly}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Frequency *</Label>
                          <Input
                            value={prescription.frequency}
                            onChange={(e) => updatePrescription(index, "frequency", e.target.value)}
                            placeholder="e.g., 3 times daily"
                            readOnly={isViewOnly}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Duration *</Label>
                          <Input
                            value={prescription.duration}
                            onChange={(e) => updatePrescription(index, "duration", e.target.value)}
                            placeholder="e.g., 7 days"
                            readOnly={isViewOnly}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs">Special Instructions</Label>
                          <Textarea
                            value={prescription.instructions}
                            onChange={(e) => updatePrescription(index, "instructions", e.target.value)}
                            placeholder="e.g., Take after meals"
                            rows={2}
                            readOnly={isViewOnly}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      {!isViewOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrescription(index)}
                          className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}

                  {!isViewOnly && (
                    <Button
                      type="button"
                      onClick={addPrescription}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Prescription
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Lab Tests - Now Multi-Entry */}
              <Card className="shadow-md">
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FlaskRound className="h-5 w-5 text-purple-600" />
                    Lab Tests & Investigations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {labTests.map((labTest, index) => (
                    <div key={index} className="p-4 bg-white border-2 border-slate-200 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Test Name</Label>
                          <Input
                            value={labTest.testName}
                            onChange={(e) => updateLabTest(index, "testName", e.target.value)}
                            placeholder="e.g., Complete Blood Count"
                            readOnly={isViewOnly}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Test Type</Label>
                          <Input
                            value={labTest.testType}
                            onChange={(e) => updateLabTest(index, "testType", e.target.value)}
                            placeholder="e.g., Blood Test"
                            readOnly={isViewOnly}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Expected Outcome</Label>
                          <Input
                            value={labTest.outcome}
                            onChange={(e) => updateLabTest(index, "outcome", e.target.value)}
                            placeholder="e.g., Normal range 4-11"
                            readOnly={isViewOnly}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Additional Notes</Label>
                          <Input
                            value={labTest.notes}
                            onChange={(e) => updateLabTest(index, "notes", e.target.value)}
                            placeholder="e.g., Fasting required"
                            readOnly={isViewOnly}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      {!isViewOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLabTest(index)}
                          className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}

                  {!isViewOnly && (
                    <Button
                      type="button"
                      onClick={addLabTest}
                      variant="outline"
                      className="w-full border-purple-200 hover:bg-purple-50"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lab Test
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!isViewOnly ? (
                  <>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="bg-primary flex-1"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Complete Consultation
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" size="lg" asChild>
                      <Link href="/doctor/dashboard">
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="outline" size="lg" asChild className="flex-1">
                    <Link href="/doctor/dashboard">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Dashboard
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
