namespace MediPredict.Data.ViewModels
{
    public class MockPredictionResultViewModel
    {
        // ===== PRIMARY PREDICTION =====
        public string PredictedDisease { get; set; } = string.Empty;
        public decimal ConfidenceScore { get; set; }

        // ===== SEVERITY ASSESSMENT =====
        public string UrgencyLevel { get; set; } = string.Empty; // "Low", "Medium", "High", "Critical"
        public string UrgencyColor { get; set; } = string.Empty; // CSS color class

        // ===== DETAILED PROBABILITY BREAKDOWN =====
        public List<DiseaseProbability> ProbabilityBreakdown { get; set; } = new List<DiseaseProbability>();

        // ===== RECOMMENDATIONS & DISCLAIMER =====
        public string Recommendations { get; set; } = string.Empty;
        public string Disclaimer { get; set; } = "This AI prediction is preliminary and for informational purposes only. It is not a substitute for professional medical diagnosis. Please consult a qualified healthcare provider for any health concerns.";

        // ===== PREDICTION METADATA =====
        public DateTime PredictionTimestamp { get; set; } = DateTime.UtcNow;
        public string InputSummary { get; set; } = string.Empty;
        public int? PredictionId { get; set; }

        // ===== INPUT DATA (for display) =====
        public SymptomInputViewModel? InputData { get; set; }

        // Helper method to get urgency color class
        public string GetUrgencyColorClass()
        {
            return UrgencyLevel.ToLower() switch
            {
                "low" => "success",
                "medium" => "warning",
                "high" => "danger",
                "critical" => "danger",
                _ => "secondary"
            };
        }

        // Helper method to get urgency icon
        public string GetUrgencyIcon()
        {
            return UrgencyLevel.ToLower() switch
            {
                "low" => "✓",
                "medium" => "⚠",
                "high" => "⚠",
                "critical" => "🚨",
                _ => "ℹ"
            };
        }
    }

    public class DiseaseProbability
    {
        public string DiseaseName { get; set; } = string.Empty;
        public decimal Probability { get; set; }
        public string Description { get; set; } = string.Empty;

        // Helper to get percentage string
        public string GetPercentageString()
        {
            return $"{Probability:F1}%";
        }

        // Helper to get progress bar width
        public string GetProgressBarWidth()
        {
            return $"{Probability}%";
        }
    }

    // For Prediction History
    public class PredictionHistoryItemViewModel
    {
        public Guid PredictionId { get; set; }
        public DateTime Date { get; set; }
        public string PrimarySymptoms { get; set; } = string.Empty;
        public string PredictedCondition { get; set; } = string.Empty;
        public decimal ConfidenceScore { get; set; }
        public string UrgencyLevel { get; set; } = string.Empty;

        public string GetFormattedDate()
        {
            return Date.ToString("MMM dd, yyyy");
        }

        public string GetFormattedTime()
        {
            return Date.ToString("hh:mm tt");
        }

        public string GetConfidencePercentage()
        {
            return $"{ConfidenceScore:F0}%";
        }
    }
}
