"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useCreatePrediction } from "@/api/hooks/use-predictions"
import { comprehensiveSymptomCategories } from "@/lib/comprehensive-symptoms"
import { Search, X, CheckCircle, Loader2, Brain, AlertCircle, ChevronRight, ChevronLeft, Activity, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS_PER_PAGE = 3 // Show 3 categories per page for better navigation

export default function PredictPage() {
  const router = useRouter()
  const { toast } = useToast()
  const createPrediction = useCreatePrediction()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Selection progress
  const selectionPercent = Math.min((selectedSymptoms.length / 3) * 100, 100)

  // Toggle symptom selection
  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    )
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
      const result = await createPrediction.mutateAsync(selectedSymptoms)

      toast({
        title: "Analysis complete!",
        description: "Redirecting to your results...",
      })
      // The API returns ApiResponse with data.id (symptom entry GUID)
      const predictionId = result.data?.id
      if (predictionId) {
        router.push(`/patient/predictions/${predictionId}`)
      }
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

  // Get selected symptom names for display
  const selectedSymptomNames = useMemo(() => {
    return selectedSymptoms.map(symptomId => {
      for (const category of comprehensiveSymptomCategories) {
        const symptom = category.symptoms.find(s => s.id === symptomId)
        if (symptom) return symptom.name
      }
      return ""
    }).filter(Boolean)
  }, [selectedSymptoms])

  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">        <div>
          <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-emerald-600 pl-4 mb-2 flex items-center gap-3">
            <Brain className="h-6 w-6 text-emerald-600" />
            AI Health Prediction
          </h1>
          <p className="text-slate-600 text-sm pl-5">Select at least 3 symptoms for AI-powered health analysis</p>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Brain className="h-5 w-5 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AI Health Predictor</h1>
            </div>
            <p className="text-sm text-gray-600">Select at least 3 symptoms for AI-powered health analysis</p>
          </div>
          {selectedSymptoms.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSymptoms([])}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Medical Disclaimer - More Subtle */}
        <Alert className="bg-blue-50 border-blue-100">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-800">
            <strong>Note:</strong> This AI tool provides preliminary health insights only. Always consult a healthcare professional for medical advice.
          </AlertDescription>
        </Alert>
      </div>

      {/* Compact Progress & Action Bar */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedSymptoms.length >= 3 ? "Ready to analyze" : "Select 3+ symptoms"}
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  {selectedSymptoms.length}/3
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${selectionPercent}%` }}
                />
              </div>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={selectedSymptoms.length < 3 || isSubmitting}
              size="lg"
              className="min-w-[180px] bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Get Prediction
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar - More Compact */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search symptoms (e.g., fever, headache)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 h-11 text-sm border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selected Symptoms Preview - Only show if selected */}
      {selectedSymptoms.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Selected Symptoms:</span>
            <Badge variant="outline" className="text-xs">
              {selectedSymptoms.length} selected
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSymptomNames.slice(0, 8).map((name, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              >
                {name}
                <button
                  onClick={() => toggleSymptom(selectedSymptoms[index])}
                  className="ml-1.5 hover:text-emerald-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedSymptoms.length > 8 && (
              <Badge variant="outline" className="text-xs">
                +{selectedSymptoms.length - 8} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Symptom Categories - More Compact Grid */}
      {paginatedCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedCategories.map((category) => {
            const count = getCategoryCount(category.id)
            return (
              <Card key={category.id} className="border border-gray-200 hover:border-emerald-300 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <span className="text-lg">{category.symptoms[0]?.icon || "📊"}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-xs text-gray-500">
                          {count.selected}/{category.symptoms.length} selected
                        </p>
                      </div>
                    </div>
                    {count.selected > 0 && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                        {count.selected}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {category.symptoms.map((symptom) => {
                      const isSelected = selectedSymptoms.includes(symptom.id)
                      return (
                        <button
                          key={symptom.id}
                          type="button"
                          onClick={() => toggleSymptom(symptom.id)}
                          className={cn(
                            "relative p-2.5 rounded-lg border text-sm transition-all text-left",
                            "hover:shadow-sm flex items-center gap-2",
                            isSelected
                              ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                          )}
                        >
                          <span className="text-lg">{symptom.icon}</span>
                          <span className="truncate text-xs font-medium flex-1">{symptom.name}</span>
                          {isSelected && (
                            <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        // No Results State
        <Card className="border border-gray-200 bg-white">
          <CardContent className="py-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No symptoms found</h3>
            <p className="text-sm text-gray-600 mb-4">
              No symptoms matching "{searchTerm}"
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination - More Compact */}
      {filteredCategories.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>-
            <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredCategories.length)}</span> of{" "}
            <span className="font-medium">{filteredCategories.length}</span> categories
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 
                  ? i + 1 
                  : currentPage >= totalPages - 2 
                    ? totalPages - 4 + i 
                    : currentPage - 2 + i
                
                if (pageNum < 1 || pageNum > totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "h-8 w-8 text-sm",
                      currentPage === pageNum && "bg-emerald-600 hover:bg-emerald-700"
                    )}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-10">
        {selectedSymptoms.length > 0 && (
          <Button
            onClick={handleSubmit}
            disabled={selectedSymptoms.length < 3 || isSubmitting}
            size="lg"
            className="rounded-full h-12 w-12 p-0 shadow-lg bg-gradient-to-r from-emerald-600 to-emerald-700"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Brain className="h-5 w-5" />
                <span className="sr-only">Analyze</span>
              </>
            )}
          </Button>
        )}
      </div>
      </div>
    </DashboardLayout>
  )
}