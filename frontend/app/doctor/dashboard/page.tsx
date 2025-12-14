"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { profileService, appointmentService } from "@/services"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  ArrowRight,
  Activity,
  FileText,
  TrendingUp,
  UserCog,
  Plus
} from "lucide-react"
import { formatCurrency, getInitials } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { AppointmentItemViewModel } from "@/types/backend-types"

export default function DoctorDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<AppointmentItemViewModel[]>([])
  const [loading, setLoading] = useState(true)
  const [profileIncomplete, setProfileIncomplete] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [isVerified, setIsVerified] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadAppointments()
      checkProfileCompletion()
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
      console.error("Error loading appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkProfileCompletion = async () => {
    if (!user?.id) return
    
    try {
      const response = await profileService.getDoctorProfile(user.id)
      if (response.success && response.data) {
        const profile = response.data
        
        setIsVerified(profile.isVerified)
        
        const isIncomplete = 
          !profile.bio || 
          !profile.availableDays || 
          profile.availableDays.length === 0 || 
          !profile.availableTimeStart || 
          !profile.availableTimeEnd
        
        setProfileIncomplete(isIncomplete)
      }
    } catch (error) {
      console.error("Error checking profile:", error)
    } finally {
      setCheckingProfile(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "scheduled") return "bg-blue-600 text-white"
    if (statusLower === "confirmed") return "bg-emerald-600 text-white"
    if (statusLower === "completed") return "bg-slate-600 text-white"
    if (statusLower === "cancelled") return "bg-red-600 text-white"
    return "bg-amber-600 text-white"
  }

  const handleStartConsultation = (appointmentId: string) => {
    router.push(`/doctor/consultations/new?appointmentId=${appointmentId}`)
  }

  // Filter appointments
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate)
    aptDate.setHours(0, 0, 0, 0)
    return aptDate.getTime() === today.getTime() && 
           (apt.status === "Scheduled" || apt.status === "Confirmed")
  })

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate)
    aptDate.setHours(0, 0, 0, 0)
    return aptDate > today && 
           (apt.status === "Scheduled" || apt.status === "Confirmed")
  }).slice(0, 5)

  const completedCount = appointments.filter(a => a.status === "Completed").length
  const totalPatients = new Set(appointments.map(a => a.patientName)).size

  return (
    <DashboardLayout allowedRoles={["doctor"]}>
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-emerald-600 pl-4 mb-2 flex items-center gap-3">
          <Activity className="h-6 w-6 text-emerald-600" />
          Doctor Dashboard
        </h1>
        <p className="text-slate-600 text-sm pl-5">
          Welcome, Dr. {user?.lastName} - {(user as any)?.specialization || 'Medical Professional'}
        </p>
      </div>

      {/* Verification Alert */}
      {user && !isVerified && (
        <Alert className="border-2 border-amber-300 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-700" />
          <div>
            <h6 className="font-bold text-amber-900 mb-1">Account Pending Verification</h6>
            <AlertDescription className="text-amber-800 font-medium">
              Your account is awaiting admin approval. You will be able to receive appointments once verified.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Incomplete Profile Alert */}
      {!checkingProfile && profileIncomplete && (
        <Alert className="border-2 border-blue-300 bg-blue-50">
          <UserCog className="h-5 w-5 text-blue-700" />
          <div className="flex items-center justify-between">
            <div>
              <h6 className="font-bold text-blue-900 mb-1">Complete Your Profile</h6>
              <AlertDescription className="text-blue-800 font-medium">
                Please complete your profile by setting your availability and professional bio before you can start receiving appointments.
              </AlertDescription>
            </div>
            <Link href="/doctor/profile">
              <Button variant="outline" className="ml-4 border-blue-600 text-blue-700 hover:bg-blue-100">
                Complete Profile
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">
              {loading ? "-" : todayAppointments.length}
            </div>
            <div className="text-sm text-slate-600">Today's Appointments</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">
              {loading ? "-" : upcomingAppointments.length}
            </div>
            <div className="text-sm text-slate-600">Upcoming</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">
              {loading ? "-" : completedCount}
            </div>
            <div className="text-sm text-slate-600">Completed</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">
              {loading ? "-" : totalPatients}
            </div>
            <div className="text-sm text-slate-600">Total Patients</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card className="border-2 border-slate-200 shadow-md">
        <CardHeader className="border-b-2 bg-slate-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-emerald-700" />
              </div>
              Today's Appointments
            </CardTitle>
            <Button variant="outline" size="sm" asChild className="border-2 border-slate-300 font-semibold hover:border-emerald-600 hover:text-emerald-600">
              <Link href="/doctor/appointments?tab=today">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No appointments today</p>
            </div>
          ) : (
            <div className="divide-y-2">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.appointmentId}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-emerald-200">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
                        {getInitials(appointment.patientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{appointment.patientName}</p>
                      <p className="text-sm text-slate-600 font-medium mt-0.5">
                        {formatTime(appointment.appointmentTime)} • {appointment.durationMinutes} min
                      </p>
                      {appointment.reasonForVisit && (
                        <p className="text-xs text-slate-500 mt-1">{appointment.reasonForVisit}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(getStatusBadge(appointment.status))}>
                        {appointment.status}
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => handleStartConsultation(appointment.appointmentId)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="border-2 border-slate-200 shadow-md">
          <CardHeader className="border-b-2 bg-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-emerald-700" />
                </div>
                Upcoming
              </CardTitle>
              <Button variant="outline" size="sm" asChild className="border-2 border-slate-300 font-semibold hover:border-emerald-600 hover:text-emerald-600">
                <Link href="/doctor/appointments?tab=upcoming">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No upcoming appointments</p>
              </div>
            ) : (
              <div className="divide-y-2">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.appointmentId}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-emerald-200">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
                            {getInitials(appointment.patientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {appointment.patientName}
                          </p>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            {formatDate(appointment.appointmentDate)} • {formatTime(appointment.appointmentTime)}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn(getStatusBadge(appointment.status), "text-xs")}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2 border-slate-200 shadow-md">
          <CardHeader className="border-b-2 bg-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-emerald-700" />
                </div>
                Recent Activity
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No recent activity</p>
            <p className="text-xs text-slate-400 mt-1">Recent consultations and updates will appear here</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="border-2 border-slate-200 shadow-md bg-white">
        <CardHeader className="border-b-2 border-emerald-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Your Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-emerald-600 mb-2">
                {completedCount}
              </div>
              <p className="text-sm font-semibold text-slate-700">Patients Treated</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-emerald-600 mb-2">
                {totalPatients}
              </div>
              <p className="text-sm font-semibold text-slate-700">Unique Patients</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
