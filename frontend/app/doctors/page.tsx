"use client"

import { useState } from "react"
import Link from "next/link"
import { useDoctors } from "@/api/hooks/use-doctors"
import { TopNav } from "@/components/layout/top-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Star, Clock, BadgeCheck, Stethoscope, Calendar, DollarSign, RotateCcw, Filter, GraduationCap, Briefcase, MapPin, Info } from "lucide-react"
import { formatCurrency, getInitials } from "@/lib/formatters"

const specializations = [
  "All Specializations",
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Psychiatry",
  "Pediatrics",
  "Neurology",
  "Gastroenterology",
  "Pulmonology",
  "Endocrinology",
  "Nephrology",
  "Urology",
  "Ophthalmology",
  "ENT (Ear, Nose, Throat)",
  "Rheumatology",
]

const availabilityDays = [
  "Any Day",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const sortOptions = [
  { value: "rating", label: "Highest Rated" },
  { value: "experience", label: "Most Experienced" },
  { value: "fee", label: "Lowest Fee" },
  { value: "name", label: "Name (A-Z)" },
]

export default function DoctorsPage() {
  const [search, setSearch] = useState("")
  const [specialization, setSpecialization] = useState("all")
  const [availability, setAvailability] = useState("any")
  const [sortBy, setSortBy] = useState("rating")
  const [maxFee, setMaxFee] = useState("")
  const [minRating, setMinRating] = useState("")
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const { data, isLoading } = useDoctors({
    search: search || undefined,
    specialization: specialization !== "all" ? specialization : undefined,
  })

  const resetFilters = () => {
    setSearch("")
    setSpecialization("all")
    setAvailability("any")
    setSortBy("rating")
    setMaxFee("")
    setMinRating("")
    setVerifiedOnly(false)
  }

  const hasActiveFilters = search || specialization !== "all" || availability !== "any" || 
    maxFee || minRating || verifiedOnly || sortBy !== "rating"

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="container py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Find Verified Doctors
          </h1>
          <p className="text-lg text-muted-foreground">Connect with experienced healthcare professionals</p>
        </div>

        {/* Advanced Filters */}
        <Card className="mb-8 shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </Label>
                  <Input
                    placeholder="Search by name or specialization..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Specialization
                  </Label>
                  <Select value={specialization} onValueChange={setSpecialization}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Specializations" />
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
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Availability
                  </Label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {availabilityDays.map((day) => (
                        <SelectItem key={day} value={day === "Any Day" ? "any" : day.toLowerCase()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Sort By
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Max Fee
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 150"
                    value={maxFee}
                    onChange={(e) => setMaxFee(e.target.value)}
                    min="0"
                    step="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Min Rating
                  </Label>
                  <Select value={minRating} onValueChange={setMinRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Rating</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                      id="verified"
                      checked={verifiedOnly}
                      onCheckedChange={(checked) => setVerifiedOnly(checked === true)}
                    />
                    <Label
                      htmlFor="verified"
                      className="flex items-center gap-2 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <BadgeCheck className="h-4 w-4 text-green-600" />
                      Verified Only
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {data?.total ? `Found ${data.total} doctor${data.total !== 1 ? 's' : ''}` : 'Loading...'}
          </h5>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full mt-4" />
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.doctors && data.doctors.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.doctors.map((doctor: any) => (
                <Card key={doctor.id} className="group hover:shadow-xl transition-all hover:-translate-y-1 border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-20 w-20 border-4 border-blue-100">
                        <AvatarImage src={doctor.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {getInitials(doctor.firstName, doctor.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-lg">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h3>
                          {doctor.isVerified && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 shrink-0">
                              <BadgeCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          {doctor.specialization}
                        </Badge>
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(doctor.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">{doctor.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({doctor.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    {doctor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{doctor.bio}</p>
                    )}

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">{doctor.qualifications || 'MBBS, MD'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4 shrink-0" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4 shrink-0" />
                        <span className="font-semibold text-foreground">{formatCurrency(doctor.consultationFee)}</span>
                        <span>per consultation</span>
                      </div>
                      {doctor.availableDays && doctor.availableDays.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>Available: {doctor.availableDays.slice(0, 3).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/doctors/${doctor.id}`}>View Profile</Link>
                      </Button>
                      <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Link href={`/patient/appointments/book?doctor=${doctor.id}`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Book
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                <Stethoscope className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2">No Doctors Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try adjusting your search filters or check back later for new healthcare professionals.
            </p>
            <Button onClick={resetFilters} variant="outline" size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Search
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
