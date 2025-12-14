using System.ComponentModel.DataAnnotations;

namespace MediPredict.Data.ViewModels
{
    public class ComprehensivePredictionViewModel
    {
        // ===== SECTION 1: BASIC INFORMATION =====
        [Required(ErrorMessage = "Age is required")]
        [Range(0, 120, ErrorMessage = "Age must be between 0 and 120")]
        [Display(Name = "Age")]
        public int Age { get; set; }

        [Required(ErrorMessage = "Sex is required")]
        [Display(Name = "Sex (1 = Male, 0 = Female)")]
        public int Sex { get; set; } // 1 = Male, 0 = Female

        // ===== SECTION 2: CARDIOVASCULAR & PHYSICAL SYMPTOMS =====
        [Required]
        [Display(Name = "Chest Pain Type")]
        [Range(0, 3, ErrorMessage = "Chest pain type must be 0-3")]
        public int ChestPainType { get; set; } // 0-3

        [Required]
        [Display(Name = "Resting Blood Pressure (mm Hg)")]
        [Range(0, 200, ErrorMessage = "Blood pressure must be between 0-200")]
        public int RestingBloodPressure { get; set; }

        [Required]
        [Display(Name = "Serum Cholesterol (mg/dl)")]
        [Range(0, 600, ErrorMessage = "Cholesterol must be between 0-600")]
        public int SerumCholesterol { get; set; }

        [Required]
        [Display(Name = "Fasting Blood Sugar > 120 mg/dl")]
        public int FastingBloodSugar { get; set; } // 1 = true, 0 = false

        [Required]
        [Display(Name = "Resting ECG Results")]
        [Range(0, 2, ErrorMessage = "Resting ECG must be 0-2")]
        public int RestingECG { get; set; } // 0-2

        [Required]
        [Display(Name = "Maximum Heart Rate Achieved")]
        [Range(60, 220, ErrorMessage = "Heart rate must be between 60-220")]
        public int MaxHeartRate { get; set; }

        [Required]
        [Display(Name = "Exercise Induced Angina")]
        public int ExerciseInducedAngina { get; set; } // 1 = yes, 0 = no

        [Required]
        [Display(Name = "ST Depression (Oldpeak)")]
        [Range(0, 10, ErrorMessage = "ST depression must be between 0-10")]
        public double STDepression { get; set; }

        [Required]
        [Display(Name = "Slope of Peak Exercise ST Segment")]
        [Range(0, 2, ErrorMessage = "Slope must be 0-2")]
        public int SlopeOfPeakExercise { get; set; } // 0-2

        [Required]
        [Display(Name = "Number of Major Vessels (0-3)")]
        [Range(0, 3, ErrorMessage = "Major vessels must be 0-3")]
        public int NumberOfMajorVessels { get; set; }

        [Required]
        [Display(Name = "Thalassemia (Thal)")]
        [Range(0, 3, ErrorMessage = "Thal must be 0-3")]
        public int Thalassemia { get; set; } // 0-3

        // ===== SECTION 3: RESPIRATORY SYMPTOMS =====
        [Required]
        [Display(Name = "Cough")]
        public int Cough { get; set; } // 1 = yes, 0 = no

        [Required]
        [Display(Name = "Shortness of Breath")]
        public int ShortnessOfBreath { get; set; }

        [Required]
        [Display(Name = "Wheezing")]
        public int Wheezing { get; set; }

        // ===== SECTION 4: GENERAL SYMPTOMS =====
        [Required]
        [Display(Name = "Fever")]
        public int Fever { get; set; }

        [Required]
        [Display(Name = "Fatigue")]
        public int Fatigue { get; set; }

        [Required]
        [Display(Name = "Headache")]
        public int Headache { get; set; }

        // ===== SECTION 5: DIGESTIVE & OTHER SYMPTOMS =====
        [Required]
        [Display(Name = "Nausea/Vomiting")]
        public int NauseaVomiting { get; set; }

        [Required]
        [Display(Name = "Abdominal Pain")]
        public int AbdominalPain { get; set; }

        [Required]
        [Display(Name = "Diarrhea")]
        public int Diarrhea { get; set; }

        [Required]
        [Display(Name = "Loss of Appetite")]
        public int LossOfAppetite { get; set; }

        // ===== ADDITIONAL INFORMATION =====
        [StringLength(1000, ErrorMessage = "Additional notes cannot exceed 1000 characters")]
        [Display(Name = "Additional Notes")]
        public string? AdditionalNotes { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}