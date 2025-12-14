namespace MediPredict.Data.ViewModels
{
    public class DoctorProfileViewModel
    {
        public Guid DoctorId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string Qualifications { get; set; } = string.Empty;
        public int Experience { get; set; }
        public string LicenseNumber { get; set; } = string.Empty;
        public string? LicenseState { get; set; }
        public DateTime? LicenseIssueDate { get; set; }
        public DateTime? LicenseExpiryDate { get; set; }
        public string? NpiNumber { get; set; }
        public string? ProfessionalTitle { get; set; }
        public string? EducationTraining { get; set; }
        public string? BoardCertifications { get; set; }
        public bool IsVerified { get; set; }
        public decimal ConsultationFee { get; set; }
        public string? Bio { get; set; }
        public string? Address { get; set; }
        public string? ProfilePicture { get; set; }
        
        // Alias properties for compatibility (settable)
        public string Name 
        { 
            get => FullName; 
            set => FullName = value; 
        }
        
        public string Qualification 
        { 
            get => Qualifications; 
            set => Qualifications = value; 
        }
        
        public string? ClinicAddress 
        { 
            get => Address; 
            set => Address = value; 
        }
        
        public double Rating 
        { 
            get => AverageRating; 
            set => AverageRating = value; 
        }
        
        // Availability
        public List<string> AvailableDays { get; set; } = new();
        public string? AvailableTimeStart { get; set; }
        public string? AvailableTimeEnd { get; set; }
        
        // Ratings & Reviews
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public List<DoctorReviewViewModel> RecentReviews { get; set; } = new();
        
        // Statistics
        public int TotalPatients { get; set; }
        public int CompletedConsultations { get; set; }
        
        // Helper methods
        public string GetExperienceText()
        {
            return Experience == 1 ? "1 year" : $"{Experience} years";
        }

        public string GetConsultationFeeText()
        {
            return $"${ConsultationFee:F2}";
        }

        public string GetRatingStars()
        {
            int fullStars = (int)Math.Floor(AverageRating);
            bool hasHalfStar = (AverageRating - fullStars) >= 0.5;
            
            string stars = string.Concat(Enumerable.Repeat("★", fullStars));
            if (hasHalfStar) stars += "⯨";
            stars += string.Concat(Enumerable.Repeat("☆", 5 - fullStars - (hasHalfStar ? 1 : 0)));
            
            return stars;
        }

        public string GetAvailabilityText()
        {
            if (!AvailableDays.Any()) return "Availability not set";
            return $"{string.Join(", ", AvailableDays)} • {AvailableTimeStart} - {AvailableTimeEnd}";
        }

        public string GetBadgeClass()
        {
            return IsVerified ? "badge bg-success" : "badge bg-warning";
        }

        public string GetBadgeText()
        {
            return IsVerified ? "Verified" : "Pending Verification";
        }
    }

    public class DoctorReviewViewModel
    {
        public int ReviewId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime Date { get; set; }

        public string GetRatingStars()
        {
            return string.Concat(Enumerable.Repeat("★", Rating)) + 
                   string.Concat(Enumerable.Repeat("☆", 5 - Rating));
        }

        public string GetFormattedDate()
        {
            var timeSpan = DateTime.Now - Date;
            if (timeSpan.TotalDays < 1) return "Today";
            if (timeSpan.TotalDays < 2) return "Yesterday";
            if (timeSpan.TotalDays < 7) return $"{(int)timeSpan.TotalDays} days ago";
            if (timeSpan.TotalDays < 30) return $"{(int)(timeSpan.TotalDays / 7)} weeks ago";
            return Date.ToString("MMM dd, yyyy");
        }
    }

    public class DoctorSearchViewModel
    {
        // Search filters
        public string? SearchQuery { get; set; }
        public string? Specialization { get; set; }
        public string? Location { get; set; }
        public string? Availability { get; set; }
        public decimal? MaxFee { get; set; }
        public int? MinRating { get; set; }
        public int? MinExperience { get; set; }
        public bool VerifiedOnly { get; set; } = false;
        public string? SortBy { get; set; } // "rating", "experience", "fee", "name"

        // Results
        public List<DoctorProfileViewModel> Doctors { get; set; } = new();
        public int TotalResults { get; set; }
        public int CurrentPage { get; set; } = 1;
        public int PageSize { get; set; } = 12;
        public int TotalPages => (int)Math.Ceiling((double)TotalResults / PageSize);

        // Available filter options
        public List<string> AvailableSpecializations { get; set; } = new()
        {
            "Cardiology",
            "Dermatology",
            "Endocrinology",
            "Gastroenterology",
            "General Practice",
            "Infectious Disease",
            "Internal Medicine",
            "Neurology",
            "Oncology",
            "Pediatrics",
            "Psychiatry",
            "Pulmonology",
            "Rheumatology",
            "Surgery"
        };

        public List<string> AvailableDays { get; set; } = new()
        {
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        };
    }
}
