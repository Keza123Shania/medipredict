using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediPredict.Data.Models
{
    [Table("SymptomEntries")]
    public class SymptomEntry
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid PatientId { get; set; }

        [Range(1, 5)]
        public int SeverityLevel { get; set; } = 1;

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Patient Patient { get; set; } = null!;
        public ICollection<SymptomEntrySymptom> Symptoms { get; set; } = new List<SymptomEntrySymptom>();
        public ICollection<AIPrediction> AIPredictions { get; set; } = new List<AIPrediction>();
    }
}
