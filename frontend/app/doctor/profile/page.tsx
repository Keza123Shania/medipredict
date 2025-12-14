"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Save, User, Loader2, GraduationCap, Award, Calendar, Building2, Clock, Plus, X, Upload, Eye } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { profileService } from "@/services"
import type { DoctorProfileViewModel } from "@/types/backend-types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function DoctorProfilePage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()
  const [profile, setProfile] = useState<DoctorProfileViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAvailability, setSavingAvailability] = useState(false)
  const [savingCredentials, setSavingCredentials] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  // Settings state for consultation fee
  const [settingsConsultationFee, setSettingsConsultationFee] = useState(0)
  
  // Editable profile state
  const [editableProfile, setEditableProfile] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    specialization: "",
    qualifications: "",
    experience: 0,
    consultationFee: 0,
    bio: "",
    address: ""
  })
  
  // Availability state
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  // Education and Certification entries for editing
  const [educationEntries, setEducationEntries] = useState<any[]>([])
  const [certificationEntries, setCertificationEntries] = useState<any[]>([])

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Parse education entries from the stored string format
  const parseEducationEntries = (educationString?: string) => {
    if (!educationString) return []
    return educationString.split('\n').filter(line => line.trim()).map((line, index) => {
      // Format: "MD - Harvard Medical School (2005-2009) | Cardiology"
      const match = line.match(/^(.+?)\s*-\s*(.+?)\s*\((.+?)-(.+?)\)(?:\s*\|\s*(.+))?$/)
      if (match) {
        return {
          id: index,
          degree: match[1].trim(),
          institution: match[2].trim(),
          yearStart: match[3].trim(),
          yearEnd: match[4].trim(),
          specialty: match[5]?.trim()
        }
      }
      return null
    }).filter(Boolean)
  }

  // Parse certification entries from the stored string format
  const parseCertificationEntries = (certificationString?: string) => {
    if (!certificationString) return []
    return certificationString.split('\n').filter(line => line.trim()).map((line, index) => {
      // Format: "American Board of Internal Medicine - Issuing Body | Certified 2012-10-13, Expires 2029-11-13"
      const match = line.match(/^(.+?)\s*-\s*(.+?)\s*\|\s*Certified\s+(.+?),\s*Expires\s+(.+)$/)
      if (match) {
        return {
          id: index,
          name: match[1].trim(),
          issuingBody: match[2].trim(),
          certifiedDate: match[3].trim(),
          expiryDate: match[4].trim()
        }
      }
      return null
    }).filter(Boolean)
  }

  useEffect(() => {
    if (profile) {
      // Parse full name
      const nameParts = profile.fullName.split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""
      
      setEditableProfile({
        firstName,
        lastName,
        phoneNumber: profile.phoneNumber || "",
        specialization: profile.specialization || "",
        qualifications: profile.qualifications || "",
        experience: profile.experience || 0,
        consultationFee: profile.consultationFee || 0,
        bio: profile.bio || "",
        address: profile.address || ""
      })
      setSelectedDays(profile.availableDays || [])
      setStartTime(profile.availableTimeStart || "")
      setEndTime(profile.availableTimeEnd || "")
      setSettingsConsultationFee(profile.consultationFee || 0)
      
      // Parse and set education/certification entries
      setEducationEntries(parseEducationEntries(profile.educationTraining))
      setCertificationEntries(parseCertificationEntries(profile.boardCertifications))
    }
  }, [profile])

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      console.log("No userId available")
      setLoading(false)
      return
    }
    
    try {
      console.log("Loading profile for userId:", user.id)
      setLoading(true)
      setError(null)
      const response = await profileService.getDoctorProfile(user.id)
      console.log("Profile response:", response)
      if (response.success && response.data) {
        setProfile(response.data)
      } else {
        setError(response.message || "Failed to load profile")
      }
    } catch (err) {
      console.error("Error loading profile:", err)
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

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

  const getInitials = () => {
    const names = profile.fullName.split(" ")
    return names.map((n) => n[0]).join("").toUpperCase()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const saveProfileInfo = async () => {
    try {
      setSavingProfile(true)
      const response = await profileService.updateDoctorProfile(user!.id, {
        firstName: editableProfile.firstName,
        lastName: editableProfile.lastName,
        phoneNumber: editableProfile.phoneNumber,
        specialization: editableProfile.specialization,
        qualifications: editableProfile.qualifications,
        experience: editableProfile.experience,
        consultationFee: editableProfile.consultationFee,
        bio: editableProfile.bio,
        address: editableProfile.address,
        availableDays: selectedDays,
        availableTimeStart: startTime,
        availableTimeEnd: endTime
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully"
        })
        await loadProfile()
      } else {
        throw new Error(response.message || "Failed to save profile")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save profile",
        variant: "destructive"
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const saveAvailability = async () => {
    if (selectedDays.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one available day",
        variant: "destructive"
      })
      return
    }

    if (!startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please set both start and end times",
        variant: "destructive"
      })
      return
    }

    try {
      setSavingAvailability(true)
      const response = await profileService.updateDoctorProfile(user!.id, {
        firstName: editableProfile.firstName,
        lastName: editableProfile.lastName,
        phoneNumber: editableProfile.phoneNumber,
        specialization: editableProfile.specialization,
        qualifications: editableProfile.qualifications,
        experience: editableProfile.experience,
        consultationFee: editableProfile.consultationFee,
        bio: editableProfile.bio,
        address: editableProfile.address,
        availableDays: selectedDays,
        availableTimeStart: startTime,
        availableTimeEnd: endTime
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Availability settings saved successfully"
        })
        await loadProfile()
      } else {
        throw new Error(response.message || "Failed to save availability")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save availability",
        variant: "destructive"
      })
    } finally {
      setSavingAvailability(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSavingSettings(true)
      
      // Send ALL profile fields to prevent data loss
      const updateData = {
        firstName: editableProfile.firstName,
        lastName: editableProfile.lastName,
        phoneNumber: editableProfile.phoneNumber,
        specialization: editableProfile.specialization,
        qualifications: editableProfile.qualifications,
        experience: editableProfile.experience,
        consultationFee: settingsConsultationFee, // Use settings fee
        bio: editableProfile.bio,
        address: editableProfile.address,
        availableDays: selectedDays,
        availableTimeStart: startTime,
        availableTimeEnd: endTime
      }
      
      const result = await profileService.updateDoctorProfile(user!.id, updateData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
        // Update local profile state
        setEditableProfile(prev => ({ ...prev, consultationFee: settingsConsultationFee }))
        await loadProfile() // Refresh profile
      } else {
        throw new Error(result.message || "Failed to save settings")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setSavingSettings(false)
    }
  }

  // Education entry management
  const addEducationEntry = () => {
    setEducationEntries([...educationEntries, { 
      id: Date.now(), 
      degree: "", 
      institution: "", 
      yearStart: "", 
      yearEnd: "", 
      specialty: "" 
    }])
  }

  const updateEducationEntry = (id: number, field: string, value: string) => {
    setEducationEntries(educationEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ))
  }

  const removeEducationEntry = (id: number) => {
    setEducationEntries(educationEntries.filter(entry => entry.id !== id))
  }

  // Certification entry management
  const addCertificationEntry = () => {
    setCertificationEntries([...certificationEntries, { 
      id: Date.now(), 
      name: "", 
      issuingBody: "", 
      certifiedDate: "", 
      expiryDate: "" 
    }])
  }

  const updateCertificationEntry = (id: number, field: string, value: string) => {
    setCertificationEntries(certificationEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ))
  }

  const removeCertificationEntry = (id: number) => {
    setCertificationEntries(certificationEntries.filter(entry => entry.id !== id))
  }

  // Format entries for backend
  const formatEducationForBackend = (): string => {
    return educationEntries
      .filter((entry) => entry.degree && entry.institution)
      .map((entry) => {
        const specialty = entry.specialty ? ` | ${entry.specialty}` : ""
        return `${entry.degree} - ${entry.institution} (${entry.yearStart}-${entry.yearEnd})${specialty}`
      })
      .join("\n")
  }

  const formatCertificationsForBackend = (): string => {
    return certificationEntries
      .filter((entry) => entry.name && entry.issuingBody)
      .map((entry) => {
        return `${entry.name} - ${entry.issuingBody} | Certified ${entry.certifiedDate}, Expires ${entry.expiryDate}`
      })
      .join("\n")
  }

  const saveCredentials = async () => {
    try {
      setSavingCredentials(true)
      
      const educationTraining = formatEducationForBackend()
      const boardCertifications = formatCertificationsForBackend()
      
      const response = await profileService.updateDoctorProfile(user!.id, {
        firstName: editableProfile.firstName,
        lastName: editableProfile.lastName,
        phoneNumber: editableProfile.phoneNumber,
        specialization: editableProfile.specialization,
        qualifications: editableProfile.qualifications,
        experience: editableProfile.experience,
        consultationFee: editableProfile.consultationFee,
        bio: editableProfile.bio,
        address: editableProfile.address,
        availableDays: selectedDays,
        availableTimeStart: startTime,
        availableTimeEnd: endTime,
        educationTraining,
        boardCertifications
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Credentials updated successfully"
        })
        await loadProfile()
      } else {
        throw new Error(response.message || "Failed to save credentials")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save credentials",
        variant: "destructive"
      })
    } finally {
      setSavingCredentials(false)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 2MB",
        variant: "destructive"
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive"
      })
      return
    }

    try {
      setUploadingPhoto(true)
      const result = await profileService.uploadProfilePicture(user!.id, file, "Doctor")
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile photo updated successfully",
        })
        // Refresh profile to show new photo
        await loadProfile()
      } else {
        throw new Error(result.message || "Failed to upload photo")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile photo",
        variant: "destructive"
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Helper to get current display value (editable or fallback to profile)
  const getDisplayValue = (editableValue: any, profileValue: any) => {
    if (editableValue !== "" && editableValue !== 0) return editableValue
    return profileValue || ""
  }

  return (
    <DashboardLayout allowedRoles={["doctor"]}>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-emerald-600 pl-4 mb-2 flex items-center gap-3">
            <User className="h-6 w-6 text-emerald-600" />
            Doctor Profile
          </h1>
          <p className="text-slate-600 text-sm pl-5">Manage your professional profile and settings</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push('/doctor/profile-preview')}
          className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview Profile
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>This photo will be visible to patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={profile.profilePicture ? `https://localhost:7146${profile.profilePicture}` : undefined} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Change Photo
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Bio */}
          <Card className="border-2 border-emerald-200 bg-emerald-50/30">
            <CardHeader>
              <CardTitle className="text-emerald-900">Professional Bio</CardTitle>
              <CardDescription>Share your background, expertise, and approach with patients</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                value={editableProfile.bio}
                onChange={(e) => setEditableProfile({...editableProfile, bio: e.target.value})}
                placeholder="Tell patients about your medical background, areas of expertise, treatment philosophy, and what makes your practice unique..."
                className="border-2 border-emerald-200 focus:border-emerald-500"
              />
              <p className="text-xs text-emerald-700 mt-2">
                A comprehensive bio helps patients understand your expertise and feel confident in booking with you.
              </p>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your professional details visible to patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={editableProfile.firstName || ""} 
                    onChange={(e) => setEditableProfile({...editableProfile, firstName: e.target.value})}
                    placeholder={profile?.fullName.split(" ")[0] || "First Name"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={editableProfile.lastName || ""} 
                    onChange={(e) => setEditableProfile({...editableProfile, lastName: e.target.value})}
                    placeholder={profile?.fullName.split(" ").slice(1).join(" ") || "Last Name"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input id="title" value={profile?.professionalTitle || "N/A"} readOnly className="bg-slate-50" />
                  <p className="text-xs text-muted-foreground">Set during registration</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input 
                    id="specialization" 
                    value={editableProfile.specialization || ""}
                    onChange={(e) => setEditableProfile({...editableProfile, specialization: e.target.value})}
                    placeholder={profile?.specialization || "Specialization"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input 
                    id="experience" 
                    type="number" 
                    value={editableProfile.experience || 0}
                    onChange={(e) => setEditableProfile({...editableProfile, experience: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                  <Input 
                    id="consultationFee" 
                    type="number" 
                    step="0.01"
                    value={editableProfile.consultationFee || 0}
                    onChange={(e) => setEditableProfile({...editableProfile, consultationFee: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile?.email || ""} readOnly className="bg-slate-50" />
                  <p className="text-xs text-muted-foreground">Cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    value={editableProfile.phoneNumber || ""}
                    onChange={(e) => setEditableProfile({...editableProfile, phoneNumber: e.target.value})}
                    placeholder={profile?.phoneNumber || "Phone Number"}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Clinic Address</Label>
                  <Input 
                    id="address" 
                    value={editableProfile.address || ""}
                    onChange={(e) => setEditableProfile({...editableProfile, address: e.target.value})}
                    placeholder={profile?.address || "Clinic Address"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle>Qualifications</CardTitle>
              <CardDescription>Educational background and degrees</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                rows={3} 
                value={editableProfile.qualifications}
                onChange={(e) => setEditableProfile({...editableProfile, qualifications: e.target.value})}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveProfileInfo} disabled={savingProfile} className="bg-emerald-600 hover:bg-emerald-700">
              {savingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="credentials" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical License</CardTitle>
              <CardDescription>Your medical license information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input id="licenseNumber" value={profile.licenseNumber} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseState">Issuing State</Label>
                  <Input id="licenseState" value={profile.licenseState || "N/A"} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseIssue">Issue Date</Label>
                  <Input id="licenseIssue" value={formatDate(profile.licenseIssueDate)} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">Expiry Date</Label>
                  <Input id="licenseExpiry" value={formatDate(profile.licenseExpiryDate)} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="npi">NPI Number</Label>
                  <Input id="npi" value={profile.npiNumber || "N/A"} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                Education & Training
              </CardTitle>
              <CardDescription>Add your educational background and training history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {educationEntries.map((entry, index) => (
                <div key={entry.id} className="border-2 border-emerald-100 rounded-lg p-4 bg-emerald-50/30 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-slate-900">Education Entry {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducationEntry(entry.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input
                        value={entry.degree}
                        onChange={(e) => updateEducationEntry(entry.id, 'degree', e.target.value)}
                        placeholder="e.g., MD, PhD, MBBS"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input
                        value={entry.institution}
                        onChange={(e) => updateEducationEntry(entry.id, 'institution', e.target.value)}
                        placeholder="e.g., Harvard Medical School"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Year</Label>
                      <Input
                        value={entry.yearStart}
                        onChange={(e) => updateEducationEntry(entry.id, 'yearStart', e.target.value)}
                        placeholder="e.g., 2010"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Year</Label>
                      <Input
                        value={entry.yearEnd}
                        onChange={(e) => updateEducationEntry(entry.id, 'yearEnd', e.target.value)}
                        placeholder="e.g., 2014"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Specialty (Optional)</Label>
                      <Input
                        value={entry.specialty}
                        onChange={(e) => updateEducationEntry(entry.id, 'specialty', e.target.value)}
                        placeholder="e.g., Cardiology, Neurology"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addEducationEntry}
                className="w-full border-dashed border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Education Entry
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Board Certifications
              </CardTitle>
              <CardDescription>Add your professional board certifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificationEntries.map((entry, index) => (
                <div key={entry.id} className="border-2 border-blue-100 rounded-lg p-4 bg-blue-50/30 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-slate-900">Certification {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertificationEntry(entry.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Certification Name</Label>
                      <Input
                        value={entry.name}
                        onChange={(e) => updateCertificationEntry(entry.id, 'name', e.target.value)}
                        placeholder="e.g., Board Certified in Internal Medicine"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Issuing Organization</Label>
                      <Input
                        value={entry.issuingBody}
                        onChange={(e) => updateCertificationEntry(entry.id, 'issuingBody', e.target.value)}
                        placeholder="e.g., American Board of Internal Medicine"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Certified Date</Label>
                      <Input
                        type="date"
                        value={entry.certifiedDate}
                        onChange={(e) => updateCertificationEntry(entry.id, 'certifiedDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={entry.expiryDate}
                        onChange={(e) => updateCertificationEntry(entry.id, 'expiryDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addCertificationEntry}
                className="w-full border-dashed border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Certification
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveCredentials} disabled={savingCredentials} className="bg-blue-600 hover:bg-blue-700">
              {savingCredentials ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Credentials
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-6">
          {/* Availability Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                Availability Settings
              </CardTitle>
              <CardDescription>Set your available days and hours for patient appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Available Days</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "px-4 py-3 rounded-lg border-2 font-medium transition-all",
                        selectedDays.includes(day)
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                          : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="startTime" className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    Start Time
                  </Label>
                  <div className="relative">
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-12 text-lg border-2 border-slate-200 focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-sm text-slate-500">When you start seeing patients</p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="endTime" className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    End Time
                  </Label>
                  <div className="relative">
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-12 text-lg border-2 border-slate-200 focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-sm text-slate-500">When you finish appointments</p>
                </div>
              </div>

              {startTime && endTime && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-800">
                    <span className="font-semibold">Working Hours:</span> {startTime} - {endTime}
                    {" "}({selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'} selected)
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button 
                  onClick={saveAvailability} 
                  disabled={savingAvailability}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {savingAvailability ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Availability
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    label: "New appointment bookings",
                    description: "Get notified when a patient books an appointment",
                  },
                  { label: "Appointment reminders", description: "Receive reminders before scheduled appointments" },
                  { label: "New prediction reviews", description: "Alert when AI predictions need your review" },
                  { label: "Patient messages", description: "Notifications for new patient messages" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consultation Fee</CardTitle>
              <CardDescription>Set your consultation rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    id="consultationFee" 
                    type="number" 
                    step="0.01"
                    value={settingsConsultationFee} 
                    onChange={(e) => setSettingsConsultationFee(parseFloat(e.target.value) || 0)}
                    className="pl-7" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={saveSettings} 
              disabled={savingSettings}
              className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  )
}
