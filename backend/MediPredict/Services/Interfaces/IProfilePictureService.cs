using Microsoft.AspNetCore.Mvc;

namespace MediPredict.Services.Interfaces
{
    public interface IProfilePictureService
    {
        Task<(bool Success, string Message, string? ImageUrl)> UploadProfilePictureAsync(
            string userId, 
            IFormFile file, 
            string userRole);
        
        Task<bool> DeleteProfilePictureAsync(string userId, string userRole);
        
        string GetProfilePictureUrl(string? profilePicturePath, string userRole);
        
        string GetDefaultProfilePictureUrl(string userRole);
    }
}
