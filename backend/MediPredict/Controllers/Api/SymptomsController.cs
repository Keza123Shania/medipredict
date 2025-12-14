using Microsoft.AspNetCore.Mvc;
using MediPredict.Services.Interfaces;
using MediPredict.Data.Models;
using MediPredict.Attributes;

namespace MediPredict.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class SymptomsController : ControllerBase
    {
        private readonly IAIService _aiService;

        public SymptomsController(IAIService aiService)
        {
            _aiService = aiService;
        }

        [HttpGet]
        [RequirePermission("ViewSymptoms")]
        public async Task<ActionResult<List<Symptom>>> GetSymptoms()
        {
            try
            {
                var symptoms = await _aiService.GetAllSymptomsAsync();
                return Ok(symptoms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving symptoms: {ex.Message}");
            }
        }
    }
}