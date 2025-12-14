using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediPredict.Data.DatabaseContext;
using MediPredict.Services.Interfaces;
using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;
using MediPredict.Data.Enums;
using MediPredict.Helpers;
using MediPredict.Attributes;

namespace MediPredict.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDoctorService _doctorService;
        private readonly ILogger<DoctorsController> _logger;

        public DoctorsController(ApplicationDbContext context, IDoctorService doctorService, ILogger<DoctorsController> logger)
        {
            _context = context;
            _doctorService = doctorService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<object>>> GetDoctors(
            [FromQuery] string? specialization = null,
            [FromQuery] string? name = null,
            [FromQuery] bool? isVerified = null,
            [FromQuery] bool includeUnverified = false,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            try
            {
                var query = _context.Doctors
                    .Include(d => d.User)
                    .Where(d => d.User.IsActive)
                    .AsQueryable();

                // For non-admin users, only show verified doctors
                if (!includeUnverified)
                {
                    query = query.Where(d => d.IsVerified);
                }

                // Apply filters
                if (!string.IsNullOrEmpty(specialization))
                {
                    query = query.Where(d => d.Specialization.Contains(specialization));
                }

                if (!string.IsNullOrEmpty(name))
                {
                    query = query.Where(d => d.User.FirstName.Contains(name) || d.User.LastName.Contains(name));
                }

                if (isVerified.HasValue)
                {
                    query = query.Where(d => d.IsVerified == isVerified.Value);
                }

                var totalCount = await query.CountAsync();

                var doctors = await query
                    .OrderBy(d => d.Specialization)
                    .ThenBy(d => d.User.LastName)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var doctorProfiles = doctors.Select(d => new DoctorProfileViewModel
                {
                    DoctorId = d.Id,
                    UserId = d.UserId.ToString(),
                    FullName = $"{d.User.FirstName} {d.User.LastName}",
                    Email = d.User.Email,
                    PhoneNumber = d.User.PhoneNumber ?? "",
                    Specialization = d.Specialization,
                    Qualifications = d.Qualifications,
                    ProfessionalTitle = d.ProfessionalTitle,
                    EducationTraining = d.EducationTraining,
                    BoardCertifications = d.BoardCertifications,
                    Experience = d.Experience,
                    LicenseNumber = d.LicenseNumber,
                    LicenseState = d.LicenseState,
                    LicenseIssueDate = d.LicenseIssueDate,
                    LicenseExpiryDate = d.LicenseExpiryDate,
                    NpiNumber = d.NpiNumber,
                    IsVerified = d.IsVerified,
                    ConsultationFee = d.ConsultationFee,
                    Bio = d.Bio,
                    Address = d.User.Address,
                    ProfilePicture = d.User.ProfilePicture,
                    AvailableDays = string.IsNullOrEmpty(d.AvailableDays)
                        ? new List<string>()
                        : d.AvailableDays.Split(',').Select(day => day.Trim()).ToList(),
                    AvailableTimeStart = d.AvailableTimeStart?.ToString(@"hh\:mm"),
                    AvailableTimeEnd = d.AvailableTimeEnd?.ToString(@"hh\:mm"),
                    AverageRating = 4.5,
                    TotalReviews = 0,
                    TotalPatients = _context.Appointments.Where(a => a.DoctorId == d.Id).Select(a => a.PatientId).Distinct().Count(),
                    CompletedConsultations = _context.Appointments.Count(a => a.DoctorId == d.Id && a.Status == AppointmentStatus.Completed)
                }).ToList();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Doctors retrieved successfully",
                    Data = new
                    {
                        doctors = doctorProfiles,
                        totalCount,
                        currentPage = page,
                        pageSize,
                        totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctors");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving doctors"
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<DoctorProfileViewModel>>> GetDoctor(Guid id)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (doctor == null)
                {
                    return NotFound(new ApiResponse<DoctorProfileViewModel>
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                var profile = new DoctorProfileViewModel
                {
                    DoctorId = doctor.Id,
                    UserId = doctor.UserId.ToString(),
                    FullName = $"{doctor.User.FirstName} {doctor.User.LastName}",
                    Email = doctor.User.Email,
                    PhoneNumber = doctor.User.PhoneNumber ?? "",
                    Specialization = doctor.Specialization,
                    Qualifications = doctor.Qualifications,
                    ProfessionalTitle = doctor.ProfessionalTitle,
                    EducationTraining = doctor.EducationTraining,
                    BoardCertifications = doctor.BoardCertifications,
                    Experience = doctor.Experience,
                    LicenseNumber = doctor.LicenseNumber,
                    LicenseState = doctor.LicenseState,
                    LicenseIssueDate = doctor.LicenseIssueDate,
                    LicenseExpiryDate = doctor.LicenseExpiryDate,
                    NpiNumber = doctor.NpiNumber,
                    IsVerified = doctor.IsVerified,
                    ConsultationFee = doctor.ConsultationFee,
                    Bio = doctor.Bio,
                    Address = doctor.User.Address,
                    ProfilePicture = doctor.User.ProfilePicture,
                    AvailableDays = string.IsNullOrEmpty(doctor.AvailableDays)
                        ? new List<string>()
                        : doctor.AvailableDays.Split(',').Select(day => day.Trim()).ToList(),
                    AvailableTimeStart = doctor.AvailableTimeStart?.ToString(@"hh\:mm"),
                    AvailableTimeEnd = doctor.AvailableTimeEnd?.ToString(@"hh\:mm"),
                    AverageRating = 4.5,
                    TotalReviews = 0,
                    TotalPatients = await _context.Appointments.Where(a => a.DoctorId == id).Select(a => a.PatientId).Distinct().CountAsync(),
                    CompletedConsultations = await _context.Appointments.CountAsync(a => a.DoctorId == id && a.Status == AppointmentStatus.Completed)
                };

                return Ok(new ApiResponse<DoctorProfileViewModel>
                {
                    Success = true,
                    Message = "Doctor retrieved successfully",
                    Data = profile
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctor {Id}", id);
                return StatusCode(500, new ApiResponse<DoctorProfileViewModel>
                {
                    Success = false,
                    Message = "An error occurred while retrieving doctor"
                });
            }
        }

        [HttpGet("specializations")]
        public async Task<ActionResult<ApiResponse<List<string>>>> GetSpecializations()
        {
            try
            {
                var specializations = await _context.Doctors
                    .Where(d => d.IsVerified)
                    .Select(d => d.Specialization)
                    .Distinct()
                    .OrderBy(s => s)
                    .ToListAsync();

                return Ok(new ApiResponse<List<string>>
                {
                    Success = true,
                    Message = "Specializations retrieved successfully",
                    Data = specializations
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving specializations");
                return StatusCode(500, new ApiResponse<List<string>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving specializations"
                });
            }
        }

        [HttpGet("{doctorId}/available-slots")]
        public async Task<ActionResult<ApiResponse<List<TimeSlotViewModel>>>> GetAvailableTimeSlots(Guid doctorId, [FromQuery] string date)
        {
            try
            {
                if (!DateTime.TryParse(date, out DateTime appointmentDate))
                {
                    return BadRequest(new ApiResponse<List<TimeSlotViewModel>>
                    {
                        Success = false,
                        Message = "Invalid date format"
                    });
                }

                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == doctorId && d.IsVerified && d.User.IsActive);

                if (doctor == null)
                {
                    return NotFound(new ApiResponse<List<TimeSlotViewModel>>
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                // Check if the date is a valid working day for the doctor
                var dayOfWeek = appointmentDate.DayOfWeek.ToString();
                var availableDays = doctor.AvailableDays?.Split(',').Select(d => d.Trim()).ToList() ?? new List<string>();
                
                if (!availableDays.Contains(dayOfWeek))
                {
                    return Ok(new ApiResponse<List<TimeSlotViewModel>>
                    {
                        Success = true,
                        Message = "Doctor not available on this day",
                        Data = new List<TimeSlotViewModel>()
                    });
                }

                // Get existing appointments for this doctor on this date
                var existingAppointments = await _context.Appointments
                    .Where(a => a.DoctorId == doctorId && 
                                a.AppointmentDate.Date == appointmentDate.Date &&
                                (a.Status == AppointmentStatus.Scheduled || a.Status == AppointmentStatus.Confirmed))
                    .Select(a => a.AppointmentDate)
                    .ToListAsync();

                // Generate 30-minute time slots
                var slots = new List<TimeSlotViewModel>();
                var startTime = doctor.AvailableTimeStart ?? new TimeSpan(9, 0, 0);
                var endTime = doctor.AvailableTimeEnd ?? new TimeSpan(17, 0, 0);
                
                // Lunch break: 12:30 PM to 2:00 PM
                var lunchStart = new TimeSpan(12, 30, 0);
                var lunchEnd = new TimeSpan(14, 0, 0);

                var current = startTime;
                while (current < endTime)
                {
                    // Skip lunch break
                    if (current >= lunchStart && current < lunchEnd)
                    {
                        current = current.Add(TimeSpan.FromMinutes(30));
                        continue;
                    }

                    var slotDateTime = appointmentDate.Date.Add(current);
                    
                    // Check if this slot is already booked
                    var isBooked = existingAppointments.Any(a => 
                        Math.Abs((a - slotDateTime).TotalMinutes) < 30);

                    // Don't include past time slots for today
                    var isPast = appointmentDate.Date == DateTime.Now.Date && slotDateTime < DateTime.Now;

                    if (!isPast)
                    {
                        slots.Add(new TimeSlotViewModel
                        {
                            StartTime = current.ToString(@"hh\:mm"),
                            EndTime = current.Add(TimeSpan.FromMinutes(30)).ToString(@"hh\:mm"),
                            IsAvailable = !isBooked,
                            DateTime = slotDateTime.ToString("yyyy-MM-ddTHH:mm:ss")
                        });
                    }

                    current = current.Add(TimeSpan.FromMinutes(30));
                }

                return Ok(new ApiResponse<List<TimeSlotViewModel>>
                {
                    Success = true,
                    Message = "Available time slots retrieved successfully",
                    Data = slots
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available time slots for doctor {DoctorId} on {Date}", doctorId, date);
                return StatusCode(500, new ApiResponse<List<TimeSlotViewModel>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving available time slots"
                });
            }
        }
    }
}