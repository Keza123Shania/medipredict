using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MediPredict.Data.Enums;

namespace MediPredict.Data.Models
{
    [Table("NotificationLogs")]
    public class NotificationLog
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public NotificationType Type { get; set; }

        [Required]
        public Guid UserId { get; set; }

        public Guid? AppointmentId { get; set; }

        public Guid? ConsultationId { get; set; }

        [Required]
        [MaxLength(256)]
        public string RecipientEmail { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Subject { get; set; }

        public string? MessageBody { get; set; }

        public bool IsSent { get; set; } = false;

        public DateTime? SentAt { get; set; }

        [MaxLength(500)]
        public string? ErrorMessage { get; set; }

        public int RetryCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ApplicationUser User { get; set; } = null!;
        public Appointment? Appointment { get; set; }
        public ConsultationRecord? Consultation { get; set; }
    }
}
