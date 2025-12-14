using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediPredict.Data.Models
{
    [Table("AIPredictions")]
    public class AIPrediction
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid SymptomEntryId { get; set; }

        [Required]
        public Guid DiseaseId { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal Probability { get; set; }

        [Range(0, 100)]
        public decimal? ConfidenceLevel { get; set; }

        public string? Recommendations { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public SymptomEntry SymptomEntry { get; set; } = null!;
        public Disease Disease { get; set; } = null!;
    }
}
