using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;

namespace MediPredict.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task<(bool Success, string Message, ApplicationUser? User)> RegisterUserAsync(UserRegistrationViewModel model);
        Task<ApplicationUser?> GetUserByIdAsync(string userId);
        Task<ApplicationUser?> GetUserByEmailAsync(string email);
        Task<bool> UpdateLastLoginAsync(string userId);
        Task<string> GetDashboardUrlForUserAsync(ApplicationUser user);
    }
}