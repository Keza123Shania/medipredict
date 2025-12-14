using System.ComponentModel.DataAnnotations;

namespace MediPredict.Data.ViewModels
{
    public class AdminDashboardViewModel
    {
        public SystemStatistics Statistics { get; set; } = new();
        public List<RecentActivityItem> RecentActivities { get; set; } = new();
        public List<ChartDataPoint> AppointmentTrends { get; set; } = new();
        public List<ChartDataPoint> PredictionTrends { get; set; } = new();
        public List<TopDoctorViewModel> TopDoctors { get; set; } = new();
        public List<PendingApprovalItem> PendingApprovals { get; set; } = new();
    }

    public class SystemStatistics
    {
        public int TotalPatients { get; set; }
        public int TotalDoctors { get; set; }
        public int TotalAppointments { get; set; }
        public int TotalPredictions { get; set; }
        
        public int ActivePatients { get; set; }
        public int VerifiedDoctors { get; set; }
        public int UpcomingAppointments { get; set; }
        public int TodayAppointments { get; set; }
        
        public int PendingDoctorApprovals { get; set; }
        public int PendingAppointmentCancellations { get; set; }
        
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        
        // Growth rates (percentage)
        public double PatientGrowthRate { get; set; }
        public double DoctorGrowthRate { get; set; }
        public double AppointmentGrowthRate { get; set; }
        public double RevenueGrowthRate { get; set; }
    }

    public class RecentActivityItem
    {
        public string Id { get; set; } = string.Empty;
        public string ActivityType { get; set; } = string.Empty; // "appointment", "prediction", "registration", "approval"
        public string Description { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string IconClass { get; set; } = string.Empty;
        public string ColorClass { get; set; } = string.Empty;

        public string GetRelativeTime()
        {
            var timeSpan = DateTime.Now - Timestamp;
            
            if (timeSpan.TotalMinutes < 1)
                return "Just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} minutes ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} hours ago";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays} days ago";
            
            return Timestamp.ToString("MMM dd, yyyy");
        }
    }

    public class ChartDataPoint
    {
        public string Label { get; set; } = string.Empty;
        public int Value { get; set; }
        public string Color { get; set; } = "#2563eb";
    }

    public class TopDoctorViewModel
    {
        public Guid DoctorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
        public double Rating { get; set; }
        public int TotalAppointments { get; set; }
        public decimal Revenue { get; set; }
        public bool IsVerified { get; set; }
    }

    public class PendingApprovalItem
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty; // "doctor", "appointment_cancellation"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime SubmittedDate { get; set; }
        public string Status { get; set; } = "Pending";
        public int Priority { get; set; } // 1=Low, 2=Medium, 3=High

        public string GetPriorityBadgeClass()
        {
            return Priority switch
            {
                3 => "badge bg-danger",
                2 => "badge bg-warning",
                _ => "badge bg-info"
            };
        }

        public string GetPriorityText()
        {
            return Priority switch
            {
                3 => "High",
                2 => "Medium",
                _ => "Low"
            };
        }
    }

    // Patient Management ViewModels
    public class PatientManagementViewModel
    {
        public List<PatientListItemViewModel> Patients { get; set; } = new();
        public int TotalPatients { get; set; }
        public int ActivePatients { get; set; }
        public int InactivePatients { get; set; }
        
        // Filters
        public string? SearchQuery { get; set; }
        public string? StatusFilter { get; set; }
        public DateTime? RegistrationDateFrom { get; set; }
        public DateTime? RegistrationDateTo { get; set; }
    }

    public class PatientListItemViewModel
    {
        public Guid PatientId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public DateTime RegistrationDate { get; set; }
        public int TotalAppointments { get; set; }
        public int TotalPredictions { get; set; }
        public DateTime? LastVisit { get; set; }
        public string Status { get; set; } = "Active"; // Active, Inactive, Blocked

        public int GetAge()
        {
            var today = DateTime.Today;
            var age = today.Year - DateOfBirth.Year;
            if (DateOfBirth.Date > today.AddYears(-age)) age--;
            return age;
        }

        public string GetStatusBadgeClass()
        {
            return Status.ToLower() switch
            {
                "active" => "badge bg-success",
                "inactive" => "badge bg-secondary",
                "blocked" => "badge bg-danger",
                _ => "badge bg-secondary"
            };
        }
    }

    // Doctor Management ViewModels
    public class DoctorManagementViewModel
    {
        public List<DoctorListItemViewModel> Doctors { get; set; } = new();
        public int TotalDoctors { get; set; }
        public int VerifiedDoctors { get; set; }
        public int PendingApproval { get; set; }
        
        // Filters
        public string? SearchQuery { get; set; }
        public string? SpecializationFilter { get; set; }
        public string? StatusFilter { get; set; }
        public bool? VerifiedOnly { get; set; }
    }

    public class DoctorListItemViewModel
    {
        public Guid DoctorId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string Qualification { get; set; } = string.Empty;
        public string? LicenseNumber { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public int Experience { get; set; }
        public decimal ConsultationFee { get; set; }
        public double Rating { get; set; }
        public int TotalReviews { get; set; }
        public int TotalAppointments { get; set; }
        public bool IsVerified { get; set; }
        public string Status { get; set; } = "Active"; // Active, Inactive, Pending, Suspended
        public DateTime RegistrationDate { get; set; }
        public DateTime? LastActive { get; set; }

        public string GetStatusBadgeClass()
        {
            return Status.ToLower() switch
            {
                "active" => "badge bg-success",
                "pending" => "badge bg-warning",
                "suspended" => "badge bg-danger",
                "inactive" => "badge bg-secondary",
                _ => "badge bg-secondary"
            };
        }
    }

    // Appointment Management ViewModels
    public class AppointmentManagementViewModel
    {
        public List<AppointmentAdminItemViewModel> Appointments { get; set; } = new();
        public int TotalAppointments { get; set; }
        public int ScheduledAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CancelledAppointments { get; set; }
        
        // Filters
        public string? SearchQuery { get; set; }
        public string? StatusFilter { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public Guid? DoctorId { get; set; }
        public Guid? PatientId { get; set; }
    }

    // Admin Analytics ViewModels
    public class SystemAnalyticsViewModel
    {
        // User Statistics
        public int TotalUsers { get; set; }
        public int TotalPatients { get; set; }
        public int TotalDoctors { get; set; }
        public int TotalAdmins { get; set; }
        public int ActivePatients { get; set; }
        public int VerifiedDoctors { get; set; }
        public int ActiveAdmins { get; set; }
        public double UsersGrowth { get; set; }

        // Appointment Statistics
        public int DailyAppointments { get; set; }
        public int WeeklyAppointments { get; set; }
        public int MonthlyAppointments { get; set; }
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public double DailyAppointmentsChange { get; set; }
        public double MonthlyAppointmentsChange { get; set; }
        public double AvgDailyAppointments { get; set; }

        // Appointment Status Counts
        public int ScheduledCount { get; set; }
        public int CompletedCount { get; set; }
        public int CancelledCount { get; set; }
        public int NoShowCount { get; set; }

        // Disease Statistics
        public List<DiseaseStatistic> TopDiseases { get; set; } = new();

        // Chart Data
        public List<string> AppointmentTrendLabels { get; set; } = new();
        public List<int> AppointmentTrendData { get; set; } = new();
        public List<string> UserGrowthLabels { get; set; } = new();
        public List<int> PatientGrowthData { get; set; } = new();
        public List<int> DoctorGrowthData { get; set; } = new();

        // Activity Logs
        public List<RecentActivityItem> ActivityLogs { get; set; } = new();

        // Performance Metrics
        public int TotalPredictions { get; set; }
        public int AvgResponseTime { get; set; }
        public double SuccessRate { get; set; }
        public int ActiveSessions { get; set; }
    }

    public class DiseaseStatistic
    {
        public int Rank { get; set; }
        public string DiseaseName { get; set; } = string.Empty;
        public int PredictionCount { get; set; }
        public double Percentage { get; set; }
    }

    // Admin Profile ViewModels
    public class AdminProfileViewModel
    {
        public string UserId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? ProfilePicture { get; set; }
        public DateTime MemberSince { get; set; }
        public DateTime? LastLogin { get; set; }
        public int DaysActive { get; set; }
        public int TotalActions { get; set; }
        public int ApprovedDoctors { get; set; }
        public string Department { get; set; } = "System Administration";
        public List<string> Permissions { get; set; } = new();
    }

    public class AppointmentAdminItemViewModel
    {
        public Guid AppointmentId { get; set; }
        public string ConfirmationNumber { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public decimal ConsultationFee { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ReasonForVisit { get; set; } = string.Empty;
        public DateTime BookedAt { get; set; }

        public string GetStatusBadgeClass()
        {
            return Status.ToLower() switch
            {
                "scheduled" => "badge bg-primary",
                "completed" => "badge bg-success",
                "cancelled" => "badge bg-danger",
                "noshow" => "badge bg-warning",
                "rescheduled" => "badge bg-info",
                _ => "badge bg-secondary"
            };
        }
    }

    // API-specific ViewModels for AdminController
    public class ConsultationSummaryViewModel
    {
        public Guid ConsultationRecordId { get; set; }
        public Guid AppointmentId { get; set; }
        
        // Patient information (for doctor view)
        public string PatientName { get; set; } = string.Empty;
        public int? PatientAge { get; set; }
        public string? PatientGender { get; set; }
        
        // Doctor information (for patient view)
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public string? DoctorProfilePicture { get; set; }
        
        // Consultation details
        public DateTime ConsultationDate { get; set; }
        public string OfficialDiagnosis { get; set; } = string.Empty;
        public bool AIPredictionUsed { get; set; }
        public bool AIDiagnosisConfirmed { get; set; }
        public string? AIPredictionCondition { get; set; }
        public decimal? AIPredictionConfidence { get; set; }
        public int PrescriptionsCount { get; set; }
        public string? LabTestsOrdered { get; set; }
        public string ReasonForVisit { get; set; } = string.Empty;
    }

    public class DoctorApprovalViewModel
    {
        public Guid DoctorId { get; set; }
        public Guid UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string HospitalAffiliation { get; set; } = string.Empty;
        public int YearsOfExperience { get; set; }
        public string EducationDetails { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class SpecializationStatViewModel
    {
        public string Specialization { get; set; } = string.Empty;
        public int AppointmentCount { get; set; }
    }

    public class DailyActivityViewModel
    {
        public DateTime Date { get; set; }
        public int AppointmentCount { get; set; }
        public int PredictionCount { get; set; }
    }

    public class AdminAnalyticsViewModel
    {
        public int TotalPatients { get; set; }
        public int TotalDoctors { get; set; }
        public int PendingDoctorApprovals { get; set; }
        public int TotalAppointments { get; set; }
        public int TotalConsultations { get; set; }
        public int TotalPredictions { get; set; }
        public int RecentPatients { get; set; }
        public int RecentDoctors { get; set; }
        public int RecentAppointments { get; set; }
        public int RecentConsultations { get; set; }
        public decimal PatientGrowthRate { get; set; }
        public decimal DoctorGrowthRate { get; set; }
        public decimal AppointmentGrowthRate { get; set; }
        public int PendingAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CancelledAppointments { get; set; }
        public List<SpecializationStatViewModel> TopSpecializations { get; set; } = new();
        public decimal AIPredictionAccuracy { get; set; }
        public List<DailyActivityViewModel> DailyActivity { get; set; } = new();
    }

    public class UpdateStatusRequest
    {
        public string NewStatus { get; set; } = string.Empty;
    }
}
