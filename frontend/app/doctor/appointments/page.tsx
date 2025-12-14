"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Search, FileText, CheckCircle, XCircle, CalendarDays, Plus, X, CalendarClock } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, getInitials } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { appointmentService } from "@/services"
import type { AppointmentItemViewModel } from "@/types/backend-types"

export default function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [appointments, setAppointments] = useState<AppointmentItemViewModel[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItemViewModel | null>(null)
  const [processingAction, setProcessingAction] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadAppointments()
    }
  }, [user?.id])

  const loadAppointments = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const response = await appointmentService.getAppointments({ userId: user.id, role: "doctor" })
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

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate).toDateString()
    return aptDate === new Date().toDateString()
  })

  const upcomingAppointments = appointments.filter(
    apt => (apt.status === "Scheduled" || apt.status === "Confirmed") && new Date(apt.appointmentDate) >= new Date()
  )

  const completedAppointments = appointments.filter(apt => apt.status === "Completed")
  const cancelledAppointments = appointments.filter(apt => apt.status === "Cancelled")

  const getFilteredAppointments = () => {
    let filtered = appointments
    
    if (activeTab === "today") {
      filtered = todayAppointments
    } else if (activeTab === "upcoming") {
      filtered = upcomingAppointments
    } else if (activeTab === "completed") {
      filtered = completedAppointments
    } else if (activeTab === "cancelled") {
      filtered = cancelledAppointments
    }

    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.confirmationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.reasonForVisit?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const filteredAppointments = getFilteredAppointments()

  const handleStartConsultation = (appointmentId: string) => {
    router.push(`/doctor/consultations/new?appointmentId=${appointmentId}`)
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["doctor"]}>
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
    <DashboardLayout allowedRoles={["doctor"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 border-l-4 border-emerald-600 pl-4 mb-2">
            Patient Appointments
          </h1>
          <p className="text-slate-600 text-sm pl-5">View and manage patient appointments</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Today</p>
                  <p className="text-3xl font-bold text-blue-900">{todayAppointments.length}</p>
                </div>
                <CalendarDays className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 bg-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700">Upcoming</p>
                  <p className="text-3xl font-bold text-emerald-900">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="h-10 w-10 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 bg-slate-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700">Completed</p>
                  <p className="text-3xl font-bold text-slate-900">{completedAppointments.length}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Cancelled</p>
                  <p className="text-3xl font-bold text-red-900">{cancelledAppointments.length}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-slate-200">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search patients, confirmation number, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-slate-200"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[600px] grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {filteredAppointments.length === 0 ? (
              <Card className="border-2 border-slate-200 bg-white">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No appointments found</h3>
                  <p className="text-slate-600">
                    {searchQuery 
                      ? "No appointments match your search" 
                      : activeTab === "today"
                      ? "You don't have any appointments today"
                      : activeTab === "upcoming"
                      ? "You don't have any upcoming appointments"
                      : activeTab === "completed"
                      ? "You don't have any completed appointments"
                      : activeTab === "cancelled"
                      ? "You don't have any cancelled appointments"
                      : "No appointments yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments.map((appointment) => (
                <Card key={appointment.appointmentId} className="border-2 border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex gap-4 flex-1">
                        <Avatar className="h-16 w-16 border-2 border-emerald-200">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                            {getInitials(appointment.patientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{appointment.patientName}</h3>
                            </div>
                            <Badge className={cn("text-white", getStatusColor(appointment.status))}>
                              {appointment.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(appointment.appointmentDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(appointment.appointmentTime)} ({appointment.durationMinutes} min)</span>
                            </div>
                          </div>
                          {appointment.reasonForVisit && (
                            <div className="mb-3">
                              <p className="text-sm text-slate-600 mb-1">Reason:</p>
                              <p className="text-sm text-slate-900">{appointment.reasonForVisit}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Confirmation:</span>
                            <span className="font-mono font-semibold">{appointment.confirmationNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-sm text-slate-600 mb-1">Fee</p>
                          <p className="text-xl font-bold text-emerald-700">{formatCurrency(appointment.consultationFee)}</p>
                        </div>
                        {(appointment.status === "Scheduled" || appointment.status === "Confirmed") && (
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleStartConsultation(appointment.appointmentId)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Start Consultation
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
                        {appointment.status === "Completed" && (
                          <Button 
                            asChild
                            variant="outline"
                            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Link href={`/doctor/consultations?appointmentId=${appointment.appointmentId}`}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Consultation
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel the appointment with {selectedAppointment?.patientName}?
                The patient will be notified of this cancellation.
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
      </div>
    </DashboardLayout>
  )
}
