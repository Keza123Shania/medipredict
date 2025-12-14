using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediPredict.Data.Models
{
    [Table("Prescriptions")]
    public class Prescription
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ConsultationRecordId { get; set; }
        
        [ForeignKey("ConsultationRecordId")]
        public virtual ConsultationRecord ConsultationRecord { get; set; } = null!;

        [Required]
        [StringLength(200)]
        public string DrugName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Dosage { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Frequency { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Duration { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Instructions { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
