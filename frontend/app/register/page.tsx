"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/hooks/use-auth"
import { registerSchema, type RegisterFormData } from "@/lib/validators"
import { TopNav } from "@/components/layout/top-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Activity, Loader2, Eye, EyeOff, User, Stethoscope, Info, Plus, X } from "lucide-react"

const specializations = [
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Psychiatry",
  "Pediatrics",
  "Neurology",
  "Oncology",
  "Gastroenterology",
  "Pulmonology",
  "Endocrinology",
  "Nephrology",
  "Urology",
  "Ophthalmology",
  "ENT (Ear, Nose, Throat)",
  "Rheumatology",
  "Hematology",
  "Infectious Disease",
  "Other",
]

interface EducationEntry {
  id: string
  degree: string
  institution: string
  yearStart: string
  yearEnd: string
  specialty?: string
}

interface CertificationEntry {
  id: string
  name: string
  issuingBody: string
  certifiedDate: string
  expiryDate: string
}

export default function RegisterPage() {
  const { signUp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([])
  const [certificationEntries, setCertificationEntries] = useState<CertificationEntry[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "patient",
    },
  })

  const selectedRole = watch("role")

  // Helper functions for education entries
  const addEducationEntry = () => {
    setEducationEntries([
      ...educationEntries,
      { id: Date.now().toString(), degree: "", institution: "", yearStart: "", yearEnd: "", specialty: "" },
    ])
  }

  const removeEducationEntry = (id: string) => {
    setEducationEntries(educationEntries.filter((entry) => entry.id !== id))
  }

  const updateEducationEntry = (id: string, field: keyof EducationEntry, value: string) => {
    setEducationEntries(
      educationEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)),
    )
  }

  // Helper functions for certification entries
  const addCertificationEntry = () => {
    setCertificationEntries([
      ...certificationEntries,
      { id: Date.now().toString(), name: "", issuingBody: "", certifiedDate: "", expiryDate: "" },
    ])
  }

  const removeCertificationEntry = (id: string) => {
    setCertificationEntries(certificationEntries.filter((entry) => entry.id !== id))
  }

  const updateCertificationEntry = (id: string, field: keyof CertificationEntry, value: string) => {
    setCertificationEntries(
      certificationEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)),
    )
  }

  // Convert entries to formatted strings for backend
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

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)

    // Add formatted education and certification data
    const educationTraining = formatEducationForBackend()
    const boardCertifications = formatCertificationsForBackend()

    const result = await signUp({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      phoneNumber: data.phoneNumber,
      specialization: data.specialization,
      professionalTitle: data.professionalTitle,
      licenseNumber: data.licenseNumber,
      licenseState: data.licenseState,
      licenseIssueDate: data.licenseIssueDate,
      licenseExpiryDate: data.licenseExpiryDate,
      npiNumber: data.npiNumber,
      experience: data.experience,
      qualifications: data.qualifications,
      educationTraining: educationTraining || undefined,
      boardCertifications: boardCertifications || undefined,
      consultationFee: data.consultationFee,
    })
    if (!result.success) {
      setError(result.error || "Registration failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <TopNav showAuthButtons={false} />
      <main className="container flex items-center justify-center py-12 md:py-24">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 mb-6 shadow-lg shadow-emerald-600/30">
              <Activity className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Join MediPredict</h1>
            <p className="text-lg text-slate-600">Create your account to get started</p>
          </div>

          <Card className="border-2 border-slate-200 shadow-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-900">I am a</Label>
                <RadioGroup
                  value={selectedRole}
                  onValueChange={(value) => setValue("role", value as "patient" | "doctor")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="patient" id="patient" className="peer sr-only" />
                    <Label
                      htmlFor="patient"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-300 bg-white p-6 hover:bg-emerald-50 hover:border-emerald-500 peer-data-[state=checked]:border-emerald-600 peer-data-[state=checked]:bg-emerald-50 [&:has([data-state=checked])]:border-emerald-600 cursor-pointer transition-all"
                    >
                      <User className="mb-3 h-8 w-8 text-emerald-600" />
                      <span className="text-base font-bold text-slate-900">Patient</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="doctor" id="doctor" className="peer sr-only" />
                    <Label
                      htmlFor="doctor"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-300 bg-white p-6 hover:bg-emerald-50 hover:border-emerald-500 peer-data-[state=checked]:border-emerald-600 peer-data-[state=checked]:bg-emerald-50 [&:has([data-state=checked])]:border-emerald-600 cursor-pointer transition-all"
                    >
                      <Stethoscope className="mb-3 h-8 w-8 text-emerald-600" />
                      <span className="text-base font-bold text-slate-900">Doctor</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-slate-900">First Name *</Label>
                  <Input id="firstName" placeholder="John" className="h-11 border-2 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500" {...register("firstName")} />
                  {errors.firstName && <p className="text-sm text-red-600 font-medium">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-slate-900">Last Name *</Label>
                  <Input id="lastName" placeholder="Doe" className="h-11 border-2 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500" {...register("lastName")} />
                  {errors.lastName && <p className="text-sm text-red-600 font-medium">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-900">Email *</Label>
                <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" className="h-11 border-2 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500" {...register("email")} />
                {errors.email && <p className="text-sm text-red-600 font-medium">{errors.email.message}</p>}
              </div>

              {/* Patient-specific fields */}
              {selectedRole === "patient" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                      {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <select
                        id="gender"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...register("gender")}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" type="tel" placeholder="+1 (555) 000-0000" {...register("phoneNumber")} />
                    {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
                  </div>
                </>
              )}

              {/* Doctor-specific fields */}
              {selectedRole === "doctor" && (
                <>
                  <Alert className="bg-emerald-50 border-emerald-200">
                    <Info className="h-4 w-4 text-emerald-700" />
                    <AlertDescription className="text-emerald-800 font-medium">
                      Additional information required for doctor registration. Your account will be verified by admin before activation.
                    </AlertDescription>
                  </Alert>

                  {/* Basic Info for Doctors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input id="dateOfBirth" type="date" className="h-11 border-2 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500" {...register("dateOfBirth")} />
                      {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <select
                        id="gender"
                        className="flex h-11 w-full rounded-md border-2 border-slate-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                        {...register("gender")}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization *</Label>
                      <select
                        id="specialization"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...register("specialization")}
                      >
                        <option value="">Select specialization</option>
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                      {errors.specialization && (
                        <p className="text-sm text-destructive">{errors.specialization.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="professionalTitle">Professional Title</Label>
                      <Input id="professionalTitle" placeholder="MD, FACC" {...register("professionalTitle")} />
                      {errors.professionalTitle && <p className="text-sm text-destructive">{errors.professionalTitle.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number *</Label>
                      <Input id="licenseNumber" placeholder="MD12345" {...register("licenseNumber")} />
                      {errors.licenseNumber && <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseState">License State *</Label>
                      <Input id="licenseState" placeholder="New York" {...register("licenseState")} />
                      {errors.licenseState && <p className="text-sm text-destructive">{errors.licenseState.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseIssueDate">License Issue Date *</Label>
                      <Input id="licenseIssueDate" type="date" {...register("licenseIssueDate")} />
                      {errors.licenseIssueDate && <p className="text-sm text-destructive">{errors.licenseIssueDate.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseExpiryDate">License Expiry Date *</Label>
                      <Input id="licenseExpiryDate" type="date" {...register("licenseExpiryDate")} />
                      {errors.licenseExpiryDate && <p className="text-sm text-destructive">{errors.licenseExpiryDate.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="npiNumber">NPI Number</Label>
                      <Input id="npiNumber" placeholder="1234567890" {...register("npiNumber")} />
                      {errors.npiNumber && <p className="text-sm text-destructive">{errors.npiNumber.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience *</Label>
                      <Input id="experience" type="number" min="0" max="60" placeholder="10" {...register("experience", { valueAsNumber: true })} />
                      {errors.experience && <p className="text-sm text-destructive">{errors.experience.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consultationFee">Consultation Fee ($) *</Label>
                      <Input id="consultationFee" type="number" min="0" step="0.01" placeholder="100.00" {...register("consultationFee", { valueAsNumber: true })} />
                      {errors.consultationFee && <p className="text-sm text-destructive">{errors.consultationFee.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Qualifications *</Label>
                    <Textarea id="qualifications" placeholder="MBBS, MD - Include your degrees, certifications, and training" rows={3} {...register("qualifications")} />
                    <p className="text-xs text-muted-foreground">List your medical degrees, certifications, and training</p>
                    {errors.qualifications && <p className="text-sm text-destructive">{errors.qualifications.message}</p>}
                  </div>

                  {/* Education & Training Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Education & Training</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addEducationEntry}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Education
                      </Button>
                    </div>
                    {educationEntries.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No education entries added yet</p>
                    ) : (
                      <div className="space-y-3">
                        {educationEntries.map((entry) => (
                          <Card key={entry.id} className="p-4 relative">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => removeEducationEntry(entry.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="grid grid-cols-2 gap-3 pr-8">
                              <div className="space-y-1">
                                <Label className="text-xs">Degree *</Label>
                                <Input
                                  placeholder="MD, Residency, Fellowship"
                                  value={entry.degree}
                                  onChange={(e) => updateEducationEntry(entry.id, "degree", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Institution *</Label>
                                <Input
                                  placeholder="Harvard Medical School"
                                  value={entry.institution}
                                  onChange={(e) => updateEducationEntry(entry.id, "institution", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Start Year</Label>
                                <Input
                                  placeholder="2005"
                                  value={entry.yearStart}
                                  onChange={(e) => updateEducationEntry(entry.id, "yearStart", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">End Year</Label>
                                <Input
                                  placeholder="2009"
                                  value={entry.yearEnd}
                                  onChange={(e) => updateEducationEntry(entry.id, "yearEnd", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1 col-span-2">
                                <Label className="text-xs">Specialty (Optional)</Label>
                                <Input
                                  placeholder="Cardiology, Internal Medicine, etc."
                                  value={entry.specialty || ""}
                                  onChange={(e) => updateEducationEntry(entry.id, "specialty", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Board Certifications Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Board Certifications</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addCertificationEntry}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Certification
                      </Button>
                    </div>
                    {certificationEntries.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No certifications added yet</p>
                    ) : (
                      <div className="space-y-3">
                        {certificationEntries.map((entry) => (
                          <Card key={entry.id} className="p-4 relative">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => removeCertificationEntry(entry.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="grid grid-cols-2 gap-3 pr-8">
                              <div className="space-y-1 col-span-2">
                                <Label className="text-xs">Certification Name *</Label>
                                <Input
                                  placeholder="American Board of Internal Medicine"
                                  value={entry.name}
                                  onChange={(e) => updateCertificationEntry(entry.id, "name", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1 col-span-2">
                                <Label className="text-xs">Issuing Body *</Label>
                                <Input
                                  placeholder="American Board of Medical Specialties"
                                  value={entry.issuingBody}
                                  onChange={(e) => updateCertificationEntry(entry.id, "issuingBody", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Certified Date</Label>
                                <Input
                                  type="date"
                                  value={entry.certifiedDate}
                                  onChange={(e) => updateCertificationEntry(entry.id, "certifiedDate", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Expiry Date</Label>
                                <Input
                                  type="date"
                                  value={entry.expiryDate}
                                  onChange={(e) => updateCertificationEntry(entry.id, "expiryDate", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input id="phoneNumber" type="tel" placeholder="+1 (555) 000-0000" {...register("phoneNumber")} />
                    {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
                  </div>
                </>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      {...register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">At least 6 characters with uppercase, lowercase, and digit</p>
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/30" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <User className="mr-2 h-5 w-5" />
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600">Already have an account? </span>
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-bold">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  )
}
