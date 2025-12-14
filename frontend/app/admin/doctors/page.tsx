"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Clock, Shield, Users, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { doctorService } from "@/services"
import type { DoctorProfileViewModel } from "@/types/backend-types"

export default function AdminDoctorsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [allDoctors, setAllDoctors] = useState<DoctorProfileViewModel[]>([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const response = await doctorService.getDoctors({ includeUnverified: true, pageSize: 100 })
      if (response.success && response.data) {
        setAllDoctors(response.data.doctors)
      }
    } catch (error) {
      console.error("Error loading doctors:", error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (fullName: string) => {
    const names = fullName.split(" ")
    return names.map((n) => n[0]).join("").toUpperCase()
  }

  const filteredDoctors = allDoctors.filter((doctor) => {
    const matchesSearch =
      search === "" ||
      doctor.fullName.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(search.toLowerCase()) ||
      doctor.email.toLowerCase().includes(search.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "verified" && doctor.isVerified) ||
      (activeTab === "pending" && !doctor.isVerified)

    return matchesSearch && matchesTab
  })

  const stats = {
    total: allDoctors.length,
    verified: allDoctors.filter((d) => d.isVerified).length,
    pending: allDoctors.filter((d) => !d.isVerified).length,
  }

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-emerald-600 pl-4 mb-2 flex items-center gap-3">
            <Users className="h-6 w-6 text-emerald-600" />
            Manage Doctors
          </h1>
          <p className="text-slate-600 text-sm pl-5">Verify and manage healthcare providers on the platform</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Doctors</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Verified</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.verified}</p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Verification</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Tabs */}
        <Card className="border-2 border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search by name, specialization, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 border-2 border-slate-300 focus:border-emerald-500"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="verified">Verified ({stats.verified})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              </TabsList>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No doctors found</h3>
                  <p className="text-slate-600">
                    {search ? "Try adjusting your search criteria" : "No doctors match the selected filter"}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors.map((doctor) => (
                    <Card
                      key={doctor.doctorId}
                      className="border-2 border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 overflow-hidden group p-0"
                    >
                      <div
                        className={`h-20 ${
                          doctor.isVerified
                            ? "bg-gradient-to-r from-emerald-50 to-teal-50 group-hover:from-emerald-100 group-hover:to-teal-100"
                            : "bg-gradient-to-r from-amber-50 to-orange-50 group-hover:from-amber-100 group-hover:to-orange-100"
                        } transition-colors`}
                      ></div>
                      <CardContent className="p-6 -mt-10">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 border-4 border-white shadow-lg mb-3">
                            <AvatarImage
                              src={
                                doctor.profilePicture
                                  ? `https://localhost:7146${doctor.profilePicture}`
                                  : undefined
                              }
                              alt={doctor.fullName}
                            />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">
                              {getInitials(doctor.fullName)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-slate-900">{doctor.fullName}</h3>
                            {doctor.isVerified && (
                              <div className="flex items-center justify-center px-2 py-0.5 bg-emerald-600 text-white rounded-full">
                                <CheckCircle className="h-3 w-3" />
                              </div>
                            )}
                            {!doctor.isVerified && (
                              <div className="flex items-center justify-center px-2 py-0.5 bg-amber-600 text-white rounded-full">
                                <AlertCircle className="h-3 w-3" />
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-slate-600 font-medium mb-1">{doctor.specialization}</p>
                          <p className="text-xs text-slate-500 mb-3">{doctor.email}</p>

                          <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {doctor.experience}y exp
                            </Badge>
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              <Shield className="h-3 w-3 mr-1" />
                              {doctor.licenseNumber}
                            </Badge>
                          </div>

                          <Button
                            onClick={() => router.push(`/admin/doctors/${doctor.doctorId}`)}
                            variant="outline"
                            className="w-full border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
