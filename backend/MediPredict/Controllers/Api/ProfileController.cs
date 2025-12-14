using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediPredict.Data.DatabaseContext;
using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;
using MediPredict.Data.Enums;
using MediPredict.Helpers;
using MediPredict.Attributes;

namespace MediPredict.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(ApplicationDbContext context, ILogger<ProfileController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("patient/{userId}")]
        public async Task<ActionResult<ApiResponse<PatientProfileSummaryViewModel>>> GetPatientProfile(string userId)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var patient = await _context.Patients
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.UserId == userGuid);

                if (patient == null)
                {
                    return NotFound(new ApiResponse<PatientProfileSummaryViewModel>
                    {
                        Success = false,
                        Message = "Patient profile not found"
                    });
                }

                var profile = new PatientProfileSummaryViewModel
                {
                    PatientId = patient.Id,
                    UserId = patient.UserId.ToString(),
                    FirstName = patient.User.FirstName,
                    LastName = patient.User.LastName,
                    Email = patient.User.Email,
                    PhoneNumber = patient.User.PhoneNumber ?? "",
                    DateOfBirth = patient.User.DateOfBirth,
                    Gender = EnumHelper.FromGender(patient.User.Gender),
                    Address = patient.User.Address ?? "",
                    BloodType = patient.BloodGroup ?? "",
                    Allergies = patient.Allergies ?? "",
                    MedicalHistory = patient.MedicalHistory ?? "",
                    IsPregnant = patient.IsPregnant,
                    EmergencyContact = patient.EmergencyContact,
                    EmergencyPhone = patient.EmergencyPhone,
                    ProfilePicture = patient.User.ProfilePicture,
                    CreatedAt = patient.CreatedAt
                };

                return Ok(new ApiResponse<PatientProfileSummaryViewModel>
                {
                    Success = true,
                    Message = "Patient profile retrieved successfully",
                    Data = profile
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient profile for user {UserId}", userId);
                return StatusCode(500, new ApiResponse<PatientProfileSummaryViewModel>
                {
                    Success = false,
                    Message = "An error occurred while retrieving profile"
                });
            }
        }

        [HttpPut("patient/{userId}")]
        public async Task<ActionResult<ApiResponse<object>>> UpdatePatientProfile(string userId, [FromBody] PatientProfileSummaryViewModel model)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var patient = await _context.Patients
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.UserId == userGuid);

                if (patient == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Patient profile not found"
                    });
                }

                // Update user information
                patient.User.FirstName = model.FirstName;
                patient.User.LastName = model.LastName;
                patient.User.PhoneNumber = model.PhoneNumber;
                patient.User.DateOfBirth = model.DateOfBirth;
                patient.User.Gender = EnumHelper.ToGender(model.Gender);
                patient.User.Address = model.Address;

                // Update patient-specific information
                patient.BloodGroup = model.BloodType;
                patient.Allergies = model.Allergies;
                patient.MedicalHistory = model.MedicalHistory;
                patient.IsPregnant = model.IsPregnant;
                patient.EmergencyContact = model.EmergencyContact;
                patient.EmergencyPhone = model.EmergencyPhone;
                patient.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Patient profile updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating patient profile for user {UserId}", userId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while updating profile"
                });
            }
        }

        [HttpGet("doctor/{userId}")]
        public async Task<ActionResult<ApiResponse<DoctorProfileViewModel>>> GetDoctorProfile(string userId)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.UserId == userGuid);

                if (doctor == null)
                {
                    return NotFound(new ApiResponse<DoctorProfileViewModel>
                    {
                        Success = false,
                        Message = "Doctor profile not found"
                    });
                }

                // Calculate statistics
                var totalPatients = await _context.Appointments
                    .Where(a => a.DoctorId == doctor.Id && a.Status == AppointmentStatus.Completed)
                    .Select(a => a.PatientId)
                    .Distinct()
                    .CountAsync();

                var totalAppointments = await _context.Appointments
                    .Where(a => a.DoctorId == doctor.Id)
                    .CountAsync();

                var totalConsultations = await _context.ConsultationRecords
                    .Where(c => c.DoctorId == doctor.Id)
                    .CountAsync();

                var profile = new DoctorProfileViewModel
                {
                    DoctorId = doctor.Id,
                    UserId = doctor.UserId.ToString(),
                    FullName = $"{doctor.User.FirstName} {doctor.User.LastName}",
                    Email = doctor.User.Email,
                    PhoneNumber = doctor.User.PhoneNumber ?? "",
                    Specialization = doctor.Specialization,
                    Qualifications = doctor.Qualifications,
                    Experience = doctor.Experience,
                    LicenseNumber = doctor.LicenseNumber,
                    LicenseState = doctor.LicenseState,
                    LicenseIssueDate = doctor.LicenseIssueDate,
                    LicenseExpiryDate = doctor.LicenseExpiryDate,
                    NpiNumber = doctor.NpiNumber,
                    ProfessionalTitle = doctor.ProfessionalTitle,
                    EducationTraining = doctor.EducationTraining,
                    BoardCertifications = doctor.BoardCertifications,
                    IsVerified = doctor.IsVerified,
                    ConsultationFee = doctor.ConsultationFee,
                    Bio = doctor.Bio,
                    Address = doctor.User.Address,
                    ProfilePicture = doctor.User.ProfilePicture,
                    AvailableDays = string.IsNullOrEmpty(doctor.AvailableDays)
                        ? new List<string>()
                        : doctor.AvailableDays.Split(',').Select(d => d.Trim()).ToList(),
                    AvailableTimeStart = doctor.AvailableTimeStart?.ToString(@"hh\:mm"),
                    AvailableTimeEnd = doctor.AvailableTimeEnd?.ToString(@"hh\:mm"),
                    TotalPatients = totalPatients,
                    CompletedConsultations = totalConsultations,
                    AverageRating = 0,
                    TotalReviews = 0
                };

                return Ok(new ApiResponse<DoctorProfileViewModel>
                {
                    Success = true,
                    Message = "Doctor profile retrieved successfully",
                    Data = profile
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctor profile for user {UserId}", userId);
                return StatusCode(500, new ApiResponse<DoctorProfileViewModel>
                {
                    Success = false,
                    Message = "An error occurred while retrieving profile"
                });
            }
        }

        [HttpPut("doctor/{userId}")]
        public async Task<ActionResult<ApiResponse<object>>> UpdateDoctorProfile(string userId, [FromBody] DoctorEditViewModel model)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.UserId == userGuid);

                if (doctor == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Doctor profile not found"
                    });
                }

                // Update user information
                doctor.User.FirstName = model.FirstName;
                doctor.User.LastName = model.LastName;
                doctor.User.PhoneNumber = model.PhoneNumber;

                // Update doctor-specific information
                doctor.Specialization = model.Specialization;
                doctor.Qualifications = model.Qualifications;
                doctor.Experience = model.Experience;
                doctor.ConsultationFee = model.ConsultationFee;
                doctor.Bio = model.Bio;
                doctor.User.Address = model.Address;
                doctor.AvailableDays = model.AvailableDays != null ? string.Join(",", model.AvailableDays) : "";
                
                // Update education and certifications if provided
                if (!string.IsNullOrEmpty(model.EducationTraining))
                {
                    doctor.EducationTraining = model.EducationTraining;
                }
                if (!string.IsNullOrEmpty(model.BoardCertifications))
                {
                    doctor.BoardCertifications = model.BoardCertifications;
                }
                
                // Parse time strings
                if (!string.IsNullOrEmpty(model.AvailableTimeStart) && TimeSpan.TryParse(model.AvailableTimeStart, out var startTime))
                {
                    doctor.AvailableTimeStart = startTime;
                }
                if (!string.IsNullOrEmpty(model.AvailableTimeEnd) && TimeSpan.TryParse(model.AvailableTimeEnd, out var endTime))
                {
                    doctor.AvailableTimeEnd = endTime;
                }

                doctor.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Doctor profile updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating doctor profile for user {UserId}", userId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while updating profile"
                });
            }
        }

        [HttpPost("picture/{userId}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ApiResponse<string>>> UploadProfilePicture(
            string userId, 
            [FromQuery] string role,
            IFormFile picture)
        {
            try
            {
                if (picture == null || picture.Length == 0)
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Message = "No file uploaded"
                    });
                }

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var extension = Path.GetExtension(picture.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Message = "Invalid file type. Only JPG, PNG, and GIF are allowed."
                    });
                }

                // Validate file size (5MB max)
                if (picture.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Message = "File size exceeds 5MB limit"
                    });
                }

                // Create uploads directory if it doesn't exist
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
                Directory.CreateDirectory(uploadsPath);

                // Generate unique filename
                var fileName = $"{userId}_{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await picture.CopyToAsync(stream);
                }

                var relativePath = $"/uploads/profiles/{fileName}";

                // Update database
                var userGuid = Guid.Parse(userId);
                if (role == "Patient")
                {
                    var patient = await _context.Patients
                        .Include(p => p.User)
                        .FirstOrDefaultAsync(p => p.UserId == userGuid);
                    if (patient != null)
                    {
                        patient.User.ProfilePicture = relativePath;
                        patient.UpdatedAt = DateTime.UtcNow;
                        _logger.LogInformation("Updated profile picture for patient {UserId}", userId);
                    }
                    else
                    {
                        _logger.LogWarning("Patient not found for userId {UserId}", userId);
                    }
                }
                else if (role == "Doctor")
                {
                    var doctor = await _context.Doctors
                        .Include(d => d.User)
                        .FirstOrDefaultAsync(d => d.UserId == userGuid);
                    if (doctor != null)
                    {
                        doctor.User.ProfilePicture = relativePath;
                        doctor.UpdatedAt = DateTime.UtcNow;
                        _logger.LogInformation("Updated profile picture for doctor {UserId}", userId);
                    }
                    else
                    {
                        _logger.LogWarning("Doctor not found for userId {UserId}", userId);
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    Message = "Profile picture uploaded successfully",
                    Data = relativePath
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile picture for user {UserId}", userId);
                return StatusCode(500, new ApiResponse<string>
                {
                    Success = false,
                    Message = "An error occurred while uploading picture"
                });
            }
        }
    }
}
