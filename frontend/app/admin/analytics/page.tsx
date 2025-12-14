"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Brain, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowUp, 
  ArrowDown,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useQuery } from "@tanstack/react-query"
import { adminService } from "@/services/admin.service"
import { cn } from "@/lib/utils"

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminAnalyticsPage() {
  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalytics(),
    refetchInterval: 60000,
  })

  const analytics = analyticsResponse?.data

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={["admin"]}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    )
  }

  // Transform daily activity for chart
  const dailyActivityData = analytics?.dailyActivity?.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    appointments: day.appointmentCount,
    predictions: day.predictionCount,
  })) || []

  // Transform specialization data for pie chart
  const specializationData = analytics?.topSpecializations?.map((spec: any, index: number) => ({
    name: spec.specialization,
    value: spec.appointmentCount,
    color: COLORS[index % COLORS.length],
  })) || []

  const formatGrowthRate = (rate: number, label: string) => {
    const isPositive = rate >= 0
    return (
      <div className={cn(
        "flex items-center text-xs font-medium mt-2",
        isPositive ? "text-green-600" : "text-red-600"
      )}>
        {isPositive ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
        {isPositive ? '+' : ''}{rate.toFixed(1)}% {label}
      </div>
    )
  }

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="border-l-4 border-emerald-600 pl-4 flex items-center gap-3">
            <Activity className="h-7 w-7 text-emerald-600" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-slate-600">Platform usage and performance insights</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalPatients?.toLocaleString() || 0}</div>
              {formatGrowthRate(analytics?.patientGrowthRate || 0, "from last month")}
              <p className="text-xs text-muted-foreground mt-1">
                {analytics?.recentPatients || 0} new in last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Predictions</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalPredictions?.toLocaleString() || 0}</div>
              <div className="flex items-center text-xs text-emerald-600 font-medium mt-2">
                <CheckCircle className="mr-1 h-3 w-3" />
                {analytics?.aiPredictionAccuracy?.toFixed(1) || 0}% accuracy
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {analytics?.totalConsultations || 0} consultations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalAppointments?.toLocaleString() || 0}</div>
              {formatGrowthRate(analytics?.appointmentGrowthRate || 0, "from last month")}
              <p className="text-xs text-muted-foreground mt-1">
                {analytics?.recentAppointments || 0} new in last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified Doctors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalDoctors || 0}</div>
              {formatGrowthRate(analytics?.doctorGrowthRate || 0, "from last month")}
              <p className="text-xs text-muted-foreground mt-1">
                {analytics?.pendingDoctorApprovals || 0} pending approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Daily Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Trend (Last 7 Days)</CardTitle>
              <CardDescription>Daily appointments and AI predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {dailyActivityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="appointments" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Appointments"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="predictions" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Predictions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No activity data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Specializations Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Specializations</CardTitle>
              <CardDescription>Appointments by medical specialty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {specializationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={specializationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {specializationData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No specialization data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Status Breakdown */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.pendingAppointments || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.completedAppointments || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.cancelledAppointments || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Cancelled by users</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Specializations Table */}
        {analytics?.topSpecializations && analytics.topSpecializations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Specialization Details</CardTitle>
              <CardDescription>Complete breakdown of appointments by specialty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topSpecializations.map((spec: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{spec.specialization}</div>
                        <div className="text-sm text-muted-foreground">Medical Specialty</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{spec.appointmentCount}</div>
                      <div className="text-xs text-muted-foreground">appointments</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
