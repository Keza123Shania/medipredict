namespace MediPredict.Data.ViewModels
{
    public class PatientProfileSummaryViewModel
    {
        public Guid PatientId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string BloodType { get; set; } = string.Empty;
        public string Allergies { get; set; } = string.Empty;
        public string MedicalHistory { get; set; } = string.Empty;
        public bool IsPregnant { get; set; }
        public string? EmergencyContact { get; set; }
        public string? EmergencyPhone { get; set; }
        public string? ProfilePicture { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DoctorEditViewModel
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string Qualifications { get; set; } = string.Empty;
        public int Experience { get; set; }
        public decimal ConsultationFee { get; set; }
        public string Bio { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public List<string>? AvailableDays { get; set; }
        public string? AvailableTimeStart { get; set; }
        public string? AvailableTimeEnd { get; set; }
        public string? EducationTraining { get; set; }
        public string? BoardCertifications { get; set; }
    }

    public class MedicalHistoryViewModel
    {
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string BloodType { get; set; } = string.Empty;
        public string Allergies { get; set; } = string.Empty;
        public string MedicalHistory { get; set; } = string.Empty;
        public List<ConsultationViewModel> Consultations { get; set; } = new();
        public List<AppointmentViewModel> Appointments { get; set; } = new();
        public List<PredictionHistoryItemViewModel> Predictions { get; set; } = new();
        public int TotalConsultations { get; set; }
        public int TotalAppointments { get; set; }
        public int TotalPredictions { get; set; }
    }
}
