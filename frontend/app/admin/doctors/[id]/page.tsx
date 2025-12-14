"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DoctorProfilePreview } from "@/components/doctor-profile-preview"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { doctorService, adminService } from "@/services"
import type { DoctorProfileViewModel } from "@/types/backend-types"
import { useToast } from "@/hooks/use-toast"

export default function AdminViewDoctorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const doctorId = params.id as string

  const [profile, setProfile] = useState<DoctorProfileViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    loadDoctorProfile()
  }, [doctorId])

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

  const handleApprove = async () => {
    if (!profile) return
    
    try {
      setActionLoading(true)
      const response = await adminService.approveDoctor(profile.doctorId)
      
      if (response.success) {
        toast({
          title: "Doctor Approved",
          description: "The doctor has been successfully verified and can now accept patients.",
        })
        router.push("/admin/doctors")
      } else {
        toast({
          title: "Approval Failed",
          description: response.message || "Failed to approve doctor",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving doctor:", error)
      toast({
        title: "Error",
        description: "An error occurred while approving the doctor",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!profile || !rejectReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this application",
        variant: "destructive",
      })
      return
    }
    
    try {
      setActionLoading(true)
      const response = await adminService.rejectDoctor(profile.doctorId, rejectReason)
      
      if (response.success) {
        toast({
          title: "Doctor Rejected",
          description: "The doctor application has been rejected and removed from the system.",
        })
        router.push("/admin/doctors")
      } else {
        toast({
          title: "Rejection Failed",
          description: response.message || "Failed to reject doctor",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting doctor:", error)
      toast({
        title: "Error",
        description: "An error occurred while rejecting the doctor",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
      setShowRejectDialog(false)
    }
  }

  const handleBackToList = () => {
    router.push("/admin/doctors")
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["admin"]}>
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
      <DashboardLayout allowedRoles={["admin"]}>
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
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Admin Actions Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handleBackToList}
            variant="outline"
            className="border-2 border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Doctors List
          </Button>

          {!profile.isVerified && (
            <div className="flex gap-3">
              <Button
                onClick={() => setShowRejectDialog(true)}
                variant="destructive"
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Reject Application
              </Button>
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {actionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Approve Doctor
              </Button>
            </div>
          )}
        </div>

        {/* Admin Notice */}
        <div className={`border-l-4 p-4 rounded-lg ${
          profile.isVerified 
            ? "bg-emerald-50 border-emerald-600" 
            : "bg-amber-50 border-amber-600"
        }`}>
          <div className="flex items-center gap-2">
            {profile.isVerified ? (
              <>
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-900">
                  This doctor is verified and can accept patients
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="text-sm font-medium text-amber-900">
                  Admin View - Review this doctor's credentials and approve or reject their application
                </p>
              </>
            )}
          </div>
        </div>

        {/* Doctor Profile */}
        <DoctorProfilePreview
          profile={profile}
          isPreviewMode={false}
        />

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Doctor Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this doctor's application. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
