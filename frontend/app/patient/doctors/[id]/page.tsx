"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DoctorProfilePreview } from "@/components/doctor-profile-preview"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { doctorService } from "@/services"
import type { DoctorProfileViewModel } from "@/types/backend-types"

export default function PatientViewDoctorPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.id as string

  const [profile, setProfile] = useState<DoctorProfileViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDoctorProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await doctorService.getDoctor(doctorId)
        
        if (response.success && response.data) {
          setProfile(response.data)
        } else {
          setError(response.message || "Failed to load doctor profile")
        }
      } catch (err) {
        console.error("Error loading doctor profile:", err)
        setError("An error occurred while loading the profile")
      } finally {
        setLoading(false)
      }
    }

    if (doctorId) {
      loadDoctorProfile()
    }
  }, [doctorId])

  const handleBookAppointment = () => {
    router.push(`/patient/appointments/book?doctor=${doctorId}`)
  }

  const handleBackToList = () => {
    router.push("/patient/doctors")
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["patient"]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading doctor profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !profile) {
    return (
      <DashboardLayout allowedRoles={["patient"]}>
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Profile</h3>
            <p className="text-red-700 mb-4">{error || "Doctor profile not found"}</p>
            <Button onClick={handleBackToList} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Doctors List
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          onClick={handleBackToList}
          variant="outline"
          className="border-2 border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Doctors List
        </Button>

        {/* Doctor Profile */}
        <DoctorProfilePreview
          profile={profile}
          isPreviewMode={false}
          onBookAppointment={handleBookAppointment}
        />
      </div>
    </DashboardLayout>
  )
}
