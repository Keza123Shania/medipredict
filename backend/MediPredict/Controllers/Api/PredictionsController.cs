using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediPredict.Data.DatabaseContext;
using MediPredict.Services.Interfaces;
using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;
using MediPredict.Helpers;
using System.Text.Json;
using System.Text; // Added for Encoding
using System.Net.Http; // Added for HttpClient
using MediPredict.Attributes;

namespace MediPredict.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class PredictionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAIService _aiService; // Kept to avoid breaking constructor, but we won't use it for generation
        private readonly ILogger<PredictionsController> _logger;

        public PredictionsController(ApplicationDbContext context, IAIService aiService, ILogger<PredictionsController> logger)
        {
            _context = context;
            _aiService = aiService;
            _logger = logger;
        }

        [HttpPost]
        [RequirePermission("CreatePrediction")]
        public async Task<ActionResult<ApiResponse<object>>> CreatePrediction([FromBody] PredictionRequest request)
        {
            try
            {
                _logger.LogInformation("CreatePrediction called - UserId: {UserId}, Symptoms count: {Count}", 
                    request?.UserId ?? "NULL", request?.Symptoms?.Count ?? 0);
                
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                
                if (request == null || string.IsNullOrEmpty(request.UserId))
                {
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Invalid request or User ID" });
                }

                var userGuid = Guid.Parse(request.UserId);
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userGuid);
                if (patient == null)
                {
                    return NotFound(new ApiResponse<object> { Success = false, Message = "Patient profile not found" });
                }

                if (request.Symptoms == null || request.Symptoms.Count < 3)
                {
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Please select at least 3 symptoms" });
                }

                // 1. Save Symptom Entry First
                var symptomEntry = new SymptomEntry
                {
                    PatientId = patient.Id,
                    SeverityLevel = CalculateSeverityLevel(request.Symptoms.Count),
                    Description = string.Join(", ", request.Symptoms),
                    CreatedAt = DateTime.UtcNow,
                    Symptoms = new List<SymptomEntrySymptom>()
                };

                _context.SymptomEntries.Add(symptomEntry);
                await _context.SaveChangesAsync();

                // ---------------------------------------------------------
                // NEW CODE: Call Python Microservice directly (Bypass _aiService)
                // ---------------------------------------------------------
                bool predictionSuccess = false;

                using (var client = new HttpClient())
                {
                    try 
                    {
                        var aiPayload = new { symptoms = request.Symptoms };
                        var jsonContent = new StringContent(JsonSerializer.Serialize(aiPayload), Encoding.UTF8, "application/json");

                        // Call localhost:5001 (Since Python is running in the same Railway service)
                        var response = await client.PostAsync("medipredict-ai-production-0b620.up.railway.app", jsonContent);
                        
                        if (response.IsSuccessStatusCode)
                        {
                            var jsonString = await response.Content.ReadAsStringAsync();
                            using (JsonDocument doc = JsonDocument.Parse(jsonString))
                            {
                                var root = doc.RootElement;
                                var predictedDiseaseName = root.GetProperty("predicted_disease").GetString();
                                var confidence = root.GetProperty("confidence").GetDouble();

                                // 2. Find or Create the Disease in SQL
                                var disease = await _context.Diseases.FirstOrDefaultAsync(d => d.Name == predictedDiseaseName);
                                if (disease == null)
                                {
                                    // If the AI predicts a disease not in our DB, create a placeholder so it saves
                                    disease = new Disease 
                                    { 
                                        Name = predictedDiseaseName, 
                                        Description = "AI Identified Condition",
                                        CreatedAt = DateTime.UtcNow,
                                        IsActive = true
                                    };
                                    _context.Diseases.Add(disease);
                                    await _context.SaveChangesAsync();
                                }

                                // 3. Save the AIPrediction record
                                var aiPrediction = new AIPrediction
                                {
                                    SymptomEntryId = symptomEntry.Id,
                                    DiseaseId = disease.Id,
                                    Probability = (decimal)confidence, // Cast to match your DB type
                                    ConfidenceLevel = (decimal)confidence,
                                    CreatedAt = DateTime.UtcNow,
                                    Recommendations = "Consult a doctor for verification."
                                };

                                _context.AIPredictions.Add(aiPrediction);
                                await _context.SaveChangesAsync();
                                predictionSuccess = true;
                            }
                        }
                        else
                        {
                            _logger.LogError($"Python AI Service Error: {response.StatusCode}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to communicate with Python AI Service");
                        // We do not throw here, so we can still return the symptom entry created successfully
                    }
                }
                // ---------------------------------------------------------
                // END NEW CODE
                // ---------------------------------------------------------

                if (!predictionSuccess)
                {
                     return StatusCode(200, new ApiResponse<object> 
                     { 
                         Success = true, 
                         Message = "Symptoms recorded, but AI prediction is currently unavailable.",
                         Data = new { id = symptomEntry.Id } // Return minimal data
                     });
                }

                // Get the formatted result using your existing helper
                var result = await GetPredictionResult(symptomEntry.Id);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Prediction generated successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating prediction");
                return StatusCode(500, new ApiResponse<object> { Success = false, Message = "An error occurred" });
            }
        }

        [HttpGet("{entryId}")]
        public async Task<ActionResult<ApiResponse<object>>> GetPrediction(Guid entryId)
        {
            try
            {
                var result = await GetPredictionResult(entryId);

                if (result == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Prediction not found"
                    });
                }

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Prediction retrieved successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving prediction {EntryId}", entryId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving prediction"
                });
            }
        }

        [HttpGet("history/{userId}")]
        public async Task<ActionResult<ApiResponse<object>>> GetPredictionHistory(string userId)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userGuid);
                if (patient == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Patient profile not found"
                    });
                }

                var predictions = await _context.SymptomEntries
                    .Include(s => s.AIPredictions)
                        .ThenInclude(ap => ap.Disease)
                    .Where(s => s.PatientId == patient.Id)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();

                var history = predictions.Select(p =>
                {
                    var topPrediction = p.AIPredictions.OrderByDescending(ap => ap.Probability).FirstOrDefault();
                    return new
                    {
                        id = p.Id,
                        date = p.CreatedAt,
                        primaryDisease = topPrediction?.Disease?.Name ?? "Unknown",
                        confidence = (double)(topPrediction?.Probability ?? 0),
                        symptomsCount = p.Symptoms?.Count ?? 0,
                        severityLevel = p.SeverityLevel
                    };
                }).ToList();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Prediction history retrieved successfully",
                    Data = history
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving prediction history for user {UserId}", userId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving prediction history"
                });
            }
        }

        private async Task<object?> GetPredictionResult(Guid entryId)
        {
            var symptomEntry = await _context.SymptomEntries
                .Include(s => s.AIPredictions)
                    .ThenInclude(ap => ap.Disease)
                .FirstOrDefaultAsync(s => s.Id == entryId);

            if (symptomEntry == null)
                return null;

            var predictions = symptomEntry.AIPredictions.OrderByDescending(ap => ap.Probability).ToList();
            var topPrediction = predictions.FirstOrDefault();

            if (topPrediction == null)
                return null;

            var urgencyLevel = CalculateUrgencyLevel((double)topPrediction.Probability, symptomEntry.SeverityLevel);
            var suggestedSpecializations = GetSuggestedSpecializations(topPrediction.Disease.Name, urgencyLevel);

            return new
            {
                id = symptomEntry.Id,
                predictionId = Guid.NewGuid().ToString(),
                timestamp = symptomEntry.CreatedAt,
                primaryDisease = topPrediction.Disease.Name,
                confidence = (double)topPrediction.Probability,
                symptomsCount = symptomEntry.Symptoms?.Count ?? 0,
                urgencyLevel,
                suggestedSpecializations,
                allProbabilities = predictions.Select(ap => new
                {
                    diseaseName = ap.Disease.Name,
                    probability = (double)ap.Probability,
                    description = ap.Disease.Description
                }).ToList(),
                recommendations = new List<string>
                {
                    urgencyLevel == "High" || urgencyLevel == "Critical" 
                        ? "Seek immediate medical attention" 
                        : "Consult with a healthcare professional",
                    "Book an appointment with a specialist",
                    "Monitor symptoms and keep a health diary",
                    "Follow general health and wellness guidelines"
                },
                disclaimer = "This AI prediction is for informational purposes only and should not replace professional medical advice."
            };
        }

        private int CalculateSeverityLevel(int symptomCount)
        {
            if (symptomCount >= 15) return 5; // Critical
            if (symptomCount >= 10) return 4; // High
            if (symptomCount >= 6) return 3; // Medium
            if (symptomCount >= 3) return 2; // Low-Medium
            return 1; // Low
        }

        private string CalculateUrgencyLevel(double confidence, int severityLevel)
        {
            if (confidence >= 80 && severityLevel >= 4) return "Critical";
            if (confidence >= 70 && severityLevel >= 3) return "High";
            if (confidence >= 60 || severityLevel >= 2) return "Medium";
            return "Low";
        }

        private List<string> GetSuggestedSpecializations(string primaryDisease, string urgencyLevel)
        {
            var specializations = new List<string>();
            var diseaseLower = primaryDisease.ToLower();

            // Map diseases to specializations based on disease name keywords
            if (diseaseLower.Contains("heart") || diseaseLower.Contains("cardiac") || diseaseLower.Contains("hypertension"))
                specializations.Add("Cardiology");
            else if (diseaseLower.Contains("diabetes") || diseaseLower.Contains("thyroid") || diseaseLower.Contains("hyperthyroidism") || diseaseLower.Contains("hypothyroidism"))
                specializations.Add("Endocrinology");
            else if (diseaseLower.Contains("asthma") || diseaseLower.Contains("bronchial") || diseaseLower.Contains("pneumonia") || diseaseLower.Contains("tuberculosis"))
                specializations.Add("Pulmonology");
            else if (diseaseLower.Contains("stomach") || diseaseLower.Contains("gastro") || diseaseLower.Contains("ulcer") || diseaseLower.Contains("hepatitis") || diseaseLower.Contains("jaundice"))
                specializations.Add("Gastroenterology");
            else if (diseaseLower.Contains("kidney") || diseaseLower.Contains("urinary"))
                specializations.Add("Nephrology");
            else if (diseaseLower.Contains("arthritis") || diseaseLower.Contains("cervical") || diseaseLower.Contains("spondylosis"))
                specializations.Add("Rheumatology");
            else if (diseaseLower.Contains("skin") || diseaseLower.Contains("fungal") || diseaseLower.Contains("acne") || diseaseLower.Contains("psoriasis"))
                specializations.Add("Dermatology");
            else if (diseaseLower.Contains("migraine") || diseaseLower.Contains("paralysis") || diseaseLower.Contains("vertigo"))
                specializations.Add("Neurology");
            else if (diseaseLower.Contains("allergy") || diseaseLower.Contains("cold") || diseaseLower.Contains("flu") || diseaseLower.Contains("fever") || diseaseLower.Contains("infection"))
                specializations.Add("General Practice");
            else if (diseaseLower.Contains("malaria") || diseaseLower.Contains("dengue") || diseaseLower.Contains("typhoid") || diseaseLower.Contains("aids"))
                specializations.Add("Infectious Disease");
            else if (diseaseLower.Contains("varicose"))
                specializations.Add("Cardiology");
            else if (diseaseLower.Contains("hypoglycemia"))
                specializations.Add("Endocrinology");
            
            // Add General Practice as fallback or for common conditions
            if (!specializations.Any())
                specializations.Add("General Practice");
            
            // Add urgent care for high/critical urgency
            if (urgencyLevel == "High" || urgencyLevel == "Critical")
            {
                if (!specializations.Contains("General Practice"))
                    specializations.Add("General Practice");
            }

            return specializations.Distinct().ToList();
        }

        private int GetSymptomsCount(string symptomsJson)
        {
            try
            {
                var symptoms = JsonSerializer.Deserialize<List<string>>(symptomsJson);
                return symptoms?.Count ?? 0;
            }
            catch
            {
                return 0;
            }
        }
    }

    public class PredictionRequest
    {
        public string UserId { get; set; } = string.Empty;
        public List<string> Symptoms { get; set; } = new();
        public string? AdditionalNotes { get; set; }
    }
}
