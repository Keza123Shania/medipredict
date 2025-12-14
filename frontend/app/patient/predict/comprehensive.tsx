"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useCreatePrediction } from "@/api/hooks/use-predictions"
import { comprehensiveSymptomCategories } from "@/lib/comprehensive-symptoms"
import { Search, X, CheckCircle, Loader2, Brain, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ComprehensivePredictPage() {
  const router = useRouter()
  const { toast } = useToast()
  const createPrediction = useCreatePrediction()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter symptoms based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return comprehensiveSymptomCategories

    const lowerSearch = searchTerm.toLowerCase()
    return comprehensiveSymptomCategories
      .map((category) => ({
        ...category,
        symptoms: category.symptoms.filter((symptom) =>
          symptom.name.toLowerCase().includes(lowerSearch)
        ),
      }))
      .filter((category) => category.symptoms.length > 0)
  }, [searchTerm])

  // Toggle symptom selection
  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    )
  }

  // Clear all selections
  const clearAllSymptoms = () => {
    setSelectedSymptoms([])
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedSymptoms.length < 3) {
      toast({
        title: "Not enough symptoms",
        description: "Please select at least 3 symptoms for accurate prediction.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createPrediction.mutateAsync({
        symptoms: selectedSymptoms,
        age: 30, // You may want to collect this in a previous step
        gender: "other", // You may want to collect this in a previous step
        medicalHistory: [],
        lifestyle: {
          smoking: false,
          alcohol: false,
          exercise: "moderate",
        },
        additionalNotes: "",
      })

      toast({
        title: "Analysis complete!",
        description: "Redirecting to your results...",
      })
      router.push(`/patient/predictions/${result.id}`)
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get selected count for each category
  const getCategoryCount = (categoryId: string) => {
    const category = comprehensiveSymptomCategories.find((c) => c.id === categoryId)
    if (!category) return { selected: 0, total: 0 }

    const selected = category.symptoms.filter((s) => selectedSymptoms.includes(s.id)).length
    return { selected, total: category.symptoms.length }
  }

  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            AI Disease Prediction
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your symptoms and get instant AI-powered disease predictions
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select Your Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Search Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search symptoms... (e.g., fever, headache, cough)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-12 text-base"
                />
                {searchTerm && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Type to quickly find and select symptoms from 132 available options
              </p>
            </div>

            {/* Selected Count Badge */}
            <Alert className={cn(
              "border-2",
              selectedSymptoms.length >= 3 ? "border-green-500 bg-green-50" : "border-blue-500 bg-blue-50"
            )}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">
                    {selectedSymptoms.length}
                  </span>
                  <span className="text-foreground">symptoms selected</span>
                  <span className="text-muted-foreground">
                    (Select at least 3 for accurate prediction)
                  </span>
                </div>
                {selectedSymptoms.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllSymptoms}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </Alert>

            {/* Symptom Categories */}
            <div className="space-y-6">
              {filteredCategories.map((category) => {
                const count = getCategoryCount(category.id)
                return (
                  <div
                    key={category.id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center text-xl bg-gradient-to-br",
                          category.color
                        )}>
                          <span className="text-white">{category.symptoms[0]?.icon || "📊"}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
                      </div>
                      <Badge variant={count.selected > 0 ? "default" : "secondary"} className="px-3 py-1">
                        {count.selected}/{count.total}
                      </Badge>
                    </div>

                    {/* Symptoms Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {category.symptoms.map((symptom) => {
                        const isSelected = selectedSymptoms.includes(symptom.id)
                        return (
                          <button
                            key={symptom.id}
                            type="button"
                            onClick={() => toggleSymptom(symptom.id)}
                            className={cn(
                              "relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer",
                              "hover:border-blue-400 hover:shadow-md hover:-translate-y-1",
                              isSelected
                                ? "bg-blue-50 border-blue-500 shadow-lg"
                                : "bg-white border-gray-300"
                            )}
                          >
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div className="text-2xl mb-2">{symptom.icon}</div>
                            <span className="text-sm font-medium text-center text-gray-700 leading-tight">
                              {symptom.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* No Results */}
            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No symptoms found matching "{searchTerm}"
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSearch}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={selectedSymptoms.length < 3 || isSubmitting}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Get AI Prediction ({selectedSymptoms.length} symptoms)
                  </>
                )}
              </Button>
              {selectedSymptoms.length > 0 && selectedSymptoms.length < 3 && (
                <p className="text-sm text-destructive text-center mt-2">
                  Select at least {3 - selectedSymptoms.length} more symptom(s) to continue
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
