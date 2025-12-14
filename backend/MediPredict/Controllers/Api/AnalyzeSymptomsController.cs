using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediPredict.Services.Interfaces;
using MediPredict.Data.ViewModels;
using MediPredict.Data.DatabaseContext;
using MediPredict.Attributes;

namespace MediPredict.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyzeSymptomsController : ControllerBase
    {
        private readonly IAIService _aiService;
        private readonly IUserService _userService;
        private readonly ApplicationDbContext _context;

        public AnalyzeSymptomsController(IAIService aiService, IUserService userService, ApplicationDbContext context)
        {
            _aiService = aiService;
            _userService = userService;
            _context = context;
        }

        [HttpPost]
        [RequirePermission("CreateSymptomEntry")]
        public async Task<ActionResult> AnalyzeSymptoms([FromBody] SymptomEntryViewModel model)
        {
            try
            {
                // Get patient from authenticated user
                var userId = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                var userGuid = Guid.Parse(userId);
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userGuid);
                if (patient == null)
                {
                    return NotFound(new { success = false, message = "Patient profile not found" });
                }

                // Create symptom entry
                var symptomEntryId = await _aiService.CreateSymptomEntryAsync(patient.Id, model);

                // Get symptoms from database to convert IDs to names
                var allSymptoms = await _aiService.GetAllSymptomsAsync();
                var symptomDict = allSymptoms.ToDictionary(s => s.Id, s => s.Name);
                
                // Convert symptom IDs to names for ML service
                var symptomNames = model.SelectedSymptomIds
                    .Where(id => symptomDict.ContainsKey(id))
                    .Select(id => symptomDict[id])
                    .ToList();

                // Get AI predictions
                var diseases = await _aiService.GetDiseasesBySymptomsAsync(model.SelectedSymptomIds);

                // Generate predictions using symptom names - symptomEntryId is Guid
                var predictions = await _aiService.GeneratePredictionsAsync(symptomEntryId, symptomNames);

                // Format response
                var result = predictions.Select(p => new
                {
                    DiseaseId = p.DiseaseId,
                    DiseaseName = diseases.FirstOrDefault(d => d.Id == p.DiseaseId)?.Name ?? "Unknown Disease",
                    DiseaseDescription = diseases.FirstOrDefault(d => d.Id == p.DiseaseId)?.Description,
                    Probability = p.Probability,
                    ConfidenceLevel = p.ConfidenceLevel,
                    Recommendations = p.Recommendations
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error analyzing symptoms: {ex.Message}");
            }
        }
    }
}