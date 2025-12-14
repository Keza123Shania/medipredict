using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;

namespace MediPredict.Services.Interfaces
{
    public interface IUserService
    {
        // Legacy methods (kept for backward compatibility)
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User?> GetUserWithProfileAsync(string userId);
        Task<bool> UpdateLastLoginAsync(string userId);
        Task<(bool success, string message)> RegisterUserAsync(UserRegistrationViewModel model);
        
        // Core profile methods
        Task<Patient?> GetPatientProfileAsync(string userId);
        Task<Doctor?> GetDoctorProfileAsync(string userId);
        Task<bool> UpdatePatientProfileAsync(string userId, Patient patient);
        Task<bool> UpdateDoctorProfileAsync(string userId, Doctor doctor);
        Task<Guid?> GetPatientIdAsync(string userId);
        Task<Guid?> GetDoctorIdAsync(string userId);

        // New methods for ApplicationUser
        Task<ApplicationUser?> GetApplicationUserAsync(string userId);
        Task<bool> UpdateUserProfileAsync(string userId, string firstName, string lastName, 
            DateTime dateOfBirth, MediPredict.Data.Enums.Gender gender, string? phoneNumber);
    }
}