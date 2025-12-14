using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediPredict.Attributes;
using MediPredict.Data.DatabaseContext;
using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;
using MediPredict.Data.Enums;
using MediPredict.Helpers;
using MediPredict.Services.Interfaces;
using System.Text.Json;

namespace MediPredict.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ICustomAuthService _authService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(ApplicationDbContext context, ICustomAuthService authService, ILogger<DashboardController> logger)
        {
            _context = context;
            _authService = authService;
            _logger = logger;
        }

        [HttpGet("patient/{userId}")]
        [RequirePermission("ViewPatients")]
        public async Task<ActionResult<ApiResponse<object>>> GetPatientDashboard(string userId)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var user = await _authService.GetUserByIdAsync(userGuid);
                if (user == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Patient not found"
                    });
                }

                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userGuid);
                if (patient == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Patient profile not found"
                    });
                }

                // Get upcoming appointments
                var appointments = await _context.Appointments
                    .Include(a => a.Doctor)
                        .ThenInclude(d => d.User)
                    .Where(a => a.PatientId == patient.Id && 
                               a.AppointmentDate >= DateTime.Now &&
                               a.Status != AppointmentStatus.Cancelled)
                    .OrderBy(a => a.AppointmentDate)
                    .Take(5)
                    .ToListAsync();

                var upcomingAppointments = appointments.Select(a => new AppointmentViewModel
                {
                    Id = a.Id,
                    DoctorName = $"Dr. {a.Doctor.User.FirstName} {a.Doctor.User.LastName}",
                    DoctorSpecialization = a.Doctor.Specialization,
                    AppointmentDate = a.AppointmentDate,
                    Status = EnumHelper.FromAppointmentStatus(a.Status),
                    ReasonForVisit = a.ReasonForVisit,
                    ConfirmationNumber = a.ConfirmationNumber
                }).ToList();

                // Get recent predictions
                var predictions = await _context.SymptomEntries
                    .Include(s => s.AIPredictions)
                        .ThenInclude(ap => ap.Disease)
                    .Where(s => s.PatientId == patient.Id)
                    .OrderByDescending(s => s.CreatedAt)
                    .Take(5)
                    .ToListAsync();

                var recentPredictions = predictions.Select(p =>
                {
                    var topPrediction = p.AIPredictions.OrderByDescending(ap => ap.Probability).FirstOrDefault();
                    return new
                    {
                        id = p.Id,
                        createdAt = p.CreatedAt,
                        predictedDisease = topPrediction?.Disease?.Name ?? "Unknown",
                        confidence = (double)(topPrediction?.Probability ?? 0),
                        symptomsCount = p.Symptoms?.Count ?? 0
                    };
                }).ToList();

                // Calculate statistics
                var totalAppointments = await _context.Appointments.CountAsync(a => a.PatientId == patient.Id);
                var completedAppointments = await _context.Appointments.CountAsync(a => a.PatientId == patient.Id && a.Status == AppointmentStatus.Completed);
                var totalPredictions = await _context.SymptomEntries.CountAsync(s => s.PatientId == patient.Id);

                var statistics = new
                {
                    totalAppointments,
                    upcomingAppointments = upcomingAppointments.Count,
                    completedAppointments,
                    totalPredictions
                };

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Patient dashboard data retrieved successfully",
                    Data = new
                    {
                        user,
                        upcomingAppointments,
                        recentPredictions,
                        statistics
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading patient dashboard for user {UserId}", userId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while loading dashboard"
                });
            }
        }

        [HttpGet("doctor/{userId}")]
        [RequirePermission("ViewDoctors")]
        public async Task<ActionResult<ApiResponse<object>>> GetDoctorDashboard(string userId)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var user = await _authService.GetUserByIdAsync(userGuid);
                if (user == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }
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

                var today = DateTime.Today;

                // Get statistics
                var todayAppointments = await _context.Appointments
                    .CountAsync(a => a.DoctorId == doctor.Id && 
                                    a.AppointmentDate.Date == today &&
                                    a.Status == AppointmentStatus.Scheduled);

                var totalPatients = await _context.Appointments
                    .Where(a => a.DoctorId == doctor.Id)
                    .Select(a => a.PatientId)
                    .Distinct()
                    .CountAsync();

                var completedAppointments = await _context.Appointments
                    .CountAsync(a => a.DoctorId == doctor.Id && a.Status == AppointmentStatus.Completed);

                var upcomingAppointmentsCount = await _context.Appointments
                    .CountAsync(a => a.DoctorId == doctor.Id && 
                                    a.AppointmentDate > DateTime.Now &&
                                    a.Status == AppointmentStatus.Scheduled);

                // Get today's appointments
                var todayAppts = await _context.Appointments
                    .Include(a => a.Patient)
                        .ThenInclude(p => p.User)
                    .Where(a => a.DoctorId == doctor.Id && 
                               a.AppointmentDate.Date == today &&
                               a.Status != AppointmentStatus.Cancelled)
                    .OrderBy(a => a.AppointmentDate)
                    .ToListAsync();

                var todayAppointmentsList = todayAppts.Select(a => new
                {
                    appointmentId = a.Id,
                    patientName = $"{a.Patient.User.FirstName} {a.Patient.User.LastName}",
                    appointmentDate = a.AppointmentDate,
                    reasonForVisit = a.ReasonForVisit ?? "General consultation",
                    status = EnumHelper.FromAppointmentStatus(a.Status)
                }).ToList();

                // Get upcoming appointments
                var upcomingAppts = await _context.Appointments
                    .Include(a => a.Patient)
                        .ThenInclude(p => p.User)
                    .Where(a => a.DoctorId == doctor.Id && 
                               a.AppointmentDate > DateTime.Now &&
                               a.Status == AppointmentStatus.Scheduled)
                    .OrderBy(a => a.AppointmentDate)
                    .Take(10)
                    .ToListAsync();

                var upcomingAppointmentsList = upcomingAppts.Select(a => new
                {
                    appointmentId = a.Id,
                    patientName = $"{a.Patient.User.FirstName} {a.Patient.User.LastName}",
                    appointmentDate = a.AppointmentDate,
                    reasonForVisit = a.ReasonForVisit ?? "General consultation",
                    status = a.Status
                }).ToList();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Doctor dashboard data retrieved successfully",
                    Data = new
                    {
                        doctorName = $"{doctor.User.FirstName} {doctor.User.LastName}",
                        specialization = doctor.Specialization,
                        isVerified = doctor.IsVerified,
                        statistics = new
                        {
                            todayAppointments,
                            totalPatients,
                            completedAppointments,
                            upcomingAppointments = upcomingAppointmentsCount
                        },
                        todayAppointmentsList,
                        upcomingAppointmentsList
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading doctor dashboard for user {UserId}", userId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while loading dashboard"
                });
            }
        }

        [HttpGet("admin")]
        public async Task<ActionResult<ApiResponse<AdminDashboardViewModel>>> GetAdminDashboard()
        {
            try
            {
                var dashboard = new AdminDashboardViewModel();
                var today = DateTime.Today;
                var lastMonth = today.AddMonths(-1);
                var currentMonthStart = new DateTime(today.Year, today.Month, 1);

                // Calculate system statistics
                var totalPatients = await _context.Patients.CountAsync();
                var totalDoctors = await _context.Doctors.CountAsync();
                var totalAppointments = await _context.Appointments.CountAsync();
                var totalPredictions = await _context.SymptomEntries.CountAsync();

                // Last month counts for growth rate
                var patientsLastMonth = await _context.Patients.CountAsync(p => p.CreatedAt < lastMonth);
                var doctorsLastMonth = await _context.Doctors.CountAsync(d => d.CreatedAt < lastMonth);
                var appointmentsLastMonth = await _context.Appointments.CountAsync(a => a.CreatedAt < lastMonth);

                dashboard.Statistics = new SystemStatistics
                {
                    TotalPatients = totalPatients,
                    TotalDoctors = totalDoctors,
                    TotalAppointments = totalAppointments,
                    TotalPredictions = totalPredictions,
                    ActivePatients = await _context.Patients.CountAsync(p => p.User.IsActive),
                    VerifiedDoctors = await _context.Doctors.CountAsync(d => d.IsVerified),
                    UpcomingAppointments = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Scheduled && a.AppointmentDate > DateTime.Now),
                    TodayAppointments = await _context.Appointments.CountAsync(a => a.AppointmentDate.Date == today),
                    PendingDoctorApprovals = await _context.Doctors.CountAsync(d => !d.IsVerified),
                    PatientGrowthRate = CalculateGrowthRate(patientsLastMonth, totalPatients),
                    DoctorGrowthRate = CalculateGrowthRate(doctorsLastMonth, totalDoctors),
                    AppointmentGrowthRate = CalculateGrowthRate(appointmentsLastMonth, totalAppointments),
                    TotalRevenue = totalAppointments * 50m,
                    MonthlyRevenue = await _context.Appointments.CountAsync(a => a.CreatedAt >= currentMonthStart) * 50m,
                    RevenueGrowthRate = 15.5
                };

                // Pending approvals
                var pendingDoctors = await _context.Doctors
                    .Include(d => d.User)
                    .Where(d => !d.IsVerified)
                    .OrderByDescending(d => d.CreatedAt)
                    .Take(5)
                    .ToListAsync();

                dashboard.PendingApprovals = pendingDoctors.Select(d => new PendingApprovalItem
                {
                    Id = d.Id,
                    Type = "doctor",
                    Title = $"Dr. {d.User.FirstName} {d.User.LastName}",
                    Description = $"{d.Specialization} - {d.LicenseNumber}",
                    SubmittedDate = d.CreatedAt,
                    Priority = 2
                }).ToList();

                // Top doctors
                var topDoctors = await _context.Doctors
                    .Include(d => d.User)
                    .Where(d => d.IsVerified)
                    .OrderByDescending(d => _context.Appointments.Count(a => a.DoctorId == d.Id))
                    .Take(5)
                    .ToListAsync();

                var topDoctorsList = new List<TopDoctorViewModel>();
                foreach (var d in topDoctors)
                {
                    topDoctorsList.Add(new TopDoctorViewModel
                    {
                        DoctorId = d.Id,
                        Name = $"Dr. {d.User.FirstName} {d.User.LastName}",
                        Specialization = d.Specialization,
                        Rating = 4.5,
                        TotalAppointments = await _context.Appointments.CountAsync(a => a.DoctorId == d.Id),
                        IsVerified = d.IsVerified
                    });
                }
                dashboard.TopDoctors = topDoctorsList;

                // Recent activities
                var recentAppointments = await _context.Appointments
                    .Include(a => a.Patient).ThenInclude(p => p.User)
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(8)
                    .ToListAsync();

                dashboard.RecentActivities = recentAppointments.Select(a => new RecentActivityItem
                {
                    Id = a.Id.ToString(),
                    ActivityType = "appointment",
                    Description = "New appointment scheduled",
                    UserName = $"{a.Patient.User.FirstName} {a.Patient.User.LastName}",
                    Timestamp = a.CreatedAt,
                    IconClass = "fas fa-calendar-check",
                    ColorClass = "bg-success"
                }).ToList();

                // Appointment trends
                dashboard.AppointmentTrends = new List<ChartDataPoint>();
                for (int i = 6; i >= 0; i--)
                {
                    var date = today.AddDays(-i);
                    var count = await _context.Appointments.CountAsync(a => a.AppointmentDate.Date == date);
                    dashboard.AppointmentTrends.Add(new ChartDataPoint
                    {
                        Label = date.ToString("MMM dd"),
                        Value = count
                    });
                }

                return Ok(new ApiResponse<AdminDashboardViewModel>
                {
                    Success = true,
                    Message = "Admin dashboard data retrieved successfully",
                    Data = dashboard
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading admin dashboard");
                return StatusCode(500, new ApiResponse<AdminDashboardViewModel>
                {
                    Success = false,
                    Message = "An error occurred while loading dashboard"
                });
            }
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

        private double CalculateGrowthRate(int oldValue, int newValue)
        {
            if (oldValue == 0) return newValue > 0 ? 100.0 : 0.0;
            return ((double)(newValue - oldValue) / oldValue) * 100.0;
        }
    }

    public class DashboardStatistics
    {
        public int TotalAppointments { get; set; }
        public int UpcomingAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int TotalPredictions { get; set; }
    }
}
