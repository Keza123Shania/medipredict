using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediPredict.Data.Models
{
    [Table("DoctorAffiliations")]
    public class DoctorAffiliation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid DoctorId { get; set; }

        [Required]
        public Guid OrganizationId { get; set; }

        [MaxLength(100)]
        public string? Position { get; set; } // Staff, Consultant, Partner, etc.

        [MaxLength(50)]
        public string? Department { get; set; }

        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        public DateTime? EndDate { get; set; }

        public bool IsPrimary { get; set; } = false; // Primary affiliation

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Doctor Doctor { get; set; } = null!;
        public HealthcareOrganization Organization { get; set; } = null!;
    }
}
