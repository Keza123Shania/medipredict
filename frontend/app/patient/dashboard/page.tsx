"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useAppointments } from "@/api/hooks/use-appointments"
import { usePredictions } from "@/api/hooks/use-predictions"
import { profileService } from "@/services"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/ui/page-header"
import type { PatientProfileSummaryViewModel } from "@/types/backend-types"
import { 
  Activity, 
  Calendar, 
  FileText, 
  Stethoscope, 
  ArrowRight, 
  Clock, 
  User,
  CheckCircle,
  Brain,
  Search,
  HeartPulse,
  Lightbulb,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { formatDate, formatTime } from "@/lib/formatters"
import { cn } from "@/lib/utils"

export default function PatientDashboardPage() {
  const { user } = useAuth()
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments({ limit: 5 })
  const { data: predictionsResponse, isLoading: predictionsLoading } = usePredictions()
  const [profile, setProfile] = useState<PatientProfileSummaryViewModel | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const predictions = predictionsResponse?.data || []

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    if (!user?.id) return
    try {
      setProfileLoading(true)
      const response = await profileService.getPatientProfile(user.id)
      if (response.success && response.data) {
        setProfile(response.data)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setProfileLoading(false)
    }
  }

  const isProfileIncomplete = () => {
    if (!profile) return false
    const allergyList = profile.allergies ? profile.allergies.split(',').map(a => a.trim()).filter(a => a) : []
    return !profile.phoneNumber || !profile.address || !profile.bloodType || allergyList.length === 0 || !profile.emergencyContact || !profile.emergencyPhone
  }

  const stats = {
    totalAppointments: appointmentsData?.total || 0,
    upcomingAppointments: appointmentsData?.appointments?.filter(a => 
      ["pending", "confirmed"].includes(a.status)
    ).length || 0,
    completedAppointments: appointmentsData?.appointments?.filter(a => 
      a.status === "completed"
    ).length || 0,
    totalPredictions: predictions.length,
  }

  const upcomingAppointments = appointmentsData?.appointments
    ?.filter((a) => ["pending", "confirmed"].includes(a.status))
    ?.slice(0, 5) || []

  const recentPredictions = predictions.slice(0, 5)

  const healthTips = [
    {
      icon: HeartPulse,
      title: "Stay Hydrated",
      text: "Drink at least 8 glasses of water daily for optimal health.",
      color: "text-sky-600 bg-sky-50"
    },
    {
      icon: Activity,
      title: "Exercise Regularly",
      text: "30 minutes of physical activity can boost your overall wellness.",
      color: "text-emerald-600 bg-emerald-50"
    },
    {
      icon: Clock,
      title: "Quality Sleep",
      text: "Aim for 7-9 hours of sleep each night for better recovery.",
      color: "text-amber-600 bg-amber-50"
    },
  ]

  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="space-y-8">
        {/* Incomplete Profile Alert */}
        {!profileLoading && isProfileIncomplete() && (
          <Alert className="border-amber-600 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900">Complete Your Profile</AlertTitle>
            <AlertDescription className="text-amber-800 flex items-center justify-between">
              <span>Complete your profile to help doctors provide you with better care.</span>
              <Button asChild variant="outline" size="sm" className="ml-4 border-amber-600 text-amber-900 hover:bg-amber-100">
                <Link href="/patient/profile">Complete Profile</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Header */}
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-l-4 border-emerald-600 pl-4">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-sm text-slate-600">
              Your health journey starts here. Let's take care of you today.
            </p>
          </div>
        </div>

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
                {appointmentsLoading ? "-" : stats.totalAppointments}
              </div>
              <div className="text-sm text-slate-600">Total Appointments</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-900 mb-1">
                {appointmentsLoading ? "-" : stats.upcomingAppointments}
              </div>
              <div className="text-sm text-slate-600">Upcoming</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-900 mb-1">
                {appointmentsLoading ? "-" : stats.completedAppointments}
              </div>
              <div className="text-sm text-slate-600">Completed</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-900 mb-1">
                {predictionsLoading ? "-" : stats.totalPredictions}
              </div>
              <div className="text-sm text-slate-600">AI Predictions</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <Card className="border-2 border-slate-200 shadow-md">
              <CardHeader className="border-b bg-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-emerald-700" />
                    </div>
                    Upcoming Appointments
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild className="border-2 border-slate-300 font-semibold">
                    <Link href="/patient/appointments">
                      View All
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {appointmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-500 transition-all"
                      >
                        <div className="h-16 w-16 rounded-xl bg-slate-900 flex flex-col items-center justify-center shrink-0 text-white">
                          <div className="text-xs font-semibold uppercase text-slate-400">
                            {formatDate(appointment.date, { month: 'short' })}
                          </div>
                          <div className="text-2xl font-extrabold">
                            {formatDate(appointment.date, { day: 'numeric' })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 mb-1">
                            Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                          </p>
                          <p className="text-sm text-slate-600 mb-1">
                            {appointment.doctor?.specialization}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Clock className="h-3 w-3" />
                            {formatTime(appointment.startTime)} • {appointment.reason || 'General Consultation'}
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "shrink-0 font-semibold",
                            appointment.status === "confirmed" && "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          )}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 mb-4">
                      <Calendar className="h-10 w-10 text-slate-400" />
                    </div>
                    <h6 className="text-lg font-bold text-slate-900 mb-2">No Upcoming Appointments</h6>
                    <p className="text-slate-600 mb-6">You don't have any scheduled appointments yet.</p>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/30">
                      <Link href="/patient/doctors">
                        <Search className="mr-2 h-5 w-5" />
                        Find a Doctor
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-md bg-white">
              <CardHeader className="border-b bg-emerald-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Upcoming Appointments
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/patient/appointments">
                      View All
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {appointmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all hover:translate-x-1"
                      >
                        <div className="flex-shrink-0 w-20 text-center p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                          <div className="text-2xl font-bold">
                            {new Date(appointment.date).getDate()}
                          </div>
                          <div className="text-xs uppercase opacity-90">
                            {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 mb-1">
                            {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            {appointment.doctor?.specialization}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatTime(appointment.startTime)} • {appointment.reason || 'General Consultation'}
                          </div>
                        </div>
                        <Badge
                          variant={appointment.status === "confirmed" ? "default" : "secondary"}
                          className={cn(
                            "shrink-0",
                            appointment.status === "confirmed" && "bg-green-100 text-green-800 hover:bg-green-200"
                          )}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-4">
                      <Calendar className="h-10 w-10 text-gray-400" />
                    </div>
                    <h6 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Appointments</h6>
                    <p className="text-gray-600 mb-4">You don't have any scheduled appointments yet.</p>
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Link href="/patient/doctors">
                        <Search className="mr-2 h-4 w-4" />
                        Find a Doctor
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Predictions */}
            <Card className="border-2 border-slate-200 shadow-md">
              <CardHeader className="border-b bg-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-emerald-700" />
                    </div>
                    Recent AI Predictions
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild className="border-2 border-slate-300 font-semibold">
                    <Link href="/patient/predict">
                      New Analysis
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {predictionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : recentPredictions.length > 0 ? (
                  <div className="space-y-3">
                    {recentPredictions.map((prediction) => (
                      <div
                        key={prediction.id}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-500 transition-all"
                      >
                        <div className="h-14 w-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                          <Brain className="h-7 w-7 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 mb-1">
                            {prediction.predictedCondition || 'Health Analysis'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Calendar className="h-3 w-3" />
                            {formatDate(prediction.createdAt, { month: 'short', day: 'numeric' })} •{' '}
                            {prediction.symptoms?.length || 0} symptoms analyzed
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-200 border-0 font-semibold">
                          {prediction.confidence || 85}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 mb-4">
                      <Brain className="h-10 w-10 text-slate-400" />
                    </div>
                    <h6 className="text-lg font-bold text-slate-900 mb-2">No Predictions Yet</h6>
                    <p className="text-slate-600 mb-6">Start by checking your symptoms with our AI-powered tool.</p>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/30">
                      <Link href="/patient/predict">
                        <Activity className="mr-2 h-5 w-5" />
                        Check Symptoms
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Health Tips & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-2 border-slate-200 shadow-md">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button asChild className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20" size="lg">
                  <Link href="/patient/predict">
                    <Activity className="mr-2 h-5 w-5" />
                    AI Health Check
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-2 border-slate-300 font-semibold" size="lg">
                  <Link href="/patient/doctors">
                    <Search className="mr-2 h-5 w-5" />
                    Find Doctors
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-2 border-slate-300 font-semibold" size="lg">
                  <Link href="/patient/appointments">
                    <Calendar className="mr-2 h-5 w-5" />
                    My Appointments
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-2 border-slate-300 font-semibold" size="lg">
                  <Link href="/patient/records">
                    <FileText className="mr-2 h-5 w-5" />
                    Medical Records
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Health Tips */}
            {healthTips.map((tip, index) => {
              const Icon = tip.icon
              return (
                <Card key={index} className="border-l-4 border-l-emerald-500 border-2 border-slate-200 bg-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", tip.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h6 className="font-bold text-slate-900 mb-1">
                          {tip.title}
                        </h6>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {tip.text}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
