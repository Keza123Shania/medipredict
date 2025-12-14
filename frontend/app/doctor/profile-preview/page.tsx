"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DoctorProfilePreview } from "@/components/doctor-profile-preview"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { profileService } from "@/services"
import type { DoctorProfileViewModel } from "@/types/backend-types"
import { useRouter } from "next/navigation"

export default function DoctorProfilePreviewPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [profile, setProfile] = useState<DoctorProfileViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await profileService.getDoctorProfile(user!.id)
      if (response.success && response.data) {
        setProfile(response.data)
      } else {
        setError(response.message || "Failed to load profile")
      }
    } catch (err) {
      console.error("Error loading profile:", err)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["doctor"]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !profile) {
    return (
      <DashboardLayout allowedRoles={["doctor"]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Profile not found"}</p>
            <Button onClick={loadProfile}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["doctor"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Profile Preview
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              See how patients will view your profile
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/doctor/profile')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Edit Profile
          </Button>
        </div>

        {/* Preview */}
        <DoctorProfilePreview profile={profile} isPreviewMode={true} />
      </div>
    </DashboardLayout>
  )
}
