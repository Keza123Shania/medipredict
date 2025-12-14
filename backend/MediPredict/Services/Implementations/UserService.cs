using Microsoft.EntityFrameworkCore;
using MediPredict.Data.DatabaseContext;
using MediPredict.Data.Models;
using MediPredict.Data.ViewModels;
using MediPredict.Data.Enums;
using MediPredict.Services.Interfaces;

namespace MediPredict.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserService> _logger;

        // REMOVED: UserManager<ApplicationUser> dependency
        public UserService(ApplicationDbContext context, ILogger<UserService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public Task<User?> GetUserByUsernameAsync(string username)
        {
            // Legacy method - not used with custom auth
            _logger.LogWarning("GetUserByUsernameAsync is deprecated");
            return Task.FromResult<User?>(null);
        }

        public Task<User?> GetUserWithProfileAsync(string userId)
        {
            // Legacy method - not used with custom auth
            _logger.LogWarning("GetUserWithProfileAsync is deprecated");
            return Task.FromResult<User?>(null);
        }

        public async Task<bool> UpdateLastLoginAsync(string userId)
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

        public Task<(bool success, string message)> RegisterUserAsync(UserRegistrationViewModel model)
        {
            // This is now handled by CustomAuthService
            _logger.LogWarning("RegisterUserAsync in UserService is deprecated - use CustomAuthService instead");
            return Task.FromResult((false, "Use CustomAuthService.RegisterAsync instead"));
        }

        public async Task<Patient?> GetPatientProfileAsync(string userId)
        {
            var userGuid = Guid.Parse(userId);
            return await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userGuid);
        }

        public async Task<Doctor?> GetDoctorProfileAsync(string userId)
        {
            var userGuid = Guid.Parse(userId);
            return await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userGuid);
        }

        public async Task<bool> UpdatePatientProfileAsync(string userId, Patient patient)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var existingPatient = await _context.Patients
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.UserId == userGuid);

                if (existingPatient == null)
                    return false;

                existingPatient.BloodGroup = patient.BloodGroup;
                existingPatient.Allergies = patient.Allergies;
                existingPatient.MedicalHistory = patient.MedicalHistory;
                existingPatient.EmergencyContact = patient.EmergencyContact;
                existingPatient.EmergencyPhone = patient.EmergencyPhone;
                existingPatient.User.Address = patient.User.Address;
                existingPatient.User.ProfilePicture = patient.User.ProfilePicture;
                existingPatient.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update patient profile for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> UpdateDoctorProfileAsync(string userId, Doctor doctor)
        {
            try
            {
                var userGuid = Guid.Parse(userId);
                var existingDoctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.UserId == userGuid);

                if (existingDoctor == null)
                    return false;

                existingDoctor.Specialization = doctor.Specialization;
                existingDoctor.Qualifications = doctor.Qualifications;
                existingDoctor.Experience = doctor.Experience;
                existingDoctor.LicenseNumber = doctor.LicenseNumber;
                existingDoctor.ConsultationFee = doctor.ConsultationFee;
                existingDoctor.Bio = doctor.Bio;
                existingDoctor.AvailableDays = doctor.AvailableDays;
                existingDoctor.AvailableTimeStart = doctor.AvailableTimeStart;
                existingDoctor.AvailableTimeEnd = doctor.AvailableTimeEnd;
                existingDoctor.User.Address = doctor.User.Address;
                existingDoctor.User.ProfilePicture = doctor.User.ProfilePicture;
                existingDoctor.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update doctor profile for user {UserId}", userId);
                return false;
            }
        }

        public async Task<Guid?> GetPatientIdAsync(string userId)
        {
            var userGuid = Guid.Parse(userId);
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == userGuid);
            return patient?.Id;
        }

        public async Task<Guid?> GetDoctorIdAsync(string userId)
        {
            var userGuid = Guid.Parse(userId);
            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.UserId == userGuid);
            return doctor?.Id;
        }

        public async Task<ApplicationUser?> GetApplicationUserAsync(string userId)
        {
            var userGuid = Guid.Parse(userId);
            return await _context.Users
                .Include(u => u.Patient)
                .Include(u => u.Doctor)
                .FirstOrDefaultAsync(u => u.Id == userGuid);
        }

        public async Task<bool> UpdateUserProfileAsync(string userId, string firstName, string lastName,
            DateTime dateOfBirth, Gender gender, string? phoneNumber)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return false;

                user.FirstName = firstName;
                user.LastName = lastName;
                user.DateOfBirth = dateOfBirth;
                user.Gender = gender;
                user.PhoneNumber = phoneNumber;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update user profile for user {UserId}", userId);
                return false;
            }
        }
    }
}