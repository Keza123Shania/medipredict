"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  DollarSign,
  FileText,
  AlertCircle,
  Copy,
  Download,
  Home,
  ClipboardList,
  Loader2
} from "lucide-react"
import { formatCurrency } from "@/lib/formatters"
import { appointmentService } from "@/services"
import type { AppointmentDetailViewModel } from "@/types/backend-types"

function ConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const confirmationNumber = searchParams.get("number")
  const { toast } = useToast()
  const { user } = useAuth()

  const [appointment, setAppointment] = useState<AppointmentDetailViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (confirmationNumber) {
      loadAppointment()
    } else {
      setLoading(false)
    }
  }, [confirmationNumber])

  const loadAppointment = async () => {
    if (!confirmationNumber) return
    try {
      setLoading(true)
      // Get all appointments and find by confirmation number
      const response = await appointmentService.getAppointments()
      if (response.success && response.data) {
        const foundAppointment = response.data.find(
          (apt) => apt.confirmationNumber === confirmationNumber
        )
        if (foundAppointment) {
          setAppointment(foundAppointment)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointment details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyConfirmationNumber = () => {
    if (confirmationNumber) {
      navigator.clipboard.writeText(confirmationNumber)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Confirmation number copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (!confirmationNumber) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="h-16 w-16 text-amber-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">No Confirmation Number</h1>
        <p className="text-slate-600 mb-6">Unable to display confirmation details</p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/patient/appointments">View My Appointments</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Appointment Booked Successfully!</h1>
        <p className="text-slate-600 text-lg">Your consultation has been scheduled</p>
      </div>

      {/* Confirmation Number Card */}
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-emerald-900">Confirmation Number</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-6 border-2 border-emerald-300 shadow-inner">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <p className="text-3xl md:text-4xl font-mono font-bold text-emerald-700 tracking-wider">
                  {confirmationNumber}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyConfirmationNumber}
                className="border-2 border-emerald-600 hover:bg-emerald-50"
              >
                {copied ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Copy className="h-5 w-5 text-emerald-600" />
                )}
              </Button>
            </div>
            <p className="text-sm text-slate-600 text-center mt-3">
              Save this number for your records. You'll need it to reference your appointment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details */}
      {appointment && (
        <Card className="border-2 border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <User className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600 mb-1">Doctor</p>
                  <p className="font-semibold text-slate-900">{appointment.doctorName}</p>
                  <p className="text-sm text-emerald-700">{appointment.doctorSpecialization}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600 mb-1">Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(appointment.appointmentDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Clock className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600 mb-1">Time</p>
                  <p className="font-semibold text-slate-900">{formatTime(appointment.appointmentTime)}</p>
                  <p className="text-sm text-slate-600">Duration: {appointment.durationMinutes} minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600 mb-1">Consultation Fee</p>
                  <p className="font-semibold text-slate-900 text-xl">{formatCurrency(appointment.consultationFee)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Reason for Visit</p>
              <p className="text-slate-900">{appointment.reasonForVisit}</p>
            </div>

            {appointment.additionalNotes && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Additional Notes</p>
                <p className="text-slate-900">{appointment.additionalNotes}</p>
              </div>
            )}

            <div className="flex items-center gap-2 justify-center pt-2">
              <span className="text-sm text-slate-600">Status:</span>
              <Badge className="bg-amber-600">
                {appointment.status || "Scheduled"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Instructions */}
      <Card className="border-2 border-blue-200 bg-blue-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <DollarSign className="h-5 w-5" />
            Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-900">
          <p className="font-semibold">Please complete payment to confirm your appointment:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Payment must be completed before the appointment date</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Your appointment will be confirmed once payment is received</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>You will receive a confirmation email with payment receipt</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>Contact our support team if you need assistance with payment</span>
            </li>
          </ul>
          {appointment && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-300">
              <p className="text-sm font-semibold mb-2">Amount Due:</p>
              <p className="text-3xl font-bold text-blue-700">{formatCurrency(appointment.consultationFee)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card className="border-2 border-amber-200 bg-amber-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-5 w-5" />
            Cancellation Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-amber-900">
          <p className="font-semibold">Please review our cancellation policy:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span>Cancellations must be made at least 24 hours in advance</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span>Full refund available for cancellations made 24+ hours before appointment</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span>Late cancellations (less than 24 hours) may incur a 50% cancellation fee</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span>No-shows will be charged the full consultation fee</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span>To cancel or reschedule, visit your appointments page or contact support</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4 pt-4">
        <Button
          variant="outline"
          size="lg"
          asChild
          className="border-2 border-emerald-600 hover:bg-emerald-50 font-semibold"
        >
          <Link href="/patient/appointments">
            <ClipboardList className="mr-2 h-5 w-5" />
            View All Appointments
          </Link>
        </Button>

        <Button
          size="lg"
          asChild
          className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
        >
          <Link href="/patient/dashboard">
            <Home className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Important Reminder */}
      <Card className="border-2 border-slate-200 bg-slate-50 shadow-md">
        <CardContent className="pt-6 space-y-2 text-sm text-slate-700">
          <p className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>A confirmation email has been sent to your registered email address</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Please arrive 10 minutes before your scheduled appointment time</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Bring your confirmation number and valid ID to your appointment</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>If you have any questions, please contact our support team</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <Suspense fallback={
        <div className="max-w-3xl mx-auto text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading confirmation details...</p>
        </div>
      }>
        <ConfirmationContent />
      </Suspense>
    </DashboardLayout>
  )
}
