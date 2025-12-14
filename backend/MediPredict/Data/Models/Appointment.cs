using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MediPredict.Data.Enums;

namespace MediPredict.Data.Models
{
    [Table("Appointments")]
    public class Appointment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid PatientId { get; set; }

        [Required]
        public Guid DoctorId { get; set; }

        // Link to AI Prediction if appointment was booked after symptom analysis
        public Guid? SymptomEntryId { get; set; }

        [Required]
        public DateTime ScheduledDate { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [Range(15, 480)]
        public int DurationMinutes { get; set; } = 30;

        [Required]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(50)]
        public string ConfirmationNumber { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ReasonForVisit { get; set; }

        // Navigation properties
        public Patient Patient { get; set; } = null!;
        public Doctor Doctor { get; set; } = null!;
        public SymptomEntry? SymptomEntry { get; set; }
        public ICollection<NotificationLog> Notifications { get; set; } = new List<NotificationLog>();
    }
}
