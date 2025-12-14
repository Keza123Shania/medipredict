using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;

namespace MediPredict.Services.Interfaces
{
    public interface ICustomAuthService
    {
        Task<(bool Success, string Message, ApplicationUser? User)> RegisterAsync(UserRegistrationViewModel model);
        Task<(bool Success, string Message, ApplicationUser? User)> LoginAsync(string email, string password);
        Task<ApplicationUser?> GetUserByIdAsync(Guid userId);
        Task<ApplicationUser?> GetUserByEmailAsync(string email);
        Task<bool> UpdateLastLoginAsync(Guid userId);
        string HashPassword(string password);
        bool VerifyPassword(string password, string passwordHash);
    }
}