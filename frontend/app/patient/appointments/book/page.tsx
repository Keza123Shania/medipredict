"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Star, Loader2, CheckCircle, Clock, Calendar as CalendarIcon, AlertCircle, User, Brain } from "lucide-react"
import { formatCurrency, getInitials } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { doctorService, appointmentService } from "@/services"
import type { DoctorProfileViewModel } from "@/types/backend-types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TimeSlot {
  startTime: string
  endTime: string
  isAvailable: boolean
  dateTime: string
}

function BookAppointmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctor")
  const symptomEntryId = searchParams.get("symptomEntryId")
  const { toast } = useToast()
  const { user } = useAuth()

  const [doctor, setDoctor] = useState<DoctorProfileViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [booking, setBooking] = useState(false)
  const [existingAppointment, setExistingAppointment] = useState<any>(null)
  const [checkingExisting, setCheckingExisting] = useState(true)

  useEffect(() => {
    if (doctorId) {
      loadDoctor()
      checkExistingAppointment()
    }
  }, [doctorId])

  useEffect(() => {
    if (selectedDate && doctorId) {
      loadTimeSlots()
    }
  }, [selectedDate, doctorId])

  const loadDoctor = async () => {
    if (!doctorId) return
    try {
      setLoading(true)
      const response = await doctorService.getDoctor(doctorId)
      if (response.success && response.data) {
        setDoctor(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkExistingAppointment = async () => {
    if (!doctorId || !user?.id) {
      console.log('Skipping existing appointment check - missing doctorId or user.id:', { doctorId, userId: user?.id })
      setCheckingExisting(false)
      return
    }
    try {
      setCheckingExisting(true)
      console.log('Checking existing appointments for user:', user.id, 'with doctor:', doctorId)
      const response = await appointmentService.getAppointments({ userId: user.id, role: "patient" })
      console.log('Appointments response:', response)
      
      if (response.success && response.data) {
        console.log('All appointments:', response.data.appointments)
        // Find any scheduled or confirmed appointment with this doctor
        const existing = response.data.appointments?.find(
          (apt: any) => 
            apt.doctorId === doctorId && 
            (apt.status === "Scheduled" || apt.status === "Confirmed") &&
            new Date(apt.appointmentDate) >= new Date()
        )
        console.log('Existing appointment found:', existing)
        setExistingAppointment(existing || null)
      }
    } catch (error) {
      console.error("Error checking existing appointments:", error)
    } finally {
      setCheckingExisting(false)
    }
  }

  const loadTimeSlots = async () => {
    if (!doctorId || !selectedDate) return
    try {
      setLoadingSlots(true)
      setSelectedSlot(null)
      const dateString = selectedDate.toISOString().split('T')[0]
      const response = await doctorService.getAvailableTimeSlots(doctorId, dateString)
      if (response.success && response.data) {
        setTimeSlots(response.data)
      }
    } catch (error) {
      console.error("Error loading time slots:", error)
      setTimeSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleBook = async () => {
    if (!doctorId || !selectedDate || !selectedSlot || !reason.trim() || !user?.id) return

    try {
      setBooking(true)
      const dateString = selectedDate.toISOString().split('T')[0]
      
      const response = await appointmentService.createAppointment({
        userId: user.id,
        doctorId: doctorId,
        appointmentDate: dateString,
        appointmentTime: selectedSlot.startTime,
        durationMinutes: 30,
        reasonForVisit: reason,
        additionalNotes: notes,
        symptomEntryId: symptomEntryId || undefined
      })

      if (response.success) {
        toast({
          title: "Appointment Booked!",
          description: "Redirecting to confirmation page...",
        })
        // Redirect to confirmation page with appointment data
        const confirmationNumber = response.data?.confirmationNumber || "N/A"
        router.push(`/patient/appointments/confirmation?number=${confirmationNumber}`)
      } else {
        toast({
          title: "Booking Failed",
          description: response.message || "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setBooking(false)
    }
  }

  const isDayAvailable = (date: Date) => {
    if (!doctor?.availableDays) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return false
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const availableDays = doctor.availableDays.map(d => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase())
    return availableDays.includes(dayName)
  }

  const formatTime12Hour = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (!doctorId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-amber-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">No doctor selected</h1>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/patient/doctors">Browse Doctors</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Doctor not found</h1>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/patient/doctors">Browse Doctors</Link>
        </Button>
      </div>
    )
  }

  const availableSlots = timeSlots.filter(s => s.isAvailable)
  const bookedSlots = timeSlots.filter(s => !s.isAvailable)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" asChild className="mb-2 -ml-3">
        <Link href="/patient/doctors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Doctors
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 border-l-4 border-emerald-600 pl-4 mb-2">Book Appointment</h1>
        <p className="text-slate-600 text-sm pl-5">Schedule your consultation with the doctor</p>
      </div>

      {/* AI Prediction Alert */}
      {symptomEntryId && (
        <Alert className="border-blue-200 bg-blue-50">
          <Brain className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>AI Prediction Attached:</strong> Your symptom analysis will be shared with the doctor to assist with diagnosis.
          </AlertDescription>
        </Alert>
      )}

      {/* Existing Appointment Alert */}
      {existingAppointment && (
        <Card className="border-2 border-amber-200 bg-amber-50 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 mb-1">Existing Appointment</h3>
                <p className="text-sm text-amber-800 mb-2">
                  You already have an appointment with this doctor scheduled for{" "}
                  <span className="font-semibold">
                    {new Date(existingAppointment.appointmentDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>{" "}
                  at <span className="font-semibold">{existingAppointment.appointmentTime}</span>.
                </p>
                <p className="text-xs text-amber-700">
                  You can only book a new appointment after your current appointment is completed or cancelled.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor Info Card */}
      <Card className="border-2 border-slate-200 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 h-20"></div>
        <CardContent className="p-6 -mt-10">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarImage 
                src={doctor.profilePicture ? `https://localhost:7146${doctor.profilePicture}` : undefined}
              />
              <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">
                {getInitials(doctor.fullName || "Unknown")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{doctor.fullName}</h2>
                {doctor.isVerified && (
                  <Badge className="bg-blue-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-lg text-emerald-700 font-semibold mb-3">{doctor.specialization}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{doctor.averageRating?.toFixed(1) || "5.0"}</span>
                  <span className="text-slate-500">({doctor.totalReviews || 0} reviews)</span>
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-slate-600" />
                  <span className="text-slate-600">{doctor.experience} years experience</span>
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-slate-600" />
                  <span className="text-slate-600">{doctor.totalPatients || 0} patients</span>
                </div>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-sm text-slate-600 mb-1">Consultation Fee</p>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(doctor.consultationFee)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <div className={cn("grid md:grid-cols-2 gap-6", existingAppointment && "opacity-50 pointer-events-none")}>
        {/* Date & Time Selection */}
        <Card className="border-2 border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-600" />
              Select Date & Time
            </CardTitle>
            <CardDescription>Choose your preferred appointment slot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block font-semibold">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date)
                  setSelectedSlot(null)
                }}
                disabled={(date) => !isDayAvailable(date)}
                className="rounded-md border-2 border-slate-200 p-3"
              />
              <p className="text-xs text-slate-500 mt-2">
                Available days: {doctor.availableDays?.join(', ') || 'Not specified'}
              </p>
            </div>

            {selectedDate && (
              <div>
                <Label className="mb-3 block font-semibold">Available Time Slots</Label>
                {loadingSlots ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {timeSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={selectedSlot?.startTime === slot.startTime ? "default" : "outline"}
                        size="lg"
                        onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                        disabled={!slot.isAvailable}
                        className={cn(
                          "w-full justify-start text-left font-semibold",
                          !slot.isAvailable && "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200",
                          selectedSlot?.startTime === slot.startTime 
                            ? "bg-emerald-600 hover:bg-emerald-700" 
                            : slot.isAvailable && "border-2 hover:border-emerald-600 hover:bg-emerald-50"
                        )}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                        {!slot.isAvailable && <span className="ml-auto text-xs">(Booked)</span>}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No slots available</p>
                    <p className="text-sm text-slate-500 mt-1">Please select another date</p>
                  </div>
                )}
                {bookedSlots.length > 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    {bookedSlots.length} slot{bookedSlots.length !== 1 ? 's' : ''} already booked on this day
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <div className="space-y-6">
          <Card className="border-2 border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>Provide information about your visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason" className="font-semibold">Reason for Visit *</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe your main symptoms or health concerns..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="font-semibold">Additional Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other information you'd like to share..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="border-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          {selectedDate && selectedSlot && reason && (
            <Card className="border-2 border-emerald-200 shadow-md bg-emerald-50">
              <CardHeader>
                <CardTitle className="text-emerald-900">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                  <span className="text-emerald-800 font-medium">Doctor</span>
                  <span className="font-bold text-emerald-900">{doctor.fullName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                  <span className="text-emerald-800 font-medium">Date</span>
                  <span className="font-bold text-emerald-900">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                  <span className="text-emerald-800 font-medium">Time</span>
                  <span className="font-bold text-emerald-900">
                    {formatTime12Hour(selectedSlot.startTime)} - {formatTime12Hour(selectedSlot.endTime)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                  <span className="text-emerald-800 font-medium">Duration</span>
                  <span className="font-bold text-emerald-900">30 minutes</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-emerald-900 font-bold text-lg">Total Fee</span>
                  <span className="font-bold text-2xl text-emerald-700">{formatCurrency(doctor.consultationFee)}</span>
                </div>

                <Button
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 font-bold text-lg h-12 shadow-lg"
                  size="lg"
                  onClick={handleBook}
                  disabled={booking}
                >
                  {booking ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Confirm Booking
                    </>
                  )}
                </Button>

                <p className="text-xs text-emerald-800 text-center mt-3">
                  By confirming, you agree to our cancellation policy. Payment is required before the appointment can be approved.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Important Information */}
      <Card className="border-2 border-amber-200 bg-amber-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-900">
          <p className="flex gap-2">
            <span className="font-bold">•</span>
            <span>Appointments are 30 minutes long and must be paid for before confirmation</span>
          </p>
          <p className="flex gap-2">
            <span className="font-bold">•</span>
            <span>The doctor has a lunch break from 12:30 PM to 2:00 PM (no appointments during this time)</span>
          </p>
          <p className="flex gap-2">
            <span className="font-bold">•</span>
            <span>Please arrive 10 minutes early for your appointment</span>
          </p>
          <p className="flex gap-2">
            <span className="font-bold">•</span>
            <span>Cancellations must be made at least 24 hours in advance for a full refund</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookAppointmentPage() {
  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <BookAppointmentContent />
      </Suspense>
    </DashboardLayout>
  )
}
