using System.ComponentModel.DataAnnotations;

namespace MediPredict.Data.ViewModels
{
    public class ConsultationViewModel
    {
        // Appointment Info
        public Guid AppointmentId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string ReasonForVisit { get; set; } = string.Empty;
        public string AppointmentNotes { get; set; } = string.Empty;

        // Patient Demographics
        public Guid PatientId { get; set; }
        public string PatientGender { get; set; } = string.Empty;
        public DateTime? PatientDateOfBirth { get; set; }
        public string PatientAge => PatientDateOfBirth?.ToString("yyyy-MM-dd") != null 
            ? $"{DateTime.Now.Year - PatientDateOfBirth.Value.Year}" : "N/A";
        public string PatientPhone { get; set; } = string.Empty;
        public string PatientEmail { get; set; } = string.Empty;
        public string PatientMedicalHistory { get; set; } = string.Empty;
        public string PatientAllergies { get; set; } = string.Empty;

        // AI Prediction Information (if exists)
        public AIPredictionViewModel? AIPrediction { get; set; }

        // Consultation Form Data
        [Required(ErrorMessage = "Please provide an official diagnosis")]
        [StringLength(500, ErrorMessage = "Diagnosis cannot exceed 500 characters")]
        [Display(Name = "Official Diagnosis")]
        public string OfficialDiagnosis { get; set; } = string.Empty;

        [Display(Name = "AI Diagnosis Accuracy")]
        public bool AIDiagnosisConfirmed { get; set; } = true;

        [StringLength(2000, ErrorMessage = "Consultation notes cannot exceed 2000 characters")]
        [Display(Name = "Consultation Notes")]
        public string ConsultationNotes { get; set; } = string.Empty;

        [StringLength(2000, ErrorMessage = "Treatment plan cannot exceed 2000 characters")]
        [Display(Name = "Treatment Plan")]
        public string TreatmentPlan { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Lab tests cannot exceed 1000 characters")]
        [Display(Name = "Lab Tests Ordered")]
        public string LabTestsOrdered { get; set; } = string.Empty;

        // Prescriptions
        public List<PrescriptionViewModel> Prescriptions { get; set; } = new List<PrescriptionViewModel>();

        // Status
        public bool IsCompleted { get; set; }
        public DateTime? CompletedDate { get; set; }

        // Existing consultation record (if editing)
        public Guid? ConsultationRecordId { get; set; }
        
        // Doctor Information (for patient view)
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        
        // Additional properties for consultation history
        public DateTime ConsultationDate { get; set; }
        public bool AIPredictionUsed { get; set; }
    }

    public class AIPredictionViewModel
    {
        public Guid Id { get; set; }
        public string PrimaryCondition { get; set; } = string.Empty;
        public decimal ConfidenceScore { get; set; }
        public string SymptomsReported { get; set; } = string.Empty;
        public List<DiseaseProbability> PredictionResults { get; set; } = new List<DiseaseProbability>();
        public string AIDisclaimer { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }





    public class PrescriptionViewModel
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Drug name is required")]
        [StringLength(200, ErrorMessage = "Drug name cannot exceed 200 characters")]
        [Display(Name = "Drug Name")]
        public string DrugName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Dosage is required")]
        [StringLength(100, ErrorMessage = "Dosage cannot exceed 100 characters")]
        [Display(Name = "Dosage")]
        public string Dosage { get; set; } = string.Empty;

        [Required(ErrorMessage = "Frequency is required")]
        [StringLength(100, ErrorMessage = "Frequency cannot exceed 100 characters")]
        [Display(Name = "Frequency")]
        public string Frequency { get; set; } = string.Empty;

        [Required(ErrorMessage = "Duration is required")]
        [StringLength(100, ErrorMessage = "Duration cannot exceed 100 characters")]
        [Display(Name = "Duration")]
        public string Duration { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Instructions cannot exceed 500 characters")]
        [Display(Name = "Special Instructions")]
        public string Instructions { get; set; } = string.Empty;
    }
}