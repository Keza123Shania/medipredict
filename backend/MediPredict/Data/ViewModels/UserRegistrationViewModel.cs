using System.ComponentModel.DataAnnotations;

namespace MediPredict.Data.ViewModels
{
    public class UserRegistrationViewModel
    {
        [Required(ErrorMessage = "First name is required")]
        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
        [Display(Name = "First Name")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required")]
        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
        [Display(Name = "Last Name")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address")]
        [Display(Name = "Email")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Date of birth is required")]
        [Display(Name = "Date of Birth")]
        [DataType(DataType.Date)]
        public DateTime DateOfBirth { get; set; }

        [Required(ErrorMessage = "Gender is required")]
        [Display(Name = "Gender")]
        public string Gender { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Please enter a valid phone number")]
        [Display(Name = "Phone Number")]
        public string? PhoneNumber { get; set; }

        [Required(ErrorMessage = "Please select account type")]
        [Display(Name = "Role")]
        public string Role { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, ErrorMessage = "Password must be between {2} and {1} characters long", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; } = string.Empty;

        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("Password", ErrorMessage = "Password and confirmation password do not match")]
        public string ConfirmPassword { get; set; } = string.Empty;

        // Doctor-specific fields (shown conditionally)
        [Display(Name = "Specialization")]
        public string? Specialization { get; set; }

        [Display(Name = "License Number")]
        public string? LicenseNumber { get; set; }

        [Display(Name = "License State")]
        public string? LicenseState { get; set; }

        [Display(Name = "License Issue Date")]
        public DateTime? LicenseIssueDate { get; set; }

        [Display(Name = "License Expiry Date")]
        public DateTime? LicenseExpiryDate { get; set; }

        [Display(Name = "NPI Number")]
        public string? NpiNumber { get; set; }

        [Display(Name = "Professional Title")]
        public string? ProfessionalTitle { get; set; }

        [Display(Name = "Years of Experience")]
        [Range(0, 60)]
        public int? Experience { get; set; }

        [Display(Name = "Qualifications")]
        public string? Qualifications { get; set; }

        [Display(Name = "Education & Training")]
        public string? EducationTraining { get; set; }

        [Display(Name = "Board Certifications")]
        public string? BoardCertifications { get; set; }

        [Display(Name = "Consultation Fee")]
        [Range(0, 10000)]
        public decimal? ConsultationFee { get; set; }
    }
}