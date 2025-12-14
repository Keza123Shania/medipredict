"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  Award,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  Zap,
  Brain,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { adminService } from "@/services/admin.service"
import { useQuery } from "@tanstack/react-query"

export default function AdminDashboardPage() {
  const { user } = useAuth()

  // Fetch analytics data
  const { data: analyticsResponse, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalytics(),
    refetchInterval: 60000, // Refresh every minute
  })

  // Fetch pending doctors
  const { data: pendingDoctorsResponse, isLoading: pendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ['pending-doctors'],
    queryFn: () => adminService.getPendingDoctors(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const analytics = analyticsResponse?.data
  const pendingDoctors = pendingDoctorsResponse?.data || []

  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000 / 60)
    
    if (diff < 60) return diff + 'm ago'
    if (diff < 1440) return Math.floor(diff / 60) + 'h ago'
    return Math.floor(diff / 1440) + 'd ago'
  }

  const formatGrowthRate = (rate: number) => {
    const isPositive = rate >= 0
    return (
      <div className={cn(
        "flex items-center gap-1 text-xs font-semibold",
        isPositive ? "text-emerald-600" : "text-red-600"
      )}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(rate).toFixed(1)}%
      </div>
    )
  }

  if (analyticsLoading) {
    return (
      <DashboardLayout allowedRoles={["admin"]}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-l-4 border-emerald-600 pl-4 mb-2 flex items-center gap-3">
          <Activity className="h-6 w-6 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 text-sm">System overview and management</p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 mb-1">
                {analytics?.totalPatients?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-slate-600 mb-2">Total Patients</div>
              {formatGrowthRate(analytics?.patientGrowthRate || 0)}
              <div className="text-xs text-slate-500 mt-1">
                {analytics?.recentPatients || 0} new (30d)
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 mb-1">
                {analytics?.totalDoctors || 0}
              </div>
              <div className="text-sm text-slate-600 mb-2">Total Doctors</div>
              {formatGrowthRate(analytics?.doctorGrowthRate || 0)}
              <div className="text-xs text-slate-500 mt-1">
                {analytics?.pendingDoctorApprovals || 0} pending
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 mb-1">
                {analytics?.totalAppointments?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-slate-600 mb-2">Total Appointments</div>
              {formatGrowthRate(analytics?.appointmentGrowthRate || 0)}
              <div className="text-xs text-slate-500 mt-1">
                {analytics?.pendingAppointments || 0} pending
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <Brain className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 mb-1">
                {analytics?.totalPredictions?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-slate-600 mb-2">AI Predictions</div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle className="h-3 w-3" />
                {analytics?.aiPredictionAccuracy?.toFixed(1) || 0}% accuracy
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {analytics?.totalConsultations || 0} consultations
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-xl font-extrabold mb-4 flex items-center gap-2 text-slate-900">
            <Zap className="h-5 w-5 text-emerald-600" />
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/users" className="group">
              <Card className="border-2 border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8" />
                  </div>
                  <div className="font-bold text-slate-900">Manage Patients</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/doctors" className="group">
              <Card className="border-2 border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                    <UserCheck className="h-8 w-8" />
                  </div>
                  <div className="font-bold text-slate-900">Manage Doctors</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/analytics" className="group">
              <Card className="border-2 border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <div className="font-bold text-slate-900">Analytics</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <Card className="border-2 border-slate-200 shadow-md">
            <CardHeader className="border-b-2 bg-amber-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-amber-700" />
                  Pending Doctor Approvals
                  <Badge className="ml-2 bg-amber-500 hover:bg-amber-600 font-bold">
                    {pendingDoctors.length}
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {pendingLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
                </div>
              ) : pendingDoctors.length > 0 ? (
                <div className="space-y-3">
                  {pendingDoctors.slice(0, 5).map((doctor: any) => (
                    <Card key={doctor.doctorId} className="border-2 hover:border-primary transition-all">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h6 className="font-bold mb-1">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </h6>
                            <p className="text-sm text-muted-foreground">
                              {doctor.specialization} • {doctor.yearsOfExperience} years exp
                            </p>
                          </div>
                          <Badge variant="secondary">New</Badge>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(doctor.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/admin/doctors?pending=true`}>
                              <Button size="sm" variant="outline" className="font-semibold">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {pendingDoctors.length > 5 && (
                    <div className="text-center mt-4">
                      <Button variant="outline" size="sm" asChild className="border-2 border-slate-300 font-semibold">
                        <Link href="/admin/doctors?pending=true">
                          View All {pendingDoctors.length} Pending Approvals
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No pending approvals</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Specializations */}
          <Card className="shadow-md border-2 border-slate-200">
            <CardHeader className="border-b bg-emerald-50">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <Award className="h-5 w-5 text-emerald-600" />
                Top Specializations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {analytics?.topSpecializations && analytics.topSpecializations.length > 0 ? (
                <div className="space-y-1">
                  {analytics.topSpecializations.map((spec: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border-b last:border-0"
                    >
                      <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{spec.specialization}</div>
                        <div className="text-sm text-muted-foreground">Medical Specialty</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-primary">{spec.appointmentCount}</div>
                        <div className="text-xs text-muted-foreground">appointments</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Chart */}
        {analytics?.dailyActivity && analytics.dailyActivity.length > 0 && (
          <Card className="border-2 border-slate-200">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                Recent Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.dailyActivity.reduce((sum: number, day: any) => sum + day.appointmentCount, 0)}
                  </div>
                  <div className="text-sm text-slate-600">Appointments</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">
                    {analytics.dailyActivity.reduce((sum: number, day: any) => sum + day.predictionCount, 0)}
                  </div>
                  <div className="text-sm text-slate-600">AI Predictions</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.completedAppointments || 0}
                  </div>
                  <div className="text-sm text-slate-600">Completed</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Data from {new Date(analytics.dailyActivity[0].date).toLocaleDateString()} to {new Date(analytics.dailyActivity[analytics.dailyActivity.length - 1].date).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
