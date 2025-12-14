using Microsoft.EntityFrameworkCore;
using MediPredict.Data.DatabaseContext;
using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;
using MediPredict.Data.Enums;
using MediPredict.Helpers;
using MediPredict.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace MediPredict.Services.Implementations
{
    public class CustomAuthService : ICustomAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CustomAuthService> _logger;

        public CustomAuthService(ApplicationDbContext context, ILogger<CustomAuthService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<(bool Success, string Message, ApplicationUser? User)> RegisterAsync(UserRegistrationViewModel model)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _logger.LogInformation("Starting registration for {Email} as {Role}", model.Email, model.Role);

                // Validate role
                if (model.Role != "Patient" && model.Role != "Doctor")
                {
                    return (false, "Invalid role selected.", null);
                }

                // Get the role ID
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == model.Role);
                if (role == null)
                {
                    return (false, "Invalid role selected.", null);
                }

                // Check if email already exists
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
                if (existingUser != null)
                {
                    return (false, "Email is already registered.", null);
                }

                // Additional validation for doctors
                if (model.Role == "Doctor")
                {
                    if (string.IsNullOrWhiteSpace(model.Specialization) ||
                        string.IsNullOrWhiteSpace(model.LicenseNumber) ||
                        string.IsNullOrWhiteSpace(model.Qualifications) ||
                        !model.Experience.HasValue ||
                        !model.ConsultationFee.HasValue)
                    {
                        return (false, "All doctor fields are required.", null);
                    }

                    // Check if license number is already taken
                    var existingLicense = await _context.Doctors
                        .AnyAsync(d => d.LicenseNumber == model.LicenseNumber);

                    if (existingLicense)
                    {
                        return (false, "License number is already registered.", null);
                    }
                }

                // Create user
                var user = new ApplicationUser
                {
                    UserName = model.Email,
                    Email = model.Email,
                    PasswordHash = HashPassword(model.Password),
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    DateOfBirth = model.DateOfBirth,
                    Gender = EnumHelper.ToGender(model.Gender),
                    RoleId = role.Id,
                    PhoneNumber = model.PhoneNumber,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Create role-specific profile
                if (model.Role == "Patient")
                {
                    var patient = new Patient
                    {
                        UserId = user.Id,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Patients.Add(patient);
                }
                else if (model.Role == "Doctor")
                {
                    var doctor = new Doctor
                    {
                        UserId = user.Id,
                        Specialization = model.Specialization!,
                        LicenseNumber = model.LicenseNumber!,
                        LicenseState = model.LicenseState,
                        LicenseIssueDate = model.LicenseIssueDate,
                        LicenseExpiryDate = model.LicenseExpiryDate,
                        NpiNumber = model.NpiNumber,
                        ProfessionalTitle = model.ProfessionalTitle,
                        Qualifications = model.Qualifications!,
                        EducationTraining = model.EducationTraining,
                        BoardCertifications = model.BoardCertifications,
                        Experience = model.Experience!.Value,
                        ConsultationFee = model.ConsultationFee!.Value,
                        IsVerified = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Doctors.Add(doctor);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Registration successful for {Email} as {Role}", model.Email, model.Role);
                return (true, "Registration successful!", user);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Registration failed for {Email}", model.Email);
                return (false, "An error occurred during registration. Please try again.", null);
            }
        }

        public async Task<(bool Success, string Message, ApplicationUser? User)> LoginAsync(string email, string password)
        {
            try
            {
                _logger.LogInformation("Login attempt for {Email}", email);

                var user = await _context.Users
                    .Include(u => u.Role)
                    .Include(u => u.Patient)
                    .Include(u => u.Doctor)
                    .FirstOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    _logger.LogWarning("Login failed: User not found for {Email}", email);
                    return (false, "Invalid email or password.", null);
                }

                if (!user.IsActive)
                {
                    _logger.LogWarning("Login failed: Account inactive for {Email}", email);
                    return (false, "Your account has been deactivated.", null);
                }

                if (!VerifyPassword(password, user.PasswordHash))
                {
                    _logger.LogWarning("Login failed: Invalid password for {Email}", email);
                    return (false, "Invalid email or password.", null);
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Login successful for {Email}", email);
                return (true, "Login successful!", user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login error for {Email}", email);
                return (false, "An error occurred during login. Please try again.", null);
            }
        }

        public async Task<ApplicationUser?> GetUserByIdAsync(Guid userId)
        {
            return await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Patient)
                .Include(u => u.Doctor)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<ApplicationUser?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Patient)
                .Include(u => u.Doctor)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<bool> UpdateLastLoginAsync(Guid userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.LastLoginAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update last login for user {UserId}", userId);
            }
            return false;
        }

        public string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        public bool VerifyPassword(string password, string passwordHash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput == passwordHash;
        }
    }
}