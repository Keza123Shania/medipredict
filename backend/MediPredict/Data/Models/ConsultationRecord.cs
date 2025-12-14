using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediPredict.Data.Models
{
    [Table("ConsultationRecords")]
    public class ConsultationRecord
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid AppointmentId { get; set; }
        
        [ForeignKey("AppointmentId")]
        public virtual Appointment Appointment { get; set; } = null!;

        [Required]
        public Guid PatientId { get; set; }
        
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; } = null!;

        [Required]
        public Guid DoctorId { get; set; }
        
        [ForeignKey("DoctorId")]
        public virtual Doctor Doctor { get; set; } = null!;

        // AI Prediction Reference
        public Guid? AIPredictionId { get; set; }
        
        [ForeignKey("AIPredictionId")]
        public virtual AIPrediction? AIPrediction { get; set; }

        // Official Diagnosis
        [Required]
        [StringLength(500)]
        public string OfficialDiagnosis { get; set; } = string.Empty;

        // AI Accuracy
        [Required]
        public bool AIDiagnosisConfirmed { get; set; }

        // Consultation Notes
        [StringLength(2000)]
        public string? ConsultationNotes { get; set; }

        // Treatment Plan
        [StringLength(2000)]
        public string? TreatmentPlan { get; set; }

        // Lab Tests Ordered
        [StringLength(1000)]
        public string? LabTestsOrdered { get; set; }

        // Navigation Properties
        public virtual ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();

        // Timestamps
        [Required]
        public DateTime ConsultationDate { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
