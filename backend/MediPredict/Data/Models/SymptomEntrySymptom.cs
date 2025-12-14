using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediPredict.Data.Models
{
    /// <summary>
    /// Junction table for many-to-many relationship between SymptomEntries and Symptoms
    /// </summary>
    [Table("SymptomEntrySymptoms")]
    public class SymptomEntrySymptom
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid SymptomEntryId { get; set; }

        [Required]
        public Guid SymptomId { get; set; }

        [Range(1, 5)]
        public int SeverityLevel { get; set; } = 1;

        [MaxLength(500)]
        public string? AdditionalNotes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public SymptomEntry SymptomEntry { get; set; } = null!;
        public Symptom Symptom { get; set; } = null!;
    }
}
