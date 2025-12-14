"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { Save, Plus, X, Loader2, AlertCircle, Upload } from "lucide-react"
import { getInitials } from "@/lib/formatters"
import { profileService } from "@/services"
import { useToast } from "@/hooks/use-toast"
import type { PatientProfileSummaryViewModel } from "@/types/backend-types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PatientProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [profile, setProfile] = useState<PatientProfileSummaryViewModel | null>(null)
  
  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [address, setAddress] = useState("")
  const [bloodType, setBloodType] = useState("")
  const [allergies, setAllergies] = useState<string[]>([])
  const [medicalHistory, setMedicalHistory] = useState("")
  const [newAllergy, setNewAllergy] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")
  const [isPregnant, setIsPregnant] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const response = await profileService.getPatientProfile(user.id)
      
      if (response.success && response.data) {
        setProfile(response.data)
        // Populate form fields
        setFirstName(response.data.firstName)
        setLastName(response.data.lastName)
        setEmail(response.data.email)
        setPhoneNumber(response.data.phoneNumber || "")
        setDateOfBirth(response.data.dateOfBirth.split('T')[0]) // Format date
        setGender(response.data.gender)
        setAddress(response.data.address || "")
        setBloodType(response.data.bloodType || "")
        // Parse allergies from comma-separated string to array
        const allergyList = response.data.allergies ? response.data.allergies.split(',').map(a => a.trim()).filter(a => a) : []
        setAllergies(allergyList)
        setMedicalHistory(response.data.medicalHistory || "")
        setEmergencyContact(response.data.emergencyContact || "")
        setEmergencyPhone(response.data.emergencyPhone || "")
        setIsPregnant(response.data.isPregnant || false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy("")
    }
  }

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index))
  }

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingPicture(true)
      const response = await profileService.uploadProfilePicture(user.id, file, "Patient")
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        })
        await loadProfile() // Reload profile to show new picture
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setUploadingPicture(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id || !profile) return

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
        variant: "destructive",
      })
      return
    }

    if (!dateOfBirth) {
      toast({
        title: "Validation Error",
        description: "Date of birth is required",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      const updatedProfile: PatientProfileSummaryViewModel = {
        ...profile,
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        gender,
        address,
        bloodType,
        allergies: allergies.join(', '), // Convert array to comma-separated string
        medicalHistory,
        emergencyContact,
        emergencyPhone,
        isPregnant: gender === "Female" ? isPregnant : false,
      }

      const response = await profileService.updatePatientProfile(user.id, updatedProfile)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        await loadProfile() // Reload to get fresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const isProfileIncomplete = () => {
    if (!profile) return false
    return !phoneNumber || !address || !bloodType || allergies.length === 0 || !emergencyContact || !emergencyPhone
  }

  if (!user) return null

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["patient"]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-emerald-600 pl-4 mb-2">Patient Profile</h1>
          <p className="text-slate-600 text-sm pl-5">Manage your personal information and medical history</p>
        </div>

        {/* Incomplete Profile Alert */}
        {isProfileIncomplete() && (
          <Alert className="border-amber-600 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900">Complete Your Profile</AlertTitle>
            <AlertDescription className="text-amber-800">
              Please complete all required fields to help doctors provide you with the best care possible.
              Missing: {!phoneNumber && "Phone, "}{!address && "Address, "}{!bloodType && "Blood Type, "}{allergies.length === 0 && "Allergies, "}{!emergencyContact && "Emergency Contact, "}{!emergencyPhone && "Emergency Phone"}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Profile Photo */}
          <Card className="border-2 border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Upload or update your profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-emerald-100">
                  <AvatarImage 
                    src={profile?.profilePicture ? `https://localhost:7146${profile.profilePicture}` : undefined} 
                  />
                  <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">
                    {getInitials(firstName, lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPicture}
                    className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  >
                    {uploadingPicture ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="border-2 border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="border-2 bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+250788123456"
                    className="border-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="PreferNotToSay">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Country"
                  className="border-2"
                />
              </div>

              {(gender === "Female" || gender === "female" || gender === "2") && (
                <div className="flex items-center space-x-2 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                  <Checkbox
                    id="isPregnant"
                    checked={isPregnant}
                    onCheckedChange={(checked) => setIsPregnant(checked as boolean)}
                  />
                  <Label htmlFor="isPregnant" className="text-sm font-medium cursor-pointer">
                    I am currently pregnant
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="border-2 border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Provide your medical details for better care</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type *</Label>
                <Select value={bloodType} onValueChange={setBloodType}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Allergies *</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add an allergy (e.g., Penicillin)"
                    className="border-2"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddAllergy()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddAllergy} className="border-2">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allergies.length === 0 ? (
                    <p className="text-sm text-slate-500">No allergies added yet</p>
                  ) : (
                    allergies.map((allergy, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {allergy}
                        <button
                          onClick={() => handleRemoveAllergy(index)}
                          className="ml-1 hover:bg-slate-200 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Describe any chronic conditions, past surgeries, or ongoing treatments..."
                  rows={4}
                  className="border-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-2 border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Provide emergency contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                  <Input
                    id="emergencyContact"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Full name"
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Phone Number *</Label>
                  <Input
                    id="emergencyPhone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+250788123456"
                    className="border-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => loadProfile()}
              disabled={saving}
              className="border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
