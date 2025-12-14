using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediPredict.Data.DatabaseContext;
using MediPredict.Services.Interfaces;

namespace MediPredict.Services.Implementations
{
    public class ProfilePictureService : IProfilePictureService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ProfilePictureService> _logger;
        
        private const string UPLOAD_DIRECTORY = "uploads/profile-pictures";
        private const long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        private readonly string[] ALLOWED_EXTENSIONS = { ".jpg", ".jpeg", ".png", ".gif" };
        private readonly string[] ALLOWED_MIME_TYPES = { "image/jpeg", "image/jpg", "image/png", "image/gif" };

        public ProfilePictureService(
            ApplicationDbContext context, 
            IWebHostEnvironment environment, 
            ILogger<ProfilePictureService> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        public async Task<(bool Success, string Message, string? ImageUrl)> UploadProfilePictureAsync(
            string userId, 
            IFormFile file, 
            string userRole)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(userId))
                    return (false, "User ID is required", null);

                if (file == null || file.Length == 0)
                    return (false, "No file provided", null);

                // Validate file size
                if (file.Length > MAX_FILE_SIZE)
                    return (false, "File size must be less than 5MB", null);

                // Validate file type
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!ALLOWED_EXTENSIONS.Contains(fileExtension))
                    return (false, "Invalid file type. Only JPEG, PNG, and GIF are allowed", null);

                if (!ALLOWED_MIME_TYPES.Contains(file.ContentType.ToLower()))
                    return (false, "Invalid file type. Only JPEG, PNG, and GIF are allowed", null);

                // Get user from database
                var userGuid = Guid.Parse(userId);
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userGuid);
                if (user == null)
                    return (false, "User not found", null);

                // Create upload directory if it doesn't exist
                var uploadsPath = Path.Combine(_environment.WebRootPath, UPLOAD_DIRECTORY);
                Directory.CreateDirectory(uploadsPath);

                // Delete old profile picture if exists
                await DeleteOldProfilePictureAsync(user.ProfilePicture);

                // Generate unique filename
                var fileName = $"{userRole.ToLower()}_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Update user profile picture
                var imageUrl = $"/{UPLOAD_DIRECTORY}/{fileName}";
                user.ProfilePicture = imageUrl;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Profile picture uploaded for user {UserId}", userId);
                return (true, "Profile picture uploaded successfully", imageUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile picture for user {UserId}", userId);
                return (false, "An error occurred while uploading the profile picture", null);
            }
        }

        public async Task<bool> DeleteProfilePictureAsync(string userId, string userRole)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userGuid);
                if (user == null) return false;

                await DeleteOldProfilePictureAsync(user.ProfilePicture);

                user.ProfilePicture = null;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting profile picture for user {UserId}", userId);
                return false;
            }
        }

        public string GetProfilePictureUrl(string? profilePicturePath, string userRole)
        {
            if (!string.IsNullOrEmpty(profilePicturePath))
            {
                return profilePicturePath;
            }

            return GetDefaultProfilePictureUrl(userRole);
        }

        public string GetDefaultProfilePictureUrl(string userRole)
        {
            return userRole.ToLower() switch
            {
                "admin" => "/images/default-admin.svg",
                "doctor" => "/images/default-doctor.svg",
                "patient" => "/images/default-patient.svg",
                _ => "/images/default-user.svg"
            };
        }

        private async Task DeleteOldProfilePictureAsync(string? profilePicturePath)
        {
            if (string.IsNullOrEmpty(profilePicturePath)) return;

            try
            {
                var oldFilePath = Path.Combine(_environment.WebRootPath, profilePicturePath.TrimStart('/'));
                if (File.Exists(oldFilePath))
                {
                    File.Delete(oldFilePath);
                    _logger.LogInformation("Deleted old profile picture: {FilePath}", oldFilePath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete old profile picture: {ProfilePicturePath}", profilePicturePath);
                // Don't throw - this shouldn't stop the upload process
            }
        }
    }
}
