"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useDoctors } from "@/api/hooks/use-doctors"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Clock, BadgeCheck, Brain } from "lucide-react"
import { formatCurrency, getInitials } from "@/lib/formatters"
import { Alert, AlertDescription } from "@/components/ui/alert"

const specializations = [
  "All Specializations",
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Psychiatry",
]

export default function PatientDoctorsPage() {
  const searchParams = useSearchParams()
  const symptomEntryId = searchParams.get('symptomEntryId')
  const urlSpecialization = searchParams.get('specialization')

  const [search, setSearch] = useState("")
  const [specialization, setSpecialization] = useState(urlSpecialization || "all")

  useEffect(() => {
    if (urlSpecialization) {
      setSpecialization(urlSpecialization)
    }
  }, [urlSpecialization])

  const { data, isLoading } = useDoctors({
    search: search || undefined,
    specialization: specialization !== "all" ? specialization : undefined,
  })

  // Debug: Log the data to see what we're getting
  console.log("Doctors data:", data)
  console.log("Is loading:", isLoading)
  console.log("Symptom Entry ID:", symptomEntryId)

  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-emerald-600 pl-4 mb-2 flex items-center gap-3">
            <Search className="h-6 w-6 text-emerald-600" />
            Find a Doctor
          </h1>
          <p className="text-slate-600 text-sm pl-5">Browse and book appointments with verified specialists</p>
        </div>

        {symptomEntryId && (
          <Alert className="border-blue-200 bg-blue-50">
            <Brain className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Your AI prediction will be shared with the doctor you book to help with diagnosis
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2 border-slate-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search by name or specialty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 border-2 border-slate-300 focus:border-emerald-500"
                />
              </div>
              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger className="w-full sm:w-[200px] h-12 border-2 border-slate-300">
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec === "All Specializations" ? "all" : spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : data?.data?.doctors && data.data.doctors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.doctors.map((doctor) => (
              <Card key={doctor.doctorId} className="border-2 border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 overflow-hidden group p-0">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 h-20 group-hover:from-emerald-100 group-hover:to-teal-100 transition-colors"></div>
                <CardContent className="p-6 -mt-10">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 border-4 border-white shadow-lg mb-3">
                      <AvatarImage 
                        src={doctor.profilePicture ? `https://localhost:7146${doctor.profilePicture}` : undefined} 
                        alt={doctor.fullName}
                      />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">
                        {getInitials(doctor.fullName.split(' ')[0], doctor.fullName.split(' ')[1])}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-slate-900">
                        {doctor.fullName}
                      </h3>
                      {doctor.isVerified && (
                        <div className="flex items-center justify-center px-2 py-0.5 bg-blue-600 text-white rounded-full">
                          <BadgeCheck className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 font-medium mb-3">{doctor.specialization}</p>
                    
                    <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-slate-900">{doctor.averageRating?.toFixed(1) || "5.0"}</span>
                      </div>
                      <div className="h-4 w-px bg-slate-300"></div>
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {doctor.experience}y exp
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold">
                      <Link href={`/patient/doctors/${doctor.doctorId}${symptomEntryId ? `?symptomEntryId=${symptomEntryId}` : ''}`}>View Profile</Link>
                    </Button>
                    <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg">
                      <Link href={`/patient/appointments/book?doctor=${doctor.doctorId}${symptomEntryId ? `&symptomEntryId=${symptomEntryId}` : ''}`}>Book</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-slate-200 shadow-md">
            <CardContent className="text-center py-12">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 mb-4">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No doctors found</h3>
              <p className="text-slate-600">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
