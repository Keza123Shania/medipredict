using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;
using MediPredict.Services.Interfaces;
using MediPredict.Services.Implementations;
using MediPredict.Data.DatabaseContext;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace MediPredict.Services.Implementations
{
    public class AIService : IAIService
    {
        private readonly IDatabaseService _databaseService;
        private readonly ApplicationDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AIService> _logger;

        public AIService(
            IDatabaseService databaseService,
            ApplicationDbContext context,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<AIService> logger)
        {
            _databaseService = databaseService;
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<List<Symptom>> GetAllSymptomsAsync()
        {
            var symptoms = await _databaseService.QueryAsync<Symptom>("spSymptom_GetAllForAI");
            return symptoms.ToList();
        }

        public async Task<List<Disease>> GetDiseasesBySymptomsAsync(List<Guid> symptomIds)
        {
            var symptomsJson = JsonSerializer.Serialize(symptomIds);
            var diseases = await _databaseService.QueryAsync<Disease>(
                "spDisease_GetBySymptoms",
                new { SymptomsList = symptomsJson }
            );
            return diseases.ToList();
        }

        public async Task<Guid> CreateSymptomEntryAsync(Guid patientId, SymptomEntryViewModel model)
        {
            var symptomsJson = JsonSerializer.Serialize(model.SelectedSymptomIds);

            var result = await _databaseService.QuerySingleAsync<Guid>(
                "spSymptomEntry_Create",
                new
                {
                    PatientId = patientId,
                    SymptomsJson = symptomsJson,
                    model.SeverityLevel,
                    model.Description
                }
            );

            return result;
        }

        public async Task<List<AIPrediction>> GetPredictionsForSymptomEntryAsync(Guid symptomEntryId)
        {
            var predictions = await _databaseService.QueryAsync<AIPrediction>(
                "spAIPrediction_GetBySymptomEntry",
                new { SymptomEntryId = symptomEntryId }
            );
            return predictions.ToList();
        }

        public async Task<List<SymptomEntry>> GetPatientSymptomHistoryAsync(Guid patientId, int page = 1, int pageSize = 10)
        {
            var entries = await _databaseService.QueryAsync<SymptomEntry>(
                "spSymptomEntry_GetByPatientId",
                new { PatientId = patientId, PageSize = pageSize, PageNumber = page }
            );
            return entries.ToList();
        }

        // AI Model Integration Placeholder
        //public async Task<List<AIPrediction>> GeneratePredictionsAsync(int symptomEntryId, List<int> symptomIds)
        //{
        //    // This is where you'll integrate your pre-trained AI model
        //    // For now, returning mock data
        //    var mockPredictions = new List<AIPrediction>
        //    {
        //        new AIPrediction
        //        {
        //            SymptomEntryId = symptomEntryId,
        //            DiseaseId = 1, // This would come from your AI model
        //            Probability = 85.5m,
        //            ConfidenceLevel = 92.0m,
        //            Recommendations = "Consult a doctor for proper diagnosis. Rest and hydrate.",
        //            CreatedAt = DateTime.UtcNow
        //        }
        //    };

        //    // Store predictions in database
        //    foreach (var prediction in mockPredictions)
        //    {
        //        await _databaseService.ExecuteAsync(
        //            "spAIPrediction_Create",
        //            new
        //            {
        //                prediction.SymptomEntryId,
        //                prediction.DiseaseId,
        //                prediction.Probability,
        //                prediction.ConfidenceLevel,
        //                prediction.Recommendations
        //            }
        //        );
        //    }

        //    return mockPredictions;
        //}

        public async Task<List<AIPrediction>> GeneratePredictionsAsync(Guid symptomEntryId, List<string> symptomNames)
        {
            try
            {
                if (!symptomNames.Any())
                {
                    _logger.LogWarning("No valid symptoms provided for prediction");
                    return new List<AIPrediction>();
                }

                // Call Python ML service
                var mlServiceUrl = _configuration["MLService:BaseUrl"] ?? "http://localhost:5001";
                var httpClient = _httpClientFactory.CreateClient();
                
                var request = new { symptoms = symptomNames };
                var response = await httpClient.PostAsJsonAsync($"{mlServiceUrl}/predict", request);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("ML service returned error: {StatusCode}", response.StatusCode);
                    return await FallbackPrediction(symptomEntryId, symptomNames);
                }

                var mlResponse = await response.Content.ReadFromJsonAsync<MLPredictionResponse>();
                
                if (mlResponse == null || !mlResponse.Success)
                {
                    _logger.LogError("ML service returned invalid response");
                    return await FallbackPrediction(symptomEntryId, symptomNames);
                }

                // Store predictions in database
                var predictions = new List<AIPrediction>();
                
                foreach (var prediction in mlResponse.TopPredictions.Take(5))
                {
                    // Find or create disease in database using EF Core
                    var disease = await _context.Diseases
                        .FirstOrDefaultAsync(d => d.Name == prediction.Disease);

                    if (disease == null)
                    {
                        // Create disease if it doesn't exist
                        disease = new Disease
                        {
                            Name = prediction.Disease,
                            Description = $"AI-predicted disease: {prediction.Disease}",
                            IsActive = true
                        };
                        _context.Diseases.Add(disease);
                        await _context.SaveChangesAsync();
                    }

                    if (disease != null)
                    {
                        var aiPrediction = new AIPrediction
                        {
                            SymptomEntryId = symptomEntryId,
                            DiseaseId = disease.Id,
                            Probability = (decimal)prediction.Probability,
                            ConfidenceLevel = (decimal)prediction.Probability,
                            Recommendations = $"Based on the symptoms provided, there is a {prediction.Probability:F2}% probability of {prediction.Disease}. Please consult a healthcare professional for proper diagnosis and treatment.",
                            CreatedAt = DateTime.UtcNow
                        };

                        // Store in database using EF Core
                        _context.AIPredictions.Add(aiPrediction);
                        await _context.SaveChangesAsync();

                        predictions.Add(aiPrediction);
                    }
                }

                _logger.LogInformation("Successfully generated {Count} predictions using ML model", predictions.Count);
                return predictions.OrderByDescending(p => p.Probability).ToList();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to connect to ML service");
                return await FallbackPrediction(symptomEntryId, symptomNames);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating predictions");
                return await FallbackPrediction(symptomEntryId, symptomNames);
            }
        }

        private async Task<List<AIPrediction>> FallbackPrediction(Guid symptomEntryId, List<string> symptomNames)
        {
            // Fallback to database-based prediction if ML service is unavailable
            _logger.LogWarning("Using fallback prediction method with {Count} symptoms", symptomNames.Count);
            
            // Create simple fallback predictions based on symptom count
            var predictions = new List<AIPrediction>();
            var fallbackDiseases = new[] { "Common Cold", "Flu", "Viral Infection" };

            for (int i = 0; i < fallbackDiseases.Length; i++)
            {
                var diseaseName = fallbackDiseases[i];
                var probability = Math.Min(95m, 30m + (symptomNames.Count * 5) - (i * 10));
                
                // Find or create disease using EF Core
                var disease = await _context.Diseases
                    .FirstOrDefaultAsync(d => d.Name == diseaseName);

                if (disease == null)
                {
                    disease = new Disease
                    {
                        Name = diseaseName,
                        Description = $"Fallback prediction: {diseaseName}",
                        IsActive = true
                    };
                    _context.Diseases.Add(disease);
                    await _context.SaveChangesAsync();
                }

                if (disease != null)
                {
                    var prediction = new AIPrediction
                    {
                        SymptomEntryId = symptomEntryId,
                        DiseaseId = disease.Id,
                        Probability = probability,
                        ConfidenceLevel = probability,
                        Recommendations = "ML service unavailable. Please consult a healthcare professional for proper diagnosis.",
                        CreatedAt = DateTime.UtcNow
                    };

                    // Store in database using EF Core
                    _context.AIPredictions.Add(prediction);
                    await _context.SaveChangesAsync();

                    predictions.Add(prediction);
                }
            }

            return predictions.OrderByDescending(p => p.Probability).ToList();
        }

        // Response model for ML service
        private class MLPredictionResponse
        {
            [System.Text.Json.Serialization.JsonPropertyName("success")]
            public bool Success { get; set; }
            
            [System.Text.Json.Serialization.JsonPropertyName("predicted_disease")]
            public string PredictedDisease { get; set; } = string.Empty;
            
            [System.Text.Json.Serialization.JsonPropertyName("confidence")]
            public double Confidence { get; set; }
            
            [System.Text.Json.Serialization.JsonPropertyName("top_predictions")]
            public List<MLPrediction> TopPredictions { get; set; } = new();
        }

        private class MLPrediction
        {
            [System.Text.Json.Serialization.JsonPropertyName("disease")]
            public string Disease { get; set; } = string.Empty;
            
            [System.Text.Json.Serialization.JsonPropertyName("probability")]
            public double Probability { get; set; }
        }
    }
}