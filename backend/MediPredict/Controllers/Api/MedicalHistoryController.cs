using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediPredict.Attributes;
using MediPredict.Data.DatabaseContext;
using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;
using MediPredict.Helpers;
using System.Text.Json;

namespace MediPredict.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalHistoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MedicalHistoryController> _logger;

        public MedicalHistoryController(ApplicationDbContext context, ILogger<MedicalHistoryController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("{userId}")]
        [RequirePermission("ViewConsultations")]
        public async Task<ActionResult<ApiResponse<MedicalHistoryViewModel>>> GetMedicalHistory(string userId)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var patient = await _context.Patients
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.UserId == userGuid);

                if (patient == null)
                {
                    return NotFound(new ApiResponse<MedicalHistoryViewModel>
                    {
                        Success = false,
                        Message = "Patient profile not found"
                    });
                }

                // Get all consultation records with full details
                var consultations = await _context.ConsultationRecords
                    .Include(c => c.Doctor)
                        .ThenInclude(d => d.User)
                    .Include(c => c.Appointment)
                    .Include(c => c.Prescriptions)
                    .Include(c => c.AIPrediction!)
                        .ThenInclude(ap => ap.Disease!)
                    .Where(c => c.PatientId == patient.Id)
                    .OrderByDescending(c => c.ConsultationDate)
                    .ToListAsync();

                var consultationViewModels = new List<ConsultationViewModel>();

                foreach (var c in consultations)
                {
                    AIPredictionViewModel? aiPrediction = null;
                    if (c.AIPrediction != null)
                    {
                        var symptomEntry = await _context.SymptomEntries
                            .Include(se => se.AIPredictions!)
                                .ThenInclude(ap => ap.Disease!)
                            .FirstOrDefaultAsync(se => se.AIPredictions.Any(ap => ap.Id == c.AIPredictionId));

                        if (symptomEntry != null)
                        {
                            string symptomsReported = "Symptoms reported";
                            if (symptomEntry.Symptoms != null && symptomEntry.Symptoms.Any())
                            {
                                symptomsReported = string.Join(", ", symptomEntry.Symptoms.Select(ses => ses.Symptom?.Name ?? "Unknown"));
                            }
                            else
                            {
                                symptomsReported = $"Symptoms from {symptomEntry.CreatedAt:MMM dd, yyyy}";
                            }

                            aiPrediction = new AIPredictionViewModel
                            {
                                Id = c.AIPrediction.Id,
                                PrimaryCondition = c.AIPrediction.Disease.Name,
                                ConfidenceScore = c.AIPrediction.Probability,
                                SymptomsReported = symptomsReported,
                                PredictionResults = symptomEntry.AIPredictions.Select(ap => new DiseaseProbability
                                {
                                    DiseaseName = ap.Disease.Name,
                                    Probability = ap.Probability
                                }).OrderByDescending(dp => dp.Probability).ToList(),
                                AIDisclaimer = "This AI prediction is for informational purposes only.",
                                CreatedAt = symptomEntry.CreatedAt
                            };
                        }
                    }

                    consultationViewModels.Add(new ConsultationViewModel
                    {
                        ConsultationRecordId = c.Id,
                        AppointmentId = c.AppointmentId,
                        PatientId = c.PatientId,
                        DoctorName = $"Dr. {c.Doctor.User.FirstName} {c.Doctor.User.LastName}",
                        DoctorSpecialization = c.Doctor.Specialization,
                        CompletedDate = c.ConsultationDate,
                        OfficialDiagnosis = c.OfficialDiagnosis,
                        AIDiagnosisConfirmed = c.AIDiagnosisConfirmed,
                        ConsultationNotes = c.ConsultationNotes ?? "",
                        TreatmentPlan = c.TreatmentPlan ?? "",
                        LabTestsOrdered = c.LabTestsOrdered ?? "",
                        AIPrediction = aiPrediction,
                        Prescriptions = c.Prescriptions.Select(p => new PrescriptionViewModel
                        {
                            Id = p.Id,
                            DrugName = p.DrugName,
                            Dosage = p.Dosage,
                            Frequency = p.Frequency,
                            Duration = p.Duration,
                            Instructions = p.Instructions ?? ""
                        }).ToList(),
                        IsCompleted = true
                    });
                }

                // Get all appointments
                var allAppointments = await _context.Appointments
                    .Include(a => a.Doctor)
                        .ThenInclude(d => d.User)
                    .Where(a => a.PatientId == patient.Id)
                    .OrderByDescending(a => a.AppointmentDate)
                    .Select(a => new AppointmentViewModel
                    {
                        Id = a.Id,
                        DoctorName = $"Dr. {a.Doctor.User.FirstName} {a.Doctor.User.LastName}",
                        DoctorSpecialization = a.Doctor.Specialization,
                        AppointmentDate = a.AppointmentDate,
                        Status = EnumHelper.FromAppointmentStatus(a.Status),
                        ReasonForVisit = a.ReasonForVisit ?? ""
                    })
                    .ToListAsync();

                // Get all predictions
                var allPredictions = await _context.SymptomEntries
                    .Include(se => se.AIPredictions)
                        .ThenInclude(ap => ap.Disease)
                    .Where(se => se.PatientId == patient.Id)
                    .OrderByDescending(se => se.CreatedAt)
                    .Select(se => new PredictionHistoryItemViewModel
                    {
                        PredictionId = se.Id,
                        Date = se.CreatedAt,
                        PrimarySymptoms = se.Description ?? "No description",
                        PredictedCondition = se.AIPredictions
                            .OrderByDescending(p => p.Probability)
                            .Select(p => p.Disease.Name)
                            .FirstOrDefault() ?? "Unknown",
                        ConfidenceScore = se.AIPredictions
                            .OrderByDescending(p => p.Probability)
                            .Select(p => p.Probability)
                            .FirstOrDefault(),
                        UrgencyLevel = GetUrgencyLevel(
                            se.AIPredictions.OrderByDescending(p => p.Probability).Select(p => p.Probability).FirstOrDefault(),
                            se.SeverityLevel)
                    })
                    .ToListAsync();

                var medicalHistory = new MedicalHistoryViewModel
                {
                    PatientId = patient.Id,
                    PatientName = $"{patient.User.FirstName} {patient.User.LastName}",
                    DateOfBirth = patient.User.DateOfBirth,
                    Gender = EnumHelper.FromGender(patient.User.Gender),
                    BloodType = patient.BloodGroup ?? "",
                    Allergies = patient.Allergies ?? "",
                    MedicalHistory = patient.MedicalHistory ?? "",
                    Consultations = consultationViewModels,
                    Appointments = allAppointments,
                    Predictions = allPredictions,
                    TotalConsultations = consultationViewModels.Count,
                    TotalAppointments = allAppointments.Count,
                    TotalPredictions = allPredictions.Count
                };

                return Ok(new ApiResponse<MedicalHistoryViewModel>
                {
                    Success = true,
                    Message = "Medical history retrieved successfully",
                    Data = medicalHistory
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving medical history for user {UserId}", userId);
                return StatusCode(500, new ApiResponse<MedicalHistoryViewModel>
                {
                    Success = false,
                    Message = "An error occurred while retrieving medical history"
                });
            }
        }

        [HttpGet("consultation/{consultationId}")]
        [RequirePermission("ViewConsultations")]
        public async Task<ActionResult<ApiResponse<ConsultationViewModel>>> GetConsultationDetail(Guid consultationId, [FromQuery] string userId)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var patient = await _context.Patients
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.UserId == userGuid);

                if (patient == null)
                {
                    return NotFound(new ApiResponse<ConsultationViewModel>
                    {
                        Success = false,
                        Message = "Patient profile not found"
                    });
                }

                var consultationRecord = await _context.ConsultationRecords
                    .Include(c => c.Doctor)
                        .ThenInclude(d => d.User)
                    .Include(c => c.Appointment)
                    .Include(c => c.Prescriptions)
                    .Include(c => c.AIPrediction)
                        .ThenInclude(ap => ap.Disease)
                    .FirstOrDefaultAsync(c => c.Id == consultationId && c.PatientId == patient.Id);

                if (consultationRecord == null)
                {
                    return NotFound(new ApiResponse<ConsultationViewModel>
                    {
                        Success = false,
                        Message = "Consultation record not found"
                    });
                }

                AIPredictionViewModel? aiPrediction = null;
                if (consultationRecord.AIPrediction != null)
                {
                    var symptomEntry = await _context.SymptomEntries
                        .Include(se => se.AIPredictions)
                            .ThenInclude(ap => ap.Disease)
                        .FirstOrDefaultAsync(se => se.AIPredictions.Any(ap => ap.Id == consultationRecord.AIPredictionId));

                    if (symptomEntry != null)
                    {
                        string symptomsReported = "Symptoms reported";
                        if (symptomEntry.Symptoms != null && symptomEntry.Symptoms.Any())
                        {
                            symptomsReported = string.Join(", ", symptomEntry.Symptoms.Select(ses => ses.Symptom?.Name ?? "Unknown"));
                        }
                        else
                        {
                            symptomsReported = $"Symptoms from {symptomEntry.CreatedAt:MMM dd, yyyy}";
                        }

                        aiPrediction = new AIPredictionViewModel
                        {
                            Id = consultationRecord.AIPrediction.Id,
                            PrimaryCondition = consultationRecord.AIPrediction.Disease.Name,
                            ConfidenceScore = consultationRecord.AIPrediction.Probability,
                            SymptomsReported = symptomsReported,
                            PredictionResults = symptomEntry.AIPredictions.Select(ap => new DiseaseProbability
                            {
                                DiseaseName = ap.Disease.Name,
                                Probability = ap.Probability
                            }).OrderByDescending(dp => dp.Probability).ToList(),
                            AIDisclaimer = "This AI prediction is for informational purposes only.",
                            CreatedAt = symptomEntry.CreatedAt
                        };
                    }
                }

                var consultation = new ConsultationViewModel
                {
                    ConsultationRecordId = consultationRecord.Id,
                    AppointmentId = consultationRecord.AppointmentId,
                    PatientId = consultationRecord.PatientId,
                    PatientName = $"{patient.User.FirstName} {patient.User.LastName}",
                    DoctorName = $"Dr. {consultationRecord.Doctor.User.FirstName} {consultationRecord.Doctor.User.LastName}",
                    DoctorSpecialization = consultationRecord.Doctor.Specialization,
                    CompletedDate = consultationRecord.ConsultationDate,
                    OfficialDiagnosis = consultationRecord.OfficialDiagnosis,
                    AIDiagnosisConfirmed = consultationRecord.AIDiagnosisConfirmed,
                    ConsultationNotes = consultationRecord.ConsultationNotes ?? "",
                    TreatmentPlan = consultationRecord.TreatmentPlan ?? "",
                    LabTestsOrdered = consultationRecord.LabTestsOrdered ?? "",
                    AIPrediction = aiPrediction,
                    Prescriptions = consultationRecord.Prescriptions.Select(p => new PrescriptionViewModel
                    {
                        Id = p.Id,
                        DrugName = p.DrugName,
                        Dosage = p.Dosage,
                        Frequency = p.Frequency,
                        Duration = p.Duration,
                        Instructions = p.Instructions ?? ""
                    }).ToList(),
                    IsCompleted = true
                };

                return Ok(new ApiResponse<ConsultationViewModel>
                {
                    Success = true,
                    Message = "Consultation detail retrieved successfully",
                    Data = consultation
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving consultation detail {ConsultationId}", consultationId);
                return StatusCode(500, new ApiResponse<ConsultationViewModel>
                {
                    Success = false,
                    Message = "An error occurred while retrieving consultation detail"
                });
            }
        }

        private string GetUrgencyLevel(decimal probability, int severityLevel)
        {
            if (severityLevel >= 5 || probability >= 80)
                return "High";
            else if (severityLevel >= 3 || probability >= 50)
                return "Medium";
            else
                return "Low";
        }
    }
}
