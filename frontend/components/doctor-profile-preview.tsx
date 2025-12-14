"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  GraduationCap, 
  Award, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Briefcase,
  CheckCircle2,
  FileText,
  DollarSign
} from "lucide-react"
import type { DoctorProfileViewModel } from "@/types/backend-types"

interface DoctorProfilePreviewProps {
  profile: DoctorProfileViewModel
  isPreviewMode?: boolean
  onBookAppointment?: () => void
}

export function DoctorProfilePreview({ profile, isPreviewMode = false, onBookAppointment }: DoctorProfilePreviewProps) {
  const getInitials = () => {
    const names = profile.fullName.split(" ")
    return names.map((n) => n[0]).join("").toUpperCase()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const parseEducationEntries = (educationString?: string) => {
    if (!educationString) return []
    return educationString.split('\n').filter(line => line.trim()).map((line, index) => {
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

  const parseCertificationEntries = (certificationString?: string) => {
    if (!certificationString) return []
    return certificationString.split('\n').filter(line => line.trim()).map((line, index) => {
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

  const educationEntries = parseEducationEntries(profile.educationTraining)
  const certificationEntries = parseCertificationEntries(profile.boardCertifications)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">
              Preview Mode - This is how patients will see your profile
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="border-2 border-slate-200 shadow-lg overflow-hidden rounded-lg bg-white">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 h-24"></div>
        <div className="pt-0 pb-8 px-6">
          {/* Profile Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
            {/* Profile Picture - Overlaps gradient */}
            <div className="-mt-12">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage 
                  src={profile.profilePicture ? `https://localhost:7146${profile.profilePicture}` : undefined} 
                  alt={profile.fullName} 
                />
                <AvatarFallback className="text-3xl bg-emerald-100 text-emerald-700">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name, Title, and Badges - Sits cleanly below gradient */}
            <div className="flex-1 pt-6 md:pt-4">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{profile.fullName}</h1>
                {profile.isVerified && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified
                  </div>
                )}
              </div>
              <p className="text-lg text-slate-600 mt-1">{profile.professionalTitle || "Medical Doctor"}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-sm px-3 py-1">
                  {profile.specialization}
                </Badge>
                <Badge variant="outline" className="border-amber-300 text-amber-700 text-sm px-3 py-1">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {profile.experience} years exp.
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Section - Separated with clear spacing */}
          <div className="grid grid-cols-3 gap-6 py-6 px-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{profile.totalPatients || 0}</div>
              <div className="text-sm text-slate-600 mt-1">Patients</div>
            </div>
            <div className="text-center border-x border-slate-300">
              <div className="text-3xl font-bold text-emerald-600">{profile.completedConsultations || 0}</div>
              <div className="text-sm text-slate-600 mt-1">Consultations</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                <span className="text-3xl font-bold text-slate-900">
                  {profile.averageRating ? profile.averageRating.toFixed(1) : "5.0"}
                </span>
              </div>
              <div className="text-sm text-slate-600">{profile.totalReviews || 0} reviews</div>
            </div>
          </div>

          {/* Action Button */}
          {!isPreviewMode && onBookAppointment && (
            <div className="mt-6">
              <Button 
                size="lg" 
                className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                onClick={onBookAppointment}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* About / Bio */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Education & Training */}
          {educationEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  Education & Training
                </CardTitle>
                <CardDescription>Academic background and medical training</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {educationEntries.map((entry: any) => (
                    <div
                      key={entry.id}
                      className="relative pl-6 pb-4 border-l-2 border-emerald-200 last:pb-0"
                    >
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white" />
                      <div className="space-y-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-slate-900">{entry.degree}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {entry.yearStart} - {entry.yearEnd}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{entry.institution}</p>
                        {entry.specialty && (
                          <p className="text-sm text-emerald-700 font-medium">
                            Specialty: {entry.specialty}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Board Certifications */}
          {certificationEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Board Certifications
                </CardTitle>
                <CardDescription>Professional certifications and credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {certificationEntries.map((entry: any) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg"
                    >
                      <Award className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900">{entry.name}</h4>
                        <p className="text-sm text-slate-600">{entry.issuingBody}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                          <span>Certified: {new Date(entry.certifiedDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Expires: {new Date(entry.expiryDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Qualifications */}
          {profile.qualifications && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-line">{profile.qualifications}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          {/* Consultation Fee */}
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <DollarSign className="h-5 w-5" />
                Consultation Fee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">
                ${profile.consultationFee?.toFixed(2) || "0.00"}
              </div>
              <p className="text-sm text-emerald-600 mt-1">per consultation</p>
            </CardContent>
          </Card>

          {/* Availability */}
          {profile.availableDays && profile.availableDays.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Available Days</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.availableDays.map((day) => (
                      <Badge key={day} variant="outline" className="border-emerald-300 text-emerald-700">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Working Hours</h4>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {profile.availableTimeStart} - {profile.availableTimeEnd}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-500" />
                <span className="text-slate-700">{profile.phoneNumber || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-slate-700 break-all">{profile.email}</span>
              </div>
              {profile.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-500 mt-1" />
                  <span className="text-slate-700">{profile.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* License Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                License Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">License Number:</span>
                <p className="font-medium text-slate-900">{profile.licenseNumber}</p>
              </div>
              {profile.licenseState && (
                <div>
                  <span className="text-slate-500">Issuing State:</span>
                  <p className="font-medium text-slate-900">{profile.licenseState}</p>
                </div>
              )}
              {profile.licenseIssueDate && (
                <div>
                  <span className="text-slate-500">Issue Date:</span>
                  <p className="font-medium text-slate-900">{formatDate(profile.licenseIssueDate)}</p>
                </div>
              )}
              {profile.licenseExpiryDate && (
                <div>
                  <span className="text-slate-500">Expiry Date:</span>
                  <p className="font-medium text-slate-900">{formatDate(profile.licenseExpiryDate)}</p>
                </div>
              )}
              {profile.npiNumber && (
                <div>
                  <span className="text-slate-500">NPI Number:</span>
                  <p className="font-medium text-slate-900">{profile.npiNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
