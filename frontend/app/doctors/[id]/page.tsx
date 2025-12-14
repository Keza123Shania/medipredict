"use client"

import { use } from "react"
import Link from "next/link"
import { useDoctor } from "@/api/hooks/use-doctors"
import { TopNav } from "@/components/layout/top-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Star,
  Clock,
  BadgeCheck,
  GraduationCap,
  Languages,
  Calendar,
  ArrowLeft,
  Video,
  Phone,
  MapPin,
} from "lucide-react"
import { formatCurrency, getInitials } from "@/lib/formatters"

const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: doctor, isLoading } = useDoctor(id)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <main className="container py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <main className="container py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Doctor not found</h1>
            <Button asChild>
              <Link href="/doctors">Back to Doctors</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/doctors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Doctors
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={doctor.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(doctor.firstName, doctor.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h1>
                      {doctor.isVerified && <BadgeCheck className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="text-lg text-muted-foreground mb-3">{doctor.specialization}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({doctor.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {doctor.languages.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          <Languages className="h-3 w-3 mr-1" />
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education & Training
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {doctor.education.map((edu, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <span className="text-muted-foreground">{edu}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {doctor.availability.map((slot) => (
                    <div key={slot.dayOfWeek} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{dayNames[slot.dayOfWeek]}</span>
                      <span className="text-muted-foreground text-sm">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">{formatCurrency(doctor.consultationFee)}</div>
                  <div className="text-sm text-muted-foreground">per consultation</div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Consultation Types</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center p-3 border rounded-lg">
                      <Video className="h-5 w-5 text-primary mb-1" />
                      <span className="text-xs">Video</span>
                    </div>
                    <div className="flex flex-col items-center p-3 border rounded-lg">
                      <Phone className="h-5 w-5 text-primary mb-1" />
                      <span className="text-xs">Phone</span>
                    </div>
                    <div className="flex flex-col items-center p-3 border rounded-lg">
                      <MapPin className="h-5 w-5 text-primary mb-1" />
                      <span className="text-xs">In-Person</span>
                    </div>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href={`/patient/appointments/book?doctor=${doctor.id}`}>Book Appointment</Link>
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Free cancellation up to 24 hours before the appointment
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
