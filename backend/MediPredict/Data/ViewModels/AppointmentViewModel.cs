using System.ComponentModel.DataAnnotations;

namespace MediPredict.Data.ViewModels
{
    public class AppointmentBookingViewModel
    {
        [Required]
        public Guid DoctorId { get; set; }

        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public decimal ConsultationFee { get; set; }
        public DoctorProfileViewModel? DoctorProfile { get; set; }

        [Required(ErrorMessage = "Please select an appointment date")]
        [Display(Name = "Appointment Date")]
        public DateTime AppointmentDate { get; set; }

        [Required(ErrorMessage = "Please select a time slot")]
        [Display(Name = "Time Slot")]
        public string TimeSlot { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please specify the reason for visit")]
        [StringLength(500, ErrorMessage = "Reason cannot exceed 500 characters")]
        [Display(Name = "Reason for Visit")]
        public string ReasonForVisit { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Additional notes cannot exceed 1000 characters")]
        [Display(Name = "Additional Notes (Optional)")]
        public string? AdditionalNotes { get; set; }

        // If coming from prediction results
        public int? PredictionId { get; set; }
        public string? PredictedCondition { get; set; }
        public string? SymptomSummary { get; set; }

        // Available time slots for the selected date
        public List<TimeSlotViewModel> AvailableTimeSlots { get; set; } = new();

        // Duration options
        [Required]
        [Display(Name = "Appointment Duration")]
        public int DurationMinutes { get; set; } = 30;

        public List<int> DurationOptions { get; set; } = new() { 15, 30, 45, 60 };

        // Helper methods
        public string GetFormattedDate()
        {
            return AppointmentDate.ToString("dddd, MMMM dd, yyyy");
        }

        public string GetFormattedTimeSlot()
        {
            if (string.IsNullOrEmpty(TimeSlot)) return "";
            return TimeSlot;
        }

        public string GetTotalCostText()
        {
            return $"${ConsultationFee:F2}";
        }
    }

    public class TimeSlotViewModel
    {
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public string DateTime { get; set; } = string.Empty;
        
        // Legacy properties for backward compatibility
        public string Time => StartTime;
        public string DisplayText => $"{StartTime} - {EndTime}";
        public string CssClass => IsAvailable ? "available" : "unavailable";
    }

    public class AppointmentConfirmationViewModel
    {
        public int AppointmentId { get; set; }
        public string ConfirmationNumber { get; set; } = string.Empty;
        
        // Doctor details
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public string DoctorPhone { get; set; } = string.Empty;
        public string DoctorEmail { get; set; } = string.Empty;
        public string? DoctorAddress { get; set; }
        public DoctorProfileViewModel? DoctorProfile { get; set; }
        
        // Appointment details
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public string ReasonForVisit { get; set; } = string.Empty;
        public string? AdditionalNotes { get; set; }
        public string? PredictedCondition { get; set; }
        public decimal ConsultationFee { get; set; }
        public string Status { get; set; } = "Scheduled";
        
        // Booking metadata
        public DateTime BookingDate { get; set; }
        
        // Helper methods
        public string GetFormattedDate()
        {
            return AppointmentDate.ToString("dddd, MMMM dd, yyyy");
        }

        public string GetFormattedTime()
        {
            return TimeSlot;
        }

        public string GetEndTime()
        {
            if (TimeSpan.TryParse(TimeSlot, out TimeSpan startTime))
            {
                var endTime = startTime.Add(TimeSpan.FromMinutes(DurationMinutes));
                return endTime.ToString(@"hh\:mm\ tt");
            }
            return "";
        }

        public string GetDurationText()
        {
            return $"{DurationMinutes} minutes";
        }

        public string GetDurationDisplay()
        {
            if (DurationMinutes < 60)
                return $"{DurationMinutes} minutes";
            else
                return $"{DurationMinutes / 60} hour{(DurationMinutes > 60 ? "s" : "")}";
        }

        public string GetConsultationFeeText()
        {
            return $"${ConsultationFee:F2}";
        }

        public string GetCalendarFileName()
        {
            return $"appointment_{ConfirmationNumber}.ics";
        }

        public string GetCalendarDownloadUrl()
        {
            // Generate ICS calendar file content
            var icsContent = $@"BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MediPredict//Appointment//EN
BEGIN:VEVENT
UID:{ConfirmationNumber}@medipredict.com
DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}
DTSTART:{AppointmentDate:yyyyMMdd}T{TimeSlot.Replace(":", "").Replace(" AM", "").Replace(" PM", "")}00
DURATION:PT{DurationMinutes}M
SUMMARY:Medical Appointment with {DoctorName}
DESCRIPTION:Appointment for {ReasonForVisit}. Confirmation: {ConfirmationNumber}
LOCATION:{DoctorProfile?.ClinicAddress ?? ""}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR";
            
            // Return as data URL
            var base64 = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(icsContent));
            return $"data:text/calendar;base64,{base64}";
        }
    }

    public class AppointmentItemViewModel
    {
        public Guid AppointmentId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public Guid DoctorId { get; set; }
        public string DoctorSpecialization { get; set; } = string.Empty;
        public string? DoctorProfilePicture { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string AppointmentTime { get; set; } = string.Empty;
        public string TimeSlot { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ReasonForVisit { get; set; } = string.Empty;
        public decimal ConsultationFee { get; set; }
        public string ConfirmationNumber { get; set; } = string.Empty;
    }

    public class AppointmentListViewModel
    {
        public List<AppointmentItemViewModel> UpcomingAppointments { get; set; } = new();
        public List<AppointmentItemViewModel> PastAppointments { get; set; } = new();
        public int TotalUpcoming { get; set; }
        public int TotalPast { get; set; }
    }

    public class AppointmentDetailsViewModel
    {
        public Guid AppointmentId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public string? DoctorProfilePicture { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public string ReasonForVisit { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal ConsultationFee { get; set; }
        public string ConfirmationNumber { get; set; } = string.Empty;

        public string GetFormattedDate()
        {
            return AppointmentDate.ToString("MMM dd, yyyy");
        }

        public string GetFormattedTime()
        {
            return TimeSlot;
        }

        public string GetStatusBadgeClass()
        {
            return Status.ToLower() switch
            {
                "scheduled" => "badge bg-primary",
                "completed" => "badge bg-success",
                "cancelled" => "badge bg-danger",
                "noshow" => "badge bg-warning",
                _ => "badge bg-secondary"
            };
        }

        public bool IsUpcoming()
        {
            return AppointmentDate >= DateTime.Today && Status.ToLower() == "scheduled";
        }

        public bool CanCancel()
        {
            return AppointmentDate > DateTime.Now.AddHours(24) && Status.ToLower() == "scheduled";
        }

        public bool CanReschedule()
        {
            return AppointmentDate > DateTime.Now.AddHours(12) && Status.ToLower() == "scheduled";
        }
    }

    // Simple view model for displaying appointments in lists/dashboards
    public class AppointmentViewModel
    {
        public Guid Id { get; set; }
        public string? PatientName { get; set; }
        public string? DoctorName { get; set; }
        public string? DoctorSpecialization { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ReasonForVisit { get; set; }
        public string? ConfirmationNumber { get; set; }
        public Guid? SymptomEntryId { get; set; }
        public decimal ConsultationFee { get; set; }
        
        public string GetFormattedDate()
        {
            return AppointmentDate.ToString("MMM dd, yyyy");
        }
        
        public string GetFormattedTime()
        {
            return AppointmentDate.ToString("hh:mm tt");
        }
    }
}
