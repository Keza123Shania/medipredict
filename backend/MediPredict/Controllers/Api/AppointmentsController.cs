using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediPredict.Data.DatabaseContext;
using MediPredict.Services.Interfaces;
using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;
using MediPredict.Data.Enums;
using MediPredict.Helpers;
using System.Text.Json;
using MediPredict.Attributes;

namespace MediPredict.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAppointmentService _appointmentService;
        private readonly ILogger<AppointmentsController> _logger;
        private readonly MediPredict.Services.IEmailService _emailService;

        public AppointmentsController(
            ApplicationDbContext context,
            IAppointmentService appointmentService,
            ILogger<AppointmentsController> logger,
            MediPredict.Services.IEmailService emailService)
        {
            _context = context;
            _appointmentService = appointmentService;
            _logger = logger;
            _emailService = emailService;
        }

        [HttpGet]
        [RequirePermission("ViewAppointments", "ViewOwnAppointments")]
        public async Task<ActionResult<ApiResponse<object>>> GetAppointments(
            [FromQuery] string userId,
            [FromQuery] string? role,
            [FromQuery] string? status)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "UserId is required"
                    });
                }

                var query = _context.Appointments
                    .Include(a => a.Patient)
                        .ThenInclude(p => p.User)
                    .Include(a => a.Doctor)
                        .ThenInclude(d => d.User)
                    .AsQueryable();

                _logger.LogInformation("GetAppointments called - UserId: {UserId}, Role: {Role}", userId, role);

                // Filter by role (case-insensitive comparison)
                if (!string.IsNullOrEmpty(role) && role.Equals("Patient", StringComparison.OrdinalIgnoreCase))
                {
                    var userGuid = Guid.Parse(userId);
                    var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userGuid);
                    _logger.LogInformation("Patient lookup - UserGuid: {UserGuid}, Patient found: {PatientFound}, PatientId: {PatientId}", 
                        userGuid, patient != null, patient?.Id);
                    
                    if (patient != null)
                    {
                        query = query.Where(a => a.PatientId == patient.Id);
                    }
                    else
                    {
                        // No patient found, return empty list
                        return Ok(new ApiResponse<object>
                        {
                            Success = true,
                            Message = "No appointments found",
                            Data = new
                            {
                                appointments = new List<AppointmentItemViewModel>(),
                                doctors = new List<object>()
                            }
                        });
                    }
                }
                else if (!string.IsNullOrEmpty(role) && role.Equals("Doctor", StringComparison.OrdinalIgnoreCase))
                {
                    var userGuid = Guid.Parse(userId);
                    var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userGuid);
                    if (doctor != null)
                    {
                        query = query.Where(a => a.DoctorId == doctor.Id);
                    }
                }

                // Apply status filter
                if (!string.IsNullOrEmpty(status) && status != "all")
                {
                    var statusEnum = EnumHelper.ToAppointmentStatus(status);
                    query = query.Where(a => a.Status == statusEnum);
                }

                var appointments = await query
                    .OrderByDescending(a => a.AppointmentDate)
                    .ToListAsync();

                var appointmentsList = appointments.Select(a => new AppointmentItemViewModel
                {
                    AppointmentId = a.Id,
                    PatientName = $"{a.Patient.User.FirstName} {a.Patient.User.LastName}",
                    DoctorName = $"Dr. {a.Doctor.User.FirstName} {a.Doctor.User.LastName}",
                    DoctorId = a.DoctorId,
                    DoctorSpecialization = a.Doctor.Specialization,
                    DoctorProfilePicture = a.Doctor.User.ProfilePicture,
                    AppointmentDate = a.AppointmentDate,
                    AppointmentTime = a.AppointmentDate.ToString("HH:mm"),
                    TimeSlot = a.AppointmentDate.ToString("hh:mm tt"),
                    DurationMinutes = a.DurationMinutes,
                    Status = EnumHelper.FromAppointmentStatus(a.Status),
                    ReasonForVisit = a.ReasonForVisit ?? "",
                    ConsultationFee = a.Doctor.ConsultationFee,
                    ConfirmationNumber = a.ConfirmationNumber
                }).ToList();

                // Get verified doctors for booking modal
                var doctors = await _context.Doctors
                    .Include(d => d.User)
                    .Where(d => d.IsVerified && d.User.IsActive)
                    .OrderBy(d => d.Specialization)
                    .ThenBy(d => d.User.LastName)
                    .Select(d => new
                    {
                        id = d.Id,
                        firstName = d.User.FirstName,
                        lastName = d.User.LastName,
                        specialization = d.Specialization,
                        experience = d.Experience,
                        consultationFee = d.ConsultationFee,
                        profilePicture = d.User.ProfilePicture
                    })
                    .ToListAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Appointments retrieved successfully",
                    Data = new
                    {
                        appointments = appointmentsList,
                        doctors
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appointments");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving appointments"
                });
            }
        }

        [HttpGet("{id}")]
        [RequirePermission("ViewAppointments")]
        public async Task<ActionResult<ApiResponse<object>>> GetAppointment(Guid id, [FromQuery] string userId)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                        .ThenInclude(p => p.User)
                    .Include(a => a.Doctor)
                        .ThenInclude(d => d.User)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Appointment retrieved successfully",
                    Data = new
                    {
                        id = appointment.Id,
                        patientName = $"{appointment.Patient.User.FirstName} {appointment.Patient.User.LastName}",
                        doctorName = $"Dr. {appointment.Doctor.User.FirstName} {appointment.Doctor.User.LastName}",
                        doctorSpecialization = appointment.Doctor.Specialization,
                        appointmentDate = appointment.AppointmentDate,
                        durationMinutes = appointment.DurationMinutes,
                        status = EnumHelper.FromAppointmentStatus(appointment.Status),
                        reasonForVisit = appointment.ReasonForVisit,
                        notes = appointment.Notes,
                        confirmationNumber = appointment.ConfirmationNumber
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appointment {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving appointment"
                });
            }
        }

        [HttpPost("CreateAppointment")]
        [RequirePermission("CreateAppointment")]
        public async Task<ActionResult<ApiResponse<object>>> CreateAppointment([FromBody] BookAppointmentRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.ReasonForVisit))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Please provide a reason for your visit"
                    });
                }

                var userGuid = Guid.Parse(request.UserId);
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userGuid);
                if (patient == null)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Patient profile not found"
                    });
                }

                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.Id == request.DoctorId && d.IsVerified && d.User.IsActive);

                if (doctor == null)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Selected doctor is not available"
                    });
                }

                // Parse date and time
                if (!DateTime.TryParse($"{request.AppointmentDate} {request.AppointmentTime}", out DateTime appointmentDateTime))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Invalid appointment date or time"
                    });
                }

                // Check if appointment is in the past
                if (appointmentDateTime < DateTime.Now)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Cannot book appointments in the past"
                    });
                }

                // Check if patient already has an appointment with this doctor
                var hasExistingAppointment = await _context.Appointments
                    .AnyAsync(a => a.PatientId == patient.Id &&
                                  a.DoctorId == request.DoctorId &&
                                  (a.Status == AppointmentStatus.Scheduled || a.Status == AppointmentStatus.Confirmed) &&
                                  a.AppointmentDate >= DateTime.Now);

                if (hasExistingAppointment)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "You already have a scheduled appointment with this doctor. Please wait until your current appointment is completed before booking again."
                    });
                }

                // Check for conflicting appointments
                var hasConflict = await _context.Appointments
                    .AnyAsync(a => a.DoctorId == request.DoctorId &&
                                  a.AppointmentDate == appointmentDateTime &&
                                  a.Status == AppointmentStatus.Scheduled);

                if (hasConflict)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "This time slot is already booked. Please select another time."
                    });
                }

                // Create appointment
                var confirmationNumber = $"APT-{DateTime.Now:yyyyMMddHHmmss}-{new Random().Next(1000, 9999)}";
                
                var appointment = new Appointment
                {
                    PatientId = patient.Id,
                    DoctorId = request.DoctorId,
                    SymptomEntryId = request.SymptomEntryId,
                    AppointmentDate = appointmentDateTime,
                    ScheduledDate = DateTime.Now,
                    DurationMinutes = request.DurationMinutes,
                    Status = AppointmentStatus.Scheduled,
                    ReasonForVisit = request.ReasonForVisit,
                    Notes = request.AdditionalNotes,
                    ConfirmationNumber = confirmationNumber,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                // Send confirmation email
                try
                {
                    var patientUser = await _context.Users.FindAsync(userGuid);
                    if (patientUser != null)
                    {
                        await _emailService.SendAppointmentConfirmationEmailAsync(
                            patientUser.Email,
                            patientUser.FullName,
                            $"Dr. {doctor.User.FirstName} {doctor.User.LastName}",
                            appointmentDateTime,
                            appointmentDateTime.ToString("hh:mm tt"),
                            confirmationNumber,
                            request.ReasonForVisit ?? "General consultation"
                        );

                        // TODO: Add NotificationLog entry for email tracking
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Failed to send confirmation email for appointment {Id}", appointment.Id);
                }

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Appointment booked successfully",
                    Data = new
                    {
                        appointmentId = appointment.Id,
                        confirmationNumber = appointment.ConfirmationNumber,
                        appointmentDate = appointment.AppointmentDate
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while booking the appointment"
                });
            }
        }

        [HttpPut("{id}/cancel")]
        [RequirePermission("CancelAppointment")]
        public async Task<ActionResult<ApiResponse>> CancelAppointment(Guid id, [FromQuery] string userId)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                // Check if user has permission to cancel
                var userGuid = Guid.Parse(userId);
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userGuid);
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userGuid);

                if (patient?.Id != appointment.PatientId && doctor?.Id != appointment.DoctorId)
                {
                    return Forbid();
                }

                if (appointment.Status == AppointmentStatus.Cancelled)
                {
                    return BadRequest(new ApiResponse
                    {
                        Success = false,
                        Message = "Appointment is already cancelled"
                    });
                }

                // Check 24-hour cancellation policy
                var hoursUntilAppointment = (appointment.AppointmentDate - DateTime.Now).TotalHours;
                if (hoursUntilAppointment < 24)
                {
                    return BadRequest(new ApiResponse
                    {
                        Success = false,
                        Message = "Appointments can only be cancelled at least 24 hours in advance"
                    });
                }

                appointment.Status = AppointmentStatus.Cancelled;
                appointment.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse
                {
                    Success = true,
                    Message = "Appointment cancelled successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling appointment {Id}", id);
                return StatusCode(500, new ApiResponse
                {
                    Success = false,
                    Message = "An error occurred while cancelling the appointment"
                });
            }
        }

        [HttpPut("{id}/reschedule")]
        [RequirePermission("RescheduleAppointment")]
        public async Task<ActionResult<ApiResponse<object>>> RescheduleAppointment(Guid id, [FromBody] RescheduleAppointmentRequest request)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Success = false,
                        Message = "Appointment not found"
                    });
                }

                // Check if user has permission to reschedule
                var userGuid = Guid.Parse(request.UserId);
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userGuid);
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userGuid);

                if (patient?.Id != appointment.PatientId && doctor?.Id != appointment.DoctorId)
                {
                    return Forbid();
                }

                if (appointment.Status == AppointmentStatus.Cancelled)
                {
                    return BadRequest(new ApiResponse
                    {
                        Success = false,
                        Message = "Cannot reschedule a cancelled appointment"
                    });
                }

                if (appointment.Status == AppointmentStatus.Completed)
                {
                    return BadRequest(new ApiResponse
                    {
                        Success = false,
                        Message = "Cannot reschedule a completed appointment"
                    });
                }

                // Check 24-hour rescheduling policy
                var hoursUntilAppointment = (appointment.AppointmentDate - DateTime.Now).TotalHours;
                if (hoursUntilAppointment < 24)
                {
                    return BadRequest(new ApiResponse
                    {
                        Success = false,
                        Message = "Appointments can only be rescheduled at least 24 hours in advance"
                    });
                }

                // Parse new date and time
                if (!DateTime.TryParse(request.NewAppointmentDate, out var newDate))
                {
                    return BadRequest(new ApiResponse
                    {
                        Success = false,
                        Message = "Invalid appointment date format"
                    });
                }

                if (!DateTime.TryParse(request.NewAppointmentTime, out var newTime))
                {
                    return BadRequest(new ApiResponse
                    {
                        Success = false,
                        Message = "Invalid appointment time format"
                    });
                }

                var newAppointmentDateTime = newDate.Date.Add(newTime.TimeOfDay);

                // Validate new date is not in the past
                if (newAppointmentDateTime <= DateTime.Now)
                {
                    return BadRequest(new ApiResponse
                    {
                        Success = false,
                        Message = "Cannot reschedule to a past date and time"
                    });
                }

                // Check if doctor is available at new time
                var doctor_profile = await _context.Doctors.FindAsync(appointment.DoctorId);
                if (doctor_profile == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Success = false,
                        Message = "Doctor not found"
                    });
                }

                // Check for conflicts at new time
                var hasConflict = await _context.Appointments
                    .AnyAsync(a => a.DoctorId == appointment.DoctorId &&
                                 a.Id != id && // Exclude current appointment
                                 (a.Status == AppointmentStatus.Scheduled || a.Status == AppointmentStatus.Confirmed) &&
                                 a.AppointmentDate == newAppointmentDateTime);

                if (hasConflict)
                {
                    return BadRequest(new ApiResponse
                    {
                        Success = false,
                        Message = "The selected time slot is no longer available"
                    });
                }

                // Update appointment
                appointment.AppointmentDate = newAppointmentDateTime;
                appointment.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Appointment rescheduled successfully",
                    Data = new
                    {
                        appointmentId = appointment.Id,
                        newAppointmentDate = appointment.AppointmentDate
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rescheduling appointment {Id}", id);
                return StatusCode(500, new ApiResponse
                {
                    Success = false,
                    Message = "An error occurred while rescheduling the appointment"
                });
            }
        }
    }

    public class BookAppointmentRequest
    {
        public string UserId { get; set; } = string.Empty;
        public Guid DoctorId { get; set; }
        public string AppointmentDate { get; set; } = string.Empty;
        public string AppointmentTime { get; set; } = string.Empty;
        public string ReasonForVisit { get; set; } = string.Empty;
        public string? AdditionalNotes { get; set; }
        public int DurationMinutes { get; set; } = 30;
        public Guid? SymptomEntryId { get; set; }
    }

    public class RescheduleAppointmentRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string NewAppointmentDate { get; set; } = string.Empty;
        public string NewAppointmentTime { get; set; } = string.Empty;
    }
}