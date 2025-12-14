using System;
using System.Collections.Generic;

namespace MediPredict.Data.ViewModels
{
    public class PredictionResultViewModel
    {
        public int Id { get; set; }
        public string PredictionId { get; set; } = Guid.NewGuid().ToString();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime PredictionTimestamp => Timestamp;
        
        // Primary Prediction
        public string PrimaryDisease { get; set; } = string.Empty;
        public string PredictedDisease { get; set; } = string.Empty;
        public double PrimaryConfidence { get; set; }
        public double ConfidenceScore => PrimaryConfidence;
        public double Confidence => PrimaryConfidence;
        public int SymptomsCount { get; set; }
        public string UrgencyLevel { get; set; } = "Low"; // Low, Medium, High
        
        // Full Probability Breakdown (16 classes)
        public List<DiseaseProbability> AllProbabilities { get; set; } = new();
        public List<DiseaseProbability> ProbabilityBreakdown => AllProbabilities;
        
        // Input Summary
        public ComprehensivePredictionViewModel InputSummary { get; set; } = new();
        
        // Recommendations
        public List<string> Recommendations { get; set; } = new();
        public string DisclaimerMessage { get; set; } = "This AI prediction is for informational purposes only and should not replace professional medical advice.";
        public string Disclaimer => DisclaimerMessage;

        public string GetUrgencyIcon()
        {
            return UrgencyLevel.ToLower() switch
            {
                "high" => "fa-exclamation-triangle",
                "medium" => "fa-exclamation-circle",
                _ => "fa-info-circle"
            };
        }
    }
}