using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediPredict.Data.Models
{
    [Table("Doctors")]
    public class Doctor
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Specialization { get; set; } = string.Empty;

        [Required]
        public string Qualifications { get; set; } = string.Empty;

        [Required]
        [Range(0, 60)]
        public int Experience { get; set; }

        // Medical License Information
        [Required]
        [MaxLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? LicenseState { get; set; }

        public DateTime? LicenseExpiryDate { get; set; }

        [MaxLength(20)]
        public string? NpiNumber { get; set; }

        public DateTime? LicenseIssueDate { get; set; }

        // Professional Information
        public bool IsVerified { get; set; } = false;

        [Required]
        [Range(0, 10000)]
        public decimal ConsultationFee { get; set; }

        public string? Bio { get; set; }

        [MaxLength(200)]
        public string? ProfessionalTitle { get; set; }

        // Education & Training (stored as JSON)
        public string? EducationTraining { get; set; }

        // Board Certifications (stored as JSON)
        public string? BoardCertifications { get; set; }

        // Availability
        [MaxLength(100)]
        public string? AvailableDays { get; set; }

        public TimeSpan? AvailableTimeStart { get; set; }
        public TimeSpan? AvailableTimeEnd { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ApplicationUser User { get; set; } = null!;
        public ICollection<DoctorAffiliation> Affiliations { get; set; } = new List<DoctorAffiliation>();
    }
}
