using System.ComponentModel.DataAnnotations;

namespace MediPredict.Data.ViewModels
{
    public class SymptomEntryViewModel
    {
        [Required]
        public List<Guid> SelectedSymptomIds { get; set; } = new List<Guid>();

        [Range(1, 5)]
        public int SeverityLevel { get; set; } = 1;

        [MaxLength(500)]
        public string? Description { get; set; }
    }

    public class SymptomSelection
    {
        public int SymptomId { get; set; }
        public string SymptomName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool IsSelected { get; set; }
    }
}