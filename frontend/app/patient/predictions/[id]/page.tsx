"use client"
import { use } from "react"
import Link from "next/link"
import { usePrediction } from "@/api/hooks/use-predictions"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle, Info, Stethoscope, Download, Share2 } from "lucide-react"
import { formatDate, formatProbability } from "@/lib/formatters"
import { cn } from "@/lib/utils"

const urgencyConfig = {
  low: { color: "text-success", bg: "bg-success/10", icon: CheckCircle, label: "Low Urgency" },
  medium: { color: "text-warning", bg: "bg-warning/10", icon: Info, label: "Medium Urgency" },
  high: { color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle, label: "High Urgency" },
  critical: { color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle, label: "Critical Urgency" },
}

export default function PredictionResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: response, isLoading } = usePrediction(id)
  const prediction = response?.data

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={["patient"]}>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!prediction) {
    return (
      <DashboardLayout allowedRoles={["patient"]}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Prediction not found</h1>
          <Button asChild>
            <Link href="/patient/predict">New Prediction</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  // Normalize urgency level to lowercase for urgencyConfig lookup
  const urgencyKey = (prediction.urgencyLevel || 'low').toLowerCase() as keyof typeof urgencyConfig
  const urgency = urgencyConfig[urgencyKey] || urgencyConfig.low
  const UrgencyIcon = urgency.icon

  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Button variant="ghost" asChild className="mb-2 -ml-3">
              <Link href="/patient/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Prediction Results</h1>
            <p className="text-muted-foreground">Analysis from {formatDate(prediction.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Urgency Alert */}
        <Alert className={cn("mb-6", urgency.bg)}>
          <UrgencyIcon className={cn("h-5 w-5", urgency.color)} />
          <AlertTitle className={urgency.color}>{urgency.label}</AlertTitle>
          <AlertDescription>
            {urgencyKey === "critical" || urgencyKey === "high"
              ? "Based on your symptoms, we recommend seeking medical attention promptly."
              : "Your symptoms suggest a non-urgent condition, but monitoring is advised."}
          </AlertDescription>
        </Alert>

        {/* Possible Diseases */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Possible Conditions</h2>
          {prediction.allProbabilities && prediction.allProbabilities.length > 0 ? (
            prediction.allProbabilities.map((condition, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{condition.diseaseName}</CardTitle>
                      {condition.description && (
                        <CardDescription className="mt-1">{condition.description}</CardDescription>
                      )}
                    </div>
                    {index === 0 && (
                      <Badge variant="outline" className={cn(urgency.color, "border-current ml-2")}>
                        Primary
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Probability</span>
                    <span className="font-medium">{formatProbability(condition.probability / 100)}</span>
                  </div>
                  <Progress value={condition.probability} className="h-2" />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No condition predictions available
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {prediction.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Suggested Doctors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Recommended Action
            </CardTitle>
            <CardDescription>Based on your results, we recommend consulting with a healthcare professional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {prediction.suggestedSpecializations && prediction.suggestedSpecializations.length > 0 ? (
                prediction.suggestedSpecializations.map((spec, index) => (
                  <Badge 
                    key={index}
                    variant={spec === "Urgent Care" ? "destructive" : "secondary"} 
                    className="text-sm py-1.5 px-3"
                  >
                    {spec}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="text-sm py-1.5 px-3">
                  General Practice
                </Badge>
              )}
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/patient/doctors?symptomEntryId=${id}`}>
                <Calendar className="mr-2 h-4 w-4" />
                Find & Book a Doctor
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Your AI prediction will be shared with the doctor to help with diagnosis
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
