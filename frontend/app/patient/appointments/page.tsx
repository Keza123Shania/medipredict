"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Calendar, Clock, Plus, FileText, CalendarCheck, AlertCircle, X, CalendarClock } from "lucide-react"
import { formatCurrency, getInitials } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { appointmentService, doctorService } from "@/services"
import type { AppointmentItemViewModel } from "@/types/backend-types"

interface TimeSlot {
  startTime: string
  endTime: string
  isAvailable: boolean
  dateTime: string
}

export default function PatientAppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<AppointmentItemViewModel[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItemViewModel | null>(null)
  const [processingAction, setProcessingAction] = useState(false)
  
  // Reschedule states
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadAppointments()
    }
  }, [user?.id])

  const loadAppointments = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const response = await appointmentService.getAppointments({ userId: user.id, role: "patient" })
      if (response.success && response.data) {
        setAppointments(response.data.appointments || [])
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

  const canModifyAppointment = (appointmentDate: string, appointmentTime: string) => {
    const [hours, minutes] = appointmentTime.split(':')
    const aptDateTime = new Date(appointmentDate)
    aptDateTime.setHours(parseInt(hours), parseInt(minutes))
    const hoursUntilAppointment = (aptDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
    return hoursUntilAppointment >= 24
  }

  const handleCancelClick = (appointment: AppointmentItemViewModel) => {
    if (!canModifyAppointment(appointment.appointmentDate, appointment.appointmentTime)) {
      toast({
        title: "Cannot Cancel",
        description: "Appointments can only be cancelled at least 24 hours in advance",
        variant: "destructive",
      })
      return
    }
    setSelectedAppointment(appointment)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!selectedAppointment || !user?.id) return
    
    try {
      setProcessingAction(true)
      const response = await appointmentService.cancelAppointment(selectedAppointment.appointmentId, user.id)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Appointment cancelled successfully",
        })
        await loadAppointments()
        setCancelDialogOpen(false)
        setSelectedAppointment(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleRescheduleClick = (appointment: AppointmentItemViewModel) => {
    if (!canModifyAppointment(appointment.appointmentDate, appointment.appointmentTime)) {
      toast({
        title: "Cannot Reschedule",
        description: "Appointments can only be rescheduled at least 24 hours in advance",
        variant: "destructive",
      })
      return
    }
    setSelectedAppointment(appointment)
    setRescheduleDialogOpen(true)
  }

  const loadTimeSlotsForReschedule = async (date: Date) => {
    if (!selectedAppointment) return
    
    try {
      setLoadingSlots(true)
      const dateString = date.toISOString().split('T')[0]
      const response = await doctorService.getAvailableTimeSlots(selectedAppointment.doctorId, dateString)
      
      if (response.success && response.data) {
        setTimeSlots(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      })
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleRescheduleConfirm = async () => {
    if (!selectedAppointment || !user?.id || !rescheduleDate || !selectedSlot) return
    
    try {
      setProcessingAction(true)
      const dateString = rescheduleDate.toISOString().split('T')[0]
      const response = await appointmentService.rescheduleAppointment(
        selectedAppointment.appointmentId,
        dateString,
        selectedSlot,
        user.id
      )
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Appointment rescheduled successfully",
        })
        await loadAppointments()
        setRescheduleDialogOpen(false)
        setSelectedAppointment(null)
        setRescheduleDate(undefined)
        setSelectedSlot("")
        setTimeSlots([])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  useEffect(() => {
    if (rescheduleDate && selectedAppointment) {
      loadTimeSlotsForReschedule(rescheduleDate)
    }
  }, [rescheduleDate, selectedAppointment])

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

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "scheduled") return "bg-blue-600"
    if (statusLower === "confirmed") return "bg-emerald-600"
    if (statusLower === "completed") return "bg-slate-600"
    if (statusLower === "cancelled") return "bg-red-600"
    return "bg-amber-600"
  }

  const upcomingAppointments = appointments.filter(
    apt => (apt.status === "Scheduled" || apt.status === "Confirmed") && new Date(apt.appointmentDate) >= new Date()
  )
  const pastAppointments = appointments.filter(
    apt => apt.status === "Completed" || apt.status === "Cancelled" || new Date(apt.appointmentDate) < new Date()
  )

  const filteredAppointments = activeTab === "upcoming" ? upcomingAppointments : activeTab === "past" ? pastAppointments : appointments

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["patient"]}>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 border-l-4 border-emerald-600 pl-4 mb-2">
              My Appointments
            </h1>
            <p className="text-slate-600 text-sm pl-5">View and manage your medical appointments</p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/patient/doctors">
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-2 border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-3xl font-bold text-slate-900">{appointments.length}</p>
                </div>
                <CalendarCheck className="h-10 w-10 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Upcoming</p>
                  <p className="text-3xl font-bold text-blue-900">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 bg-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700">Completed</p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {appointments.filter(a => a.status === "Completed").length}
                  </p>
                </div>
                <FileText className="h-10 w-10 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Cancelled</p>
                  <p className="text-3xl font-bold text-red-900">
                    {appointments.filter(a => a.status === "Cancelled").length}
                  </p>
                </div>
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-slate-200">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full md:w-[400px] grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No appointments found</h3>
                <p className="text-slate-600 mb-4">
                  {activeTab === "upcoming" 
                    ? "You don't have any upcoming appointments"
                    : activeTab === "past"
                    ? "You don't have any past appointments"
                    : "You haven't booked any appointments yet"}
                </p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/patient/doctors">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Appointment
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <Card key={appointment.appointmentId} className="border-2 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex gap-4 flex-1">
                          <Avatar className="h-16 w-16 border-2 border-emerald-200">
                            <AvatarImage src={appointment.doctorProfilePicture ? `https://localhost:7146${appointment.doctorProfilePicture}` : undefined} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                              {getInitials(appointment.doctorName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{appointment.doctorName}</h3>
                            <p className="text-sm text-emerald-700 font-medium mb-2">{appointment.doctorSpecialization}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(appointment.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(appointment.appointmentTime)} ({appointment.durationMinutes} min)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <Badge className={cn("text-white", getStatusColor(appointment.status))}>
                            {appointment.status}
                          </Badge>
                          <div className="text-right">
                            <p className="text-sm text-slate-600 mb-1">Fee</p>
                            <p className="text-xl font-bold text-emerald-700">{formatCurrency(appointment.consultationFee)}</p>
                          </div>
                        </div>
                      </div>

                      {appointment.reasonForVisit && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-sm text-slate-600 mb-1">Reason:</p>
                          <p className="text-sm text-slate-900">{appointment.reasonForVisit}</p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Confirmation:</span>
                          <span className="font-mono font-semibold">{appointment.confirmationNumber}</span>
                        </div>
                        
                        {(appointment.status === "Scheduled" || appointment.status === "Confirmed") && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRescheduleClick(appointment)}
                              disabled={!canModifyAppointment(appointment.appointmentDate, appointment.appointmentTime)}
                              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                            >
                              <CalendarClock className="h-3 w-3 mr-1" />
                              Reschedule
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelClick(appointment)}
                              disabled={!canModifyAppointment(appointment.appointmentDate, appointment.appointmentTime)}
                              className="border-red-600 text-red-700 hover:bg-red-50"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your appointment with {selectedAppointment?.doctorName}?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={processingAction}>No, Keep It</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelConfirm}
                disabled={processingAction}
                className="bg-red-600 hover:bg-red-700"
              >
                {processingAction ? "Cancelling..." : "Yes, Cancel Appointment"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>
                Select a new date and time for your appointment with {selectedAppointment?.doctorName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    setRescheduleDate(new Date(e.target.value))
                    setSelectedSlot("")
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>

              {rescheduleDate && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Available Time Slots</label>
                  {loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                      <p className="text-sm text-slate-600 mt-2">Loading available slots...</p>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <p className="text-sm text-slate-600 py-4">No available slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.startTime}
                          type="button"
                          variant={selectedSlot === slot.startTime ? "default" : "outline"}
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot.startTime)}
                          className={cn(
                            "justify-center",
                            selectedSlot === slot.startTime && "bg-emerald-600 hover:bg-emerald-700",
                            !slot.isAvailable && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {slot.startTime}
                          {!slot.isAvailable && " (Booked)"}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRescheduleDialogOpen(false)
                  setRescheduleDate(undefined)
                  setSelectedSlot("")
                  setTimeSlots([])
                }}
                disabled={processingAction}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRescheduleConfirm}
                disabled={!rescheduleDate || !selectedSlot || processingAction}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {processingAction ? "Rescheduling..." : "Confirm Reschedule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
