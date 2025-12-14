using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediPredict.Attributes;
using MediPredict.Data.DatabaseContext;
using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;
using MediPredict.Data.Enums;
using MediPredict.Helpers;
using System.Text.Json;

namespace MediPredict.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsultationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ConsultationsController> _logger;

        public ConsultationsController(ApplicationDbContext context, ILogger<ConsultationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("appointment/{appointmentId}")]
        [RequirePermission("ViewConsultations")]
        public async Task<ActionResult<ApiResponse<ConsultationViewModel>>> GetConsultationByAppointment(Guid appointmentId, [FromQuery] string userId)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userGuid);
                if (doctor == null)
                {
                    return NotFound(new ApiResponse<ConsultationViewModel>
                    {
                        Success = false,
                        Message = "Doctor profile not found"
                    });
                }

                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                        .ThenInclude(p => p.User)
                    .Include(a => a.SymptomEntry!)
                        .ThenInclude(se => se.AIPredictions!)
                            .ThenInclude(ap => ap.Disease!)
                    .FirstOrDefaultAsync(a => a.Id == appointmentId && a.DoctorId == doctor.Id);

                if (appointment == null)
                {
                    return NotFound(new ApiResponse<ConsultationViewModel>
                    {
                        Success = false,
                        Message = "Appointment not found or access denied"
                    });
                }

                var existingConsultation = await _context.ConsultationRecords
                    .Include(c => c.Prescriptions)
                    .Include(c => c.AIPrediction!)
                        .ThenInclude(ap => ap.Disease!)
                    .FirstOrDefaultAsync(c => c.AppointmentId == appointmentId);

                AIPredictionViewModel? aiPrediction = null;
                if (appointment.SymptomEntry != null && appointment.SymptomEntry.AIPredictions.Any())
                {
                    var primaryPrediction = appointment.SymptomEntry.AIPredictions.OrderByDescending(ap => ap.Probability).First();
                    aiPrediction = new AIPredictionViewModel
                    {
                        Id = primaryPrediction.Id,
                        PrimaryCondition = primaryPrediction.Disease.Name,
                        ConfidenceScore = primaryPrediction.Probability,
                        SymptomsReported = appointment.SymptomEntry.Description ?? "Symptoms reported",
                        PredictionResults = appointment.SymptomEntry.AIPredictions.Select(ap => new DiseaseProbability
                        {
                            DiseaseName = ap.Disease.Name,
                            Probability = ap.Probability
                        }).OrderByDescending(dp => dp.Probability).ToList(),
                        CreatedAt = appointment.SymptomEntry.CreatedAt
                    };
                }

                var consultation = new ConsultationViewModel
                {
                    AppointmentId = appointment.Id,
                    AppointmentDate = appointment.AppointmentDate,
                    PatientName = $"{appointment.Patient.User.FirstName} {appointment.Patient.User.LastName}",
                    ReasonForVisit = appointment.ReasonForVisit ?? "",
                    AppointmentNotes = appointment.Notes ?? "",
                    PatientId = appointment.PatientId,
                    PatientGender = EnumHelper.FromGender(appointment.Patient.User.Gender),
                    PatientDateOfBirth = appointment.Patient.User.DateOfBirth,
                    PatientPhone = appointment.Patient.User.PhoneNumber ?? "",
                    PatientEmail = appointment.Patient.User.Email ?? "",
                    PatientMedicalHistory = appointment.Patient.MedicalHistory ?? "",
                    PatientAllergies = appointment.Patient.Allergies ?? "",
                    AIPrediction = aiPrediction,
                    IsCompleted = appointment.Status == AppointmentStatus.Completed,
                    CompletedDate = existingConsultation?.ConsultationDate
                };

                if (existingConsultation != null)
                {
                    consultation.ConsultationRecordId = existingConsultation.Id;
                    consultation.OfficialDiagnosis = existingConsultation.OfficialDiagnosis;
                    consultation.AIDiagnosisConfirmed = existingConsultation.AIDiagnosisConfirmed;
                    consultation.ConsultationNotes = existingConsultation.ConsultationNotes ?? "";
                    consultation.TreatmentPlan = existingConsultation.TreatmentPlan ?? "";
                    consultation.LabTestsOrdered = existingConsultation.LabTestsOrdered ?? "";
                    consultation.Prescriptions = existingConsultation.Prescriptions.Select(p => new PrescriptionViewModel
                    {
                        Id = p.Id,
                        DrugName = p.DrugName,
                        Dosage = p.Dosage,
                        Frequency = p.Frequency,
                        Duration = p.Duration,
                        Instructions = p.Instructions ?? ""
                    }).ToList();
                }

                return Ok(new ApiResponse<ConsultationViewModel>
                {
                    Success = true,
                    Message = "Consultation data retrieved successfully",
                    Data = consultation
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving consultation for appointment {AppointmentId}", appointmentId);
                return StatusCode(500, new ApiResponse<ConsultationViewModel>
                {
                    Success = false,
                    Message = "An error occurred while retrieving consultation data"
                });
            }
        }

        [HttpPost]
        [RequirePermission("CreateConsultation")]
        public async Task<ActionResult<ApiResponse<object>>> SaveConsultation([FromBody] ConsultationViewModel model)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(model.AppointmentId);
                if (appointment == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                ConsultationRecord? consultationRecord;

                if (model.ConsultationRecordId.HasValue)
                {
                    // Update existing consultation
                    consultationRecord = await _context.ConsultationRecords
                        .Include(c => c.Prescriptions)
                        .FirstOrDefaultAsync(c => c.Id == Guid.Parse(model.ConsultationRecordId.Value.ToString()));

                    if (consultationRecord == null)
                    {
                        return NotFound(new ApiResponse<object>
                        {
                            Success = false,
                            Message = "Consultation record not found"
                        });
                    }

                    // Remove old prescriptions
                    _context.Prescriptions.RemoveRange(consultationRecord.Prescriptions);
                }
                else
                {
                    // Create new consultation
                    consultationRecord = new ConsultationRecord
                    {
                        AppointmentId = model.AppointmentId,
                        PatientId = Guid.Parse(model.PatientId.ToString()),
                        DoctorId = appointment.DoctorId,
                        ConsultationDate = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.ConsultationRecords.Add(consultationRecord);
                }

                // Update consultation details
                consultationRecord.OfficialDiagnosis = model.OfficialDiagnosis;
                consultationRecord.AIDiagnosisConfirmed = model.AIDiagnosisConfirmed;
                consultationRecord.ConsultationNotes = model.ConsultationNotes;
                consultationRecord.TreatmentPlan = model.TreatmentPlan;
                consultationRecord.LabTestsOrdered = model.LabTestsOrdered;
                consultationRecord.UpdatedAt = DateTime.UtcNow;

                // Add prescriptions
                foreach (var prescriptionVM in model.Prescriptions)
                {
                    consultationRecord.Prescriptions.Add(new Prescription
                    {
                        DrugName = prescriptionVM.DrugName,
                        Dosage = prescriptionVM.Dosage,
                        Frequency = prescriptionVM.Frequency,
                        Duration = prescriptionVM.Duration,
                        Instructions = prescriptionVM.Instructions,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                // Mark appointment as completed
                appointment.Status = AppointmentStatus.Completed;
                appointment.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Consultation saved successfully",
                    Data = new
                    {
                        consultationId = consultationRecord.Id,
                        appointmentId = appointment.Id
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving consultation");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while saving consultation"
                });
            }
        }

        [HttpGet("{consultationRecordId}")]
        [RequirePermission("ViewConsultations")]
        public async Task<ActionResult<ApiResponse<ConsultationViewModel>>> GetConsultationById(Guid consultationRecordId, [FromQuery] string userId)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                
                var consultationRecord = await _context.ConsultationRecords
                    .Include(c => c.Appointment)
                        .ThenInclude(a => a.Patient)
                            .ThenInclude(p => p.User)
                    .Include(c => c.Appointment)
                        .ThenInclude(a => a.Doctor)
                            .ThenInclude(d => d.User)
                    .Include(c => c.Prescriptions)
                    .Include(c => c.AIPrediction)
                        .ThenInclude(ap => ap!.Disease!)
                    .FirstOrDefaultAsync(c => c.Id == consultationRecordId);

                if (consultationRecord == null)
                {
                    return NotFound(new ApiResponse<ConsultationViewModel>
                    {
                        Success = false,
                        Message = "Consultation not found"
                    });
                }

                // Verify user has access (either the patient or the doctor)
                var isPatient = consultationRecord.Appointment.Patient.UserId == userGuid;
                var isDoctor = consultationRecord.Appointment.Doctor.UserId == userGuid;

                if (!isPatient && !isDoctor)
                {
                    return Forbid();
                }

                // Build response
                var response = new ConsultationViewModel
                {
                    AppointmentId = consultationRecord.AppointmentId,
                    AppointmentDate = consultationRecord.Appointment.AppointmentDate,
                    PatientName = $"{consultationRecord.Patient.User.FirstName} {consultationRecord.Patient.User.LastName}",
                    ReasonForVisit = consultationRecord.Appointment.ReasonForVisit ?? "",
                    AppointmentNotes = consultationRecord.Appointment.Notes ?? "",
                    PatientId = consultationRecord.PatientId,
                    PatientGender = EnumHelper.FromGender(consultationRecord.Patient.User.Gender),
                    PatientDateOfBirth = consultationRecord.Patient.User.DateOfBirth,
                    PatientPhone = consultationRecord.Patient.User.PhoneNumber ?? "",
                    PatientEmail = consultationRecord.Patient.User.Email,
                    PatientMedicalHistory = consultationRecord.Patient.MedicalHistory ?? "",
                    PatientAllergies = consultationRecord.Patient.Allergies ?? "",
                    OfficialDiagnosis = consultationRecord.OfficialDiagnosis,
                    AIDiagnosisConfirmed = consultationRecord.AIDiagnosisConfirmed,
                    ConsultationNotes = consultationRecord.ConsultationNotes ?? "",
                    TreatmentPlan = consultationRecord.TreatmentPlan ?? "",
                    LabTestsOrdered = consultationRecord.LabTestsOrdered ?? "",
                    Prescriptions = consultationRecord.Prescriptions.Select(p => new PrescriptionViewModel
                    {
                        Id = p.Id,
                        DrugName = p.DrugName,
                        Dosage = p.Dosage,
                        Frequency = p.Frequency,
                        Duration = p.Duration,
                        Instructions = p.Instructions ?? ""
                    }).ToList(),
                    IsCompleted = true,
                    CompletedDate = consultationRecord.ConsultationDate,
                    ConsultationRecordId = consultationRecord.Id,
                    DoctorName = $"{consultationRecord.Doctor.User.FirstName} {consultationRecord.Doctor.User.LastName}",
                    DoctorSpecialization = consultationRecord.Doctor.Specialization,
                    ConsultationDate = consultationRecord.ConsultationDate,
                    AIPredictionUsed = consultationRecord.AIPredictionId.HasValue
                };

                // Add AI prediction if exists
                if (consultationRecord.AIPrediction != null)
                {
                    response.AIPrediction = new AIPredictionViewModel
                    {
                        Id = consultationRecord.AIPrediction.Id,
                        PrimaryCondition = consultationRecord.AIPrediction.Disease.Name,
                        ConfidenceScore = consultationRecord.AIPrediction.Probability,
                        SymptomsReported = consultationRecord.Appointment.ReasonForVisit ?? "",
                        PredictionResults = new List<DiseaseProbability>
                        {
                            new DiseaseProbability
                            {
                                DiseaseName = consultationRecord.AIPrediction.Disease.Name,
                                Probability = consultationRecord.AIPrediction.Probability
                            }
                        },
                        AIDisclaimer = "This is an AI-generated prediction for reference only.",
                        CreatedAt = consultationRecord.AIPrediction.CreatedAt
                    };
                }

                return Ok(new ApiResponse<ConsultationViewModel>
                {
                    Success = true,
                    Message = "Consultation retrieved successfully",
                    Data = response
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving consultation {ConsultationId}", consultationRecordId);
                return StatusCode(500, new ApiResponse<ConsultationViewModel>
                {
                    Success = false,
                    Message = "An error occurred while retrieving consultation"
                });
            }
        }

        [HttpGet("history/{userId}")]
        [RequirePermission("ViewConsultations")]
        public async Task<ActionResult<ApiResponse<List<ConsultationSummaryViewModel>>>> GetConsultationHistory(string userId, [FromQuery] string? role)
        {
            try
            {
                IQueryable<ConsultationRecord> query = _context.ConsultationRecords
                    .Include(c => c.Appointment)
                        .ThenInclude(a => a.Patient)
                            .ThenInclude(p => p.User)
                    .Include(c => c.Prescriptions);

                if (role == "Doctor")
                {
                    var userGuid = Guid.Parse(userId);
                    var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userGuid);
                    if (doctor != null)
                    {
                        query = query.Where(c => c.DoctorId == doctor.Id);
                    }
                }
                else if (role == "Patient")
                {
                    var userGuid = Guid.Parse(userId);
                    var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userGuid);
                    if (patient != null)
                    {
                        query = query.Where(c => c.PatientId == patient.Id);
                    }
                }

                var consultations = await query
                    .OrderByDescending(c => c.ConsultationDate)
                    .ToListAsync();

                var history = consultations.Select(c => new ConsultationSummaryViewModel
                {
                    ConsultationRecordId = c.Id,
                    AppointmentId = c.AppointmentId,
                    PatientName = $"{c.Patient.User.FirstName} {c.Patient.User.LastName}",
                    PatientAge = CalculateAge(c.Patient.User.DateOfBirth),
                    PatientGender = EnumHelper.FromGender(c.Patient.User.Gender),
                    ConsultationDate = c.ConsultationDate,
                    OfficialDiagnosis = c.OfficialDiagnosis,
                    AIPredictionUsed = c.AIPredictionId.HasValue,
                    AIDiagnosisConfirmed = c.AIDiagnosisConfirmed,
                    PrescriptionsCount = c.Prescriptions.Count,
                    ReasonForVisit = c.Appointment.ReasonForVisit ?? ""
                }).ToList();

                return Ok(new ApiResponse<List<ConsultationSummaryViewModel>>
                {
                    Success = true,
                    Message = "Consultation history retrieved successfully",
                    Data = history
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving consultation history for user {UserId}", userId);
                return StatusCode(500, new ApiResponse<List<ConsultationSummaryViewModel>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving consultation history"
                });
            }
        }

        [HttpGet("doctor")]
        [RequirePermission("ViewConsultations")]
        public async Task<ActionResult<ApiResponse<List<ConsultationSummaryViewModel>>>> GetDoctorConsultations([FromQuery] string userId)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userGuid);
                
                if (doctor == null)
                {
                    return NotFound(new ApiResponse<List<ConsultationSummaryViewModel>>
                    {
                        Success = false,
                        Message = "Doctor profile not found"
                    });
                }

                var consultations = await _context.ConsultationRecords
                    .Include(c => c.Appointment)
                    .Include(c => c.Patient)
                        .ThenInclude(p => p.User)
                    .Include(c => c.Prescriptions)
                    .Include(c => c.AIPrediction)
                        .ThenInclude(ap => ap!.Disease!)
                    .Where(c => c.DoctorId == doctor.Id)
                    .OrderByDescending(c => c.ConsultationDate)
                    .ToListAsync();

                var result = consultations.Select(c => new ConsultationSummaryViewModel
                {
                    ConsultationRecordId = c.Id,
                    AppointmentId = c.AppointmentId,
                    PatientName = $"{c.Patient.User.FirstName} {c.Patient.User.LastName}",
                    PatientAge = CalculateAge(c.Patient.User.DateOfBirth),
                    PatientGender = EnumHelper.FromGender(c.Patient.User.Gender),
                    ConsultationDate = c.ConsultationDate,
                    OfficialDiagnosis = c.OfficialDiagnosis,
                    AIPredictionUsed = c.AIPredictionId.HasValue,
                    AIDiagnosisConfirmed = c.AIDiagnosisConfirmed,
                    AIPredictionCondition = c.AIPrediction?.Disease?.Name,
                    AIPredictionConfidence = c.AIPrediction?.Probability,
                    PrescriptionsCount = c.Prescriptions.Count,
                    LabTestsOrdered = c.LabTestsOrdered,
                    ReasonForVisit = c.Appointment.ReasonForVisit ?? ""
                }).ToList();

                return Ok(new ApiResponse<List<ConsultationSummaryViewModel>>
                {
                    Success = true,
                    Message = "Doctor consultations retrieved successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctor consultations for user {UserId}", userId);
                return StatusCode(500, new ApiResponse<List<ConsultationSummaryViewModel>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving consultations"
                });
            }
        }

        [HttpGet("patient/{patientId}")]
        [RequirePermission("ViewConsultations")]
        public async Task<ActionResult<ApiResponse<List<ConsultationSummaryViewModel>>>> GetPatientConsultations(Guid patientId)
        {
            try
            {
                var patient = await _context.Patients
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.Id == patientId);
                
                if (patient == null)
                {
                    return NotFound(new ApiResponse<List<ConsultationSummaryViewModel>>
                    {
                        Success = false,
                        Message = "Patient profile not found"
                    });
                }

                var consultations = await _context.ConsultationRecords
                    .Include(c => c.Appointment)
                    .Include(c => c.Doctor)
                        .ThenInclude(d => d.User)
                    .Include(c => c.Prescriptions)
                    .Include(c => c.AIPrediction)
                        .ThenInclude(ap => ap!.Disease!)
                    .Where(c => c.PatientId == patientId)
                    .OrderByDescending(c => c.ConsultationDate)
                    .ToListAsync();

                var result = consultations.Select(c => new ConsultationSummaryViewModel
                {
                    ConsultationRecordId = c.Id,
                    AppointmentId = c.AppointmentId,
                    DoctorName = $"{c.Doctor.User.FirstName} {c.Doctor.User.LastName}",
                    DoctorSpecialization = c.Doctor.Specialization,
                    DoctorProfilePicture = c.Doctor.User.ProfilePicture,
                    ConsultationDate = c.ConsultationDate,
                    OfficialDiagnosis = c.OfficialDiagnosis,
                    AIPredictionUsed = c.AIPredictionId.HasValue,
                    AIDiagnosisConfirmed = c.AIDiagnosisConfirmed,
                    AIPredictionCondition = c.AIPrediction?.Disease?.Name,
                    AIPredictionConfidence = c.AIPrediction?.Probability,
                    PrescriptionsCount = c.Prescriptions.Count,
                    LabTestsOrdered = c.LabTestsOrdered,
                    ReasonForVisit = c.Appointment.ReasonForVisit ?? ""
                }).ToList();

                return Ok(new ApiResponse<List<ConsultationSummaryViewModel>>
                {
                    Success = true,
                    Message = "Patient consultations retrieved successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient consultations for patient {PatientId}", patientId);
                return StatusCode(500, new ApiResponse<List<ConsultationSummaryViewModel>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving consultations"
                });
            }
        }

        [HttpGet("patient/{patientId}/consultation/{consultationId}")]
        [RequirePermission("ViewConsultations")]
        public async Task<ActionResult<ApiResponse<ConsultationViewModel>>> GetPatientConsultationDetail(Guid patientId, Guid consultationId)
        {
            try
            {
                // Verify patient exists and get their info
                var patient = await _context.Patients
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.Id == patientId);
                
                if (patient == null)
                {
                    return NotFound(new ApiResponse<ConsultationViewModel>
                    {
                        Success = false,
                        Message = "Patient profile not found"
                    });
                }

                // Get the consultation record with all related data
                var consultationRecord = await _context.ConsultationRecords
                    .Include(c => c.Appointment)
                    .Include(c => c.Patient)
                        .ThenInclude(p => p.User)
                    .Include(c => c.Doctor)
                        .ThenInclude(d => d.User)
                    .Include(c => c.Prescriptions)
                    .Include(c => c.AIPrediction)
                        .ThenInclude(ap => ap!.Disease!)
                    .FirstOrDefaultAsync(c => c.Id == consultationId && c.PatientId == patientId);

                if (consultationRecord == null)
                {
                    return NotFound(new ApiResponse<ConsultationViewModel>
                    {
                        Success = false,
                        Message = "Consultation record not found or does not belong to this patient"
                    });
                }

                // Build the consultation view model
                var consultation = new ConsultationViewModel
                {
                    AppointmentId = consultationRecord.AppointmentId,
                    AppointmentDate = consultationRecord.Appointment.AppointmentDate,
                    PatientName = $"{consultationRecord.Patient.User.FirstName} {consultationRecord.Patient.User.LastName}",
                    ReasonForVisit = consultationRecord.Appointment.ReasonForVisit ?? "",
                    AppointmentNotes = consultationRecord.Appointment.Notes ?? "",
                    PatientId = consultationRecord.PatientId,
                    PatientGender = EnumHelper.FromGender(consultationRecord.Patient.User.Gender),
                    PatientDateOfBirth = consultationRecord.Patient.User.DateOfBirth,
                    PatientPhone = consultationRecord.Patient.User.PhoneNumber ?? "",
                    PatientEmail = consultationRecord.Patient.User.Email ?? "",
                    PatientMedicalHistory = consultationRecord.Patient.MedicalHistory ?? "",
                    PatientAllergies = consultationRecord.Patient.Allergies ?? "",
                    OfficialDiagnosis = consultationRecord.OfficialDiagnosis,
                    AIDiagnosisConfirmed = consultationRecord.AIDiagnosisConfirmed,
                    ConsultationNotes = consultationRecord.ConsultationNotes ?? "",
                    TreatmentPlan = consultationRecord.TreatmentPlan ?? "",
                    LabTestsOrdered = consultationRecord.LabTestsOrdered ?? "",
                    Prescriptions = consultationRecord.Prescriptions.Select(p => new PrescriptionViewModel
                    {
                        Id = p.Id,
                        DrugName = p.DrugName,
                        Dosage = p.Dosage,
                        Frequency = p.Frequency,
                        Duration = p.Duration,
                        Instructions = p.Instructions ?? ""
                    }).ToList(),
                    IsCompleted = true,
                    CompletedDate = consultationRecord.ConsultationDate,
                    ConsultationRecordId = consultationRecord.Id,
                    DoctorName = $"{consultationRecord.Doctor.User.FirstName} {consultationRecord.Doctor.User.LastName}",
                    DoctorSpecialization = consultationRecord.Doctor.Specialization,
                    ConsultationDate = consultationRecord.ConsultationDate,
                    AIPredictionUsed = consultationRecord.AIPredictionId.HasValue
                };

                // Add AI prediction details if available
                if (consultationRecord.AIPrediction != null)
                {
                    consultation.AIPrediction = new AIPredictionViewModel
                    {
                        Id = consultationRecord.AIPrediction.Id,
                        PrimaryCondition = consultationRecord.AIPrediction.Disease?.Name ?? "",
                        ConfidenceScore = consultationRecord.AIPrediction.Probability,
                        SymptomsReported = "",
                        CreatedAt = consultationRecord.AIPrediction.CreatedAt
                    };
                }

                return Ok(new ApiResponse<ConsultationViewModel>
                {
                    Success = true,
                    Message = "Consultation details retrieved successfully",
                    Data = consultation
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving consultation details for patient {PatientId}, consultation {ConsultationId}", patientId, consultationId);
                return StatusCode(500, new ApiResponse<ConsultationViewModel>
                {
                    Success = false,
                    Message = "An error occurred while retrieving consultation details"
                });
            }
        }

        private int CalculateAge(DateTime dateOfBirth)
        {
            var today = DateTime.Today;
            var age = today.Year - dateOfBirth.Year;
            if (dateOfBirth.Date > today.AddYears(-age)) age--;
            return age;
        }
    }
}
