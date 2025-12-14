using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediPredict.Data.DatabaseContext;
using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;
using MediPredict.Data.Enums;
using MediPredict.Helpers;
using MediPredict.Services.Interfaces;
using MediPredict.Services;
using MediPredict.Attributes;

namespace MediPredict.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAdminService _adminService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            ApplicationDbContext context,
            IAdminService adminService,
            IEmailService emailService,
            ILogger<AdminController> logger)
        {
            _context = context;
            _adminService = adminService;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpGet("doctors/pending")]
        [RequirePermission("VerifyDoctor")]
        public async Task<ActionResult<ApiResponse<List<DoctorApprovalViewModel>>>> GetPendingDoctors()
        {
            try
            {
                var pendingDoctors = await _context.Doctors
                    .Include(d => d.User)
                    .Where(d => !d.IsVerified)
                    .OrderBy(d => d.CreatedAt)
                    .Select(d => new DoctorApprovalViewModel
                    {
                        DoctorId = d.Id,
                        UserId = d.UserId,
                        FirstName = d.User.FirstName,
                        LastName = d.User.LastName,
                        Email = d.User.Email,
                        PhoneNumber = d.User.PhoneNumber ?? "",
                        Specialization = d.Specialization,
                        LicenseNumber = d.LicenseNumber,
                        HospitalAffiliation = "",
                        YearsOfExperience = d.Experience,
                        EducationDetails = d.Qualifications ?? "",
                        CreatedAt = d.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new ApiResponse<List<DoctorApprovalViewModel>>
                {
                    Success = true,
                    Message = "Pending doctors retrieved successfully",
                    Data = pendingDoctors
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending doctors");
                return StatusCode(500, new ApiResponse<List<DoctorApprovalViewModel>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving pending doctors"
                });
            }
        }

        [HttpPost("doctors/{doctorId}/approve")]
        [RequirePermission("VerifyDoctor")]
        public async Task<ActionResult<ApiResponse<object>>> ApproveDoctor(Guid doctorId)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == doctorId);

                if (doctor == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                if (doctor.IsVerified)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Doctor is already approved"
                    });
                }

                doctor.IsVerified = true;
                doctor.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Send approval email (skipped - no generic SendEmailAsync method)
                try
                {
                    // TODO: Implement generic email sending or use specific method
                    _logger.LogInformation("Doctor {DoctorId} approved. Email notification skipped.", doctorId);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Failed to send approval email to doctor {DoctorId}", doctorId);
                }

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Doctor approved successfully",
                    Data = new
                    {
                        doctorId = doctor.Id,
                        approvedAt = doctor.UpdatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving doctor {DoctorId}", doctorId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while approving the doctor"
                });
            }
        }

        [HttpPost("doctors/{doctorId}/reject")]
        public async Task<ActionResult<ApiResponse<object>>> RejectDoctor(Guid doctorId, [FromBody] string reason)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == doctorId);

                if (doctor == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                // Send rejection email (skipped - no generic SendEmailAsync method)
                try
                {
                    // TODO: Implement generic email sending
                    _logger.LogInformation("Doctor {DoctorId} rejected. Email notification skipped.", doctorId);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Failed to send rejection email to doctor {DoctorId}", doctorId);
                }

                // Remove doctor and user records
                _context.Doctors.Remove(doctor);
                _context.Users.Remove(doctor.User);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Doctor application rejected successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting doctor {DoctorId}", doctorId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while rejecting the doctor"
                });
            }
        }

        [HttpGet("patients")]
        [RequirePermission("ViewPatients")]
        public async Task<ActionResult<ApiResponse<List<PatientManagementViewModel>>>> GetAllPatients(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var query = _context.Patients
                    .Include(p => p.User)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(p =>
                        p.User.FirstName.Contains(search) ||
                        p.User.LastName.Contains(search) ||
                        p.User.Email.Contains(search));
                }

                var totalCount = await query.CountAsync();
                var patients = await query
                    .OrderBy(p => p.User.LastName)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var patientList = patients.Select(p => new PatientListItemViewModel
                {
                    PatientId = p.Id,
                    FullName = $"{p.User.FirstName} {p.User.LastName}",
                    Email = p.User.Email,
                    Phone = p.User.PhoneNumber,
                    DateOfBirth = p.User.DateOfBirth,
                    Gender = EnumHelper.FromGender(p.User.Gender),
                    RegistrationDate = p.CreatedAt.Date,
                    TotalAppointments = _context.Appointments.Count(a => a.PatientId == p.Id),
                    TotalPredictions = _context.SymptomEntries.Count(se => se.PatientId == p.Id),
                    LastVisit = _context.Appointments
                        .Where(a => a.PatientId == p.Id && a.Status == AppointmentStatus.Completed)
                        .OrderByDescending(a => a.AppointmentDate)
                        .Select(a => a.AppointmentDate)
                        .FirstOrDefault(),
                    Status = p.User.IsActive ? "Active" : "Inactive"
                }).ToList();

                var management = new PatientManagementViewModel
                {
                    Patients = patientList,
                    TotalPatients = totalCount,
                    ActivePatients = patients.Count(p => p.User.IsActive),
                    InactivePatients = patients.Count(p => !p.User.IsActive)
                };

                return Ok(new ApiResponse<PatientManagementViewModel>
                {
                    Success = true,
                    Message = "Patients retrieved successfully",
                    Data = management
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patients");
                return StatusCode(500, new ApiResponse<PatientManagementViewModel>
                {
                    Success = false,
                    Message = "An error occurred while retrieving patients"
                });
            }
        }

        [HttpGet("doctors")]
        [RequirePermission("ViewDoctors")]
        public async Task<ActionResult<ApiResponse<List<DoctorManagementViewModel>>>> GetAllDoctors(
            [FromQuery] string? search = null,
            [FromQuery] string? specialization = null,
            [FromQuery] bool? approvedOnly = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var query = _context.Doctors
                    .Include(d => d.User)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(d =>
                        d.User.FirstName.Contains(search) ||
                        d.User.LastName.Contains(search) ||
                        d.Specialization.Contains(search));
                }

                if (!string.IsNullOrWhiteSpace(specialization))
                {
                    query = query.Where(d => d.Specialization == specialization);
                }

                if (approvedOnly.HasValue)
                {
                    query = query.Where(d => d.IsVerified == approvedOnly.Value);
                }

                var totalCount = await query.CountAsync();
                var doctors = await query
                    .OrderBy(d => d.User.LastName)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var doctorList = doctors.Select(d => new DoctorListItemViewModel
                {
                    DoctorId = d.Id,
                    FullName = $"{d.User.FirstName} {d.User.LastName}",
                    Specialization = d.Specialization,
                    Qualification = d.Qualifications,
                    LicenseNumber = d.LicenseNumber,
                    Email = d.User.Email,
                    Phone = d.User.PhoneNumber ?? "",
                    Experience = d.Experience,
                    ConsultationFee = d.ConsultationFee,
                    Rating = 4.5,
                    TotalReviews = 0,
                    TotalAppointments = _context.Appointments.Count(a => a.DoctorId == d.Id),
                    IsVerified = d.IsVerified,
                    Status = !d.User.IsActive ? "Suspended" : (d.IsVerified ? "Active" : "Pending"),
                    RegistrationDate = d.CreatedAt.Date,
                    LastActive = d.User.LastLoginAt ?? d.CreatedAt
                }).ToList();

                var management = new DoctorManagementViewModel
                {
                    Doctors = doctorList,
                    TotalDoctors = totalCount,
                    VerifiedDoctors = doctors.Count(d => d.IsVerified),
                    PendingApproval = doctors.Count(d => !d.IsVerified)
                };

                return Ok(new ApiResponse<DoctorManagementViewModel>
                {
                    Success = true,
                    Message = "Doctors retrieved successfully",
                    Data = management
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctors");
                return StatusCode(500, new ApiResponse<DoctorManagementViewModel>
                {
                    Success = false,
                    Message = "An error occurred while retrieving doctors"
                });
            }
        }

        [HttpPost("doctors/{doctorId}/suspend")]
        [RequirePermission("ManageUsers")]
        public async Task<ActionResult<ApiResponse<object>>> SuspendDoctor(Guid doctorId)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == doctorId);

                if (doctor == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                doctor.User.IsActive = false;
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Doctor account suspended successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suspending doctor {DoctorId}", doctorId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while suspending the doctor"
                });
            }
        }

        [HttpPost("doctors/{doctorId}/activate")]
        [RequirePermission("ManageUsers")]
        public async Task<ActionResult<ApiResponse<object>>> ActivateDoctor(Guid doctorId)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == doctorId);

                if (doctor == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                doctor.User.IsActive = true;
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Doctor account activated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating doctor {DoctorId}", doctorId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while activating the doctor"
                });
            }
        }

        [HttpPost("patients/{patientId}/block")]
        [RequirePermission("ManageUsers")]
        public async Task<ActionResult<ApiResponse<object>>> BlockPatient(Guid patientId)
        {
            try
            {
                var patient = await _context.Patients
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.Id == patientId);

                if (patient == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Patient not found"
                    });
                }

                patient.User.IsActive = false;
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Patient account blocked successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error blocking patient {PatientId}", patientId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while blocking the patient"
                });
            }
        }

        [HttpPost("patients/{patientId}/unblock")]
        [RequirePermission("ManageUsers")]
        public async Task<ActionResult<ApiResponse<object>>> UnblockPatient(Guid patientId)
        {
            try
            {
                var patient = await _context.Patients
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.Id == patientId);

                if (patient == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Patient not found"
                    });
                }

                patient.User.IsActive = true;
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Patient account unblocked successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unblocking patient {PatientId}", patientId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while unblocking the patient"
                });
            }
        }

        [HttpPut("appointments/{appointmentId}/status")]
        [RequirePermission("UpdateAppointment")]
        public async Task<ActionResult<ApiResponse<object>>> UpdateAppointmentStatus(int appointmentId, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(appointmentId);
                if (appointment == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                appointment.Status = EnumHelper.ToAppointmentStatus(request.NewStatus);
                appointment.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Appointment status updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating appointment status {AppointmentId}", appointmentId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while updating appointment status"
                });
            }
        }

        [HttpGet("analytics")]
        [RequirePermission("ViewSystemLogs")]
        public async Task<ActionResult<ApiResponse<AdminAnalyticsViewModel>>> GetAnalytics()
        {
            try
            {
                var now = DateTime.UtcNow;
                var thirtyDaysAgo = now.AddDays(-30);
                var sixtyDaysAgo = now.AddDays(-60);

                // Current month data
                var totalPatients = await _context.Patients.CountAsync();
                var totalDoctors = await _context.Doctors.Where(d => d.IsVerified).CountAsync();
                var pendingApprovals = await _context.Doctors.Where(d => !d.IsVerified).CountAsync();
                var totalAppointments = await _context.Appointments.CountAsync();
                var totalConsultations = await _context.ConsultationRecords.CountAsync();
                var totalPredictions = await _context.AIPredictions.CountAsync();

                // Last 30 days
                var recentPatients = await _context.Patients.CountAsync(p => p.CreatedAt >= thirtyDaysAgo);
                var recentDoctors = await _context.Doctors.CountAsync(d => d.CreatedAt >= thirtyDaysAgo && d.IsVerified);
                var recentAppointments = await _context.Appointments.CountAsync(a => a.CreatedAt >= thirtyDaysAgo);
                var recentConsultations = await _context.ConsultationRecords.CountAsync(c => c.CreatedAt >= thirtyDaysAgo);

                // Previous 30 days (for growth calculation)
                var previousPatients = await _context.Patients.CountAsync(p => p.CreatedAt >= sixtyDaysAgo && p.CreatedAt < thirtyDaysAgo);
                var previousDoctors = await _context.Doctors.CountAsync(d => d.CreatedAt >= sixtyDaysAgo && d.CreatedAt < thirtyDaysAgo && d.IsVerified);
                var previousAppointments = await _context.Appointments.CountAsync(a => a.CreatedAt >= sixtyDaysAgo && a.CreatedAt < thirtyDaysAgo);

                // Calculate growth rates
                decimal patientGrowthRate = CalculateGrowthRate(previousPatients, recentPatients);
                decimal doctorGrowthRate = CalculateGrowthRate(previousDoctors, recentDoctors);
                decimal appointmentGrowthRate = CalculateGrowthRate(previousAppointments, recentAppointments);

                // Appointment statistics
                var appointmentStats = await _context.Appointments
                    .GroupBy(a => a.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToListAsync();

                // Top specializations
                var topSpecializations = await _context.Appointments
                    .Include(a => a.Doctor)
                    .GroupBy(a => a.Doctor.Specialization)
                    .Select(g => new SpecializationStatViewModel
                    {
                        Specialization = g.Key,
                        AppointmentCount = g.Count()
                    })
                    .OrderByDescending(s => s.AppointmentCount)
                    .Take(5)
                    .ToListAsync();

                // AI prediction accuracy (confirmed vs total)
                var totalConsultationsWithAI = await _context.ConsultationRecords
                    .Where(c => c.AIPredictionId != null)
                    .CountAsync();
                var confirmedAIPredictions = await _context.ConsultationRecords
                    .Where(c => c.AIPredictionId != null && c.AIDiagnosisConfirmed)
                    .CountAsync();
                decimal aiAccuracy = totalConsultationsWithAI > 0
                    ? (decimal)confirmedAIPredictions / totalConsultationsWithAI * 100
                    : 0;

                // Recent activity (last 7 days chart data)
                var activityData = new List<DailyActivityViewModel>();
                for (int i = 6; i >= 0; i--)
                {
                    var date = now.Date.AddDays(-i);
                    var nextDate = date.AddDays(1);

                    var dayAppointments = await _context.Appointments
                        .CountAsync(a => a.CreatedAt >= date && a.CreatedAt < nextDate);
                    var dayPredictions = await _context.AIPredictions
                        .CountAsync(a => a.CreatedAt >= date && a.CreatedAt < nextDate);

                    activityData.Add(new DailyActivityViewModel
                    {
                        Date = date,
                        AppointmentCount = dayAppointments,
                        PredictionCount = dayPredictions
                    });
                }

                var analytics = new AdminAnalyticsViewModel
                {
                    TotalPatients = totalPatients,
                    TotalDoctors = totalDoctors,
                    PendingDoctorApprovals = pendingApprovals,
                    TotalAppointments = totalAppointments,
                    TotalConsultations = totalConsultations,
                    TotalPredictions = totalPredictions,
                    RecentPatients = recentPatients,
                    RecentDoctors = recentDoctors,
                    RecentAppointments = recentAppointments,
                    RecentConsultations = recentConsultations,
                    PatientGrowthRate = patientGrowthRate,
                    DoctorGrowthRate = doctorGrowthRate,
                    AppointmentGrowthRate = appointmentGrowthRate,
                    PendingAppointments = appointmentStats.FirstOrDefault(s => s.Status == AppointmentStatus.Scheduled)?.Count ?? 0,
                    CompletedAppointments = appointmentStats.FirstOrDefault(s => s.Status == AppointmentStatus.Completed)?.Count ?? 0,
                    CancelledAppointments = appointmentStats.FirstOrDefault(s => s.Status == AppointmentStatus.Cancelled)?.Count ?? 0,
                    TopSpecializations = topSpecializations,
                    AIPredictionAccuracy = aiAccuracy,
                    DailyActivity = activityData
                };

                return Ok(new ApiResponse<AdminAnalyticsViewModel>
                {
                    Success = true,
                    Message = "Analytics retrieved successfully",
                    Data = analytics
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving admin analytics");
                return StatusCode(500, new ApiResponse<AdminAnalyticsViewModel>
                {
                    Success = false,
                    Message = "An error occurred while retrieving analytics"
                });
            }
        }

        private decimal CalculateGrowthRate(int previous, int current)
        {
            if (previous == 0)
            {
                return current > 0 ? 100 : 0;
            }
            return ((decimal)(current - previous) / previous) * 100;
        }
    }
}
