using System;
using System.ComponentModel.DataAnnotations;
using MediPredict.Data.Enums;

namespace MediPredict.Data.Models
{
    /// <summary>
    /// Abstract base class containing common person attributes.
    /// Not mapped to a database table - used for inheritance only.
    /// </summary>
    public abstract class Person
    {
        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public Gender Gender { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(500)]
        public string? ProfilePicture { get; set; }

        // Computed property
        public string FullName => $"{FirstName} {LastName}";

        // Age calculation helper
        public int Age
        {
            get
            {
                var today = DateTime.Today;
                var age = today.Year - DateOfBirth.Year;
                if (DateOfBirth.Date > today.AddYears(-age)) age--;
                return age;
            }
        }
    }
}
