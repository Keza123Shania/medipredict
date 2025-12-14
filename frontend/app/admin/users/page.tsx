"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Ban, 
  CheckCircle, 
  Loader2,
  Users,
  Calendar,
  Activity
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminService } from "@/services/admin.service"
import { useToast } from "@/hooks/use-toast"

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: patientsResponse, isLoading } = useQuery({
    queryKey: ['admin-patients', searchQuery],
    queryFn: () => adminService.getPatients(searchQuery || undefined),
    refetchInterval: 30000,
  })

  const blockMutation = useMutation({
    mutationFn: (patientId: string) => adminService.blockPatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-patients'] })
      toast({
        title: "Success",
        description: "Patient account blocked successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to block patient account",
        variant: "destructive",
      })
    },
  })

  const unblockMutation = useMutation({
    mutationFn: (patientId: string) => adminService.unblockPatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-patients'] })
      toast({
        title: "Success",
        description: "Patient account unblocked successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unblock patient account",
        variant: "destructive",
      })
    },
  })

  const patients = patientsResponse?.data?.patients || []
  const totalPatients = patientsResponse?.data?.totalPatients || 0
  const activePatients = patientsResponse?.data?.activePatients || 0
  const inactivePatients = patientsResponse?.data?.inactivePatients || 0

  const handleBlock = (patientId: string) => {
    if (confirm("Are you sure you want to block this patient?")) {
      blockMutation.mutate(patientId)
    }
  }

  const handleUnblock = (patientId: string) => {
    if (confirm("Are you sure you want to unblock this patient?")) {
      unblockMutation.mutate(patientId)
    }
  }

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="border-l-4 border-emerald-600 pl-4 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Patient Management</h1>
          <p className="text-slate-600">View and manage all registered patients</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold">{totalPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Patients</p>
                  <p className="text-2xl font-bold">{activePatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center">
                  <Ban className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inactive Patients</p>
                  <p className="text-2xl font-bold">{inactivePatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Users className="h-12 w-12 mb-4" />
                <p>No patients found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Appointments</TableHead>
                    <TableHead>Predictions</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient: any) => (
                    <TableRow key={patient.patientId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-emerald-100 text-emerald-600">
                              {patient.fullName?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{patient.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phone || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{patient.gender || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{patient.totalAppointments || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span>{patient.totalPredictions || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.lastVisit 
                          ? new Date(patient.lastVisit).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={patient.status === "Active" ? "default" : "destructive"}
                          className={patient.status === "Active" ? "bg-emerald-500" : ""}
                        >
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {patient.status === "Active" ? (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleBlock(patient.patientId)}
                                disabled={blockMutation.isPending}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Block Patient
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="text-green-600"
                                onClick={() => handleUnblock(patient.patientId)}
                                disabled={unblockMutation.isPending}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Unblock Patient
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
