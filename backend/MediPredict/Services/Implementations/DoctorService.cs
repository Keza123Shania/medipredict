using MediPredict.Data.Models;
using MediPredict.Services.Interfaces;
using MediPredict.Services.Implementations;

namespace MediPredict.Services.Implementations
{
    public class DoctorService : IDoctorService
    {
        private readonly IDatabaseService _databaseService;

        public DoctorService(IDatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        public async Task<List<Doctor>> SearchDoctorsAsync(string? specialization = null, string? name = null, bool? isVerified = null, int page = 1, int pageSize = 10)
        {
            var doctors = await _databaseService.QueryAsync<Doctor>(
                "spDoctor_Search",
                new
                {
                    Specialization = specialization,
                    Name = name,
                    IsVerified = isVerified,
                    PageSize = pageSize,
                    PageNumber = page
                }
            );
            return doctors.ToList();
        }

        public async Task<Doctor?> GetDoctorByIdAsync(Guid doctorId)
        {
            // This would need a new stored procedure
            // For now, search and return first match (simplified)
            var doctors = await SearchDoctorsAsync();
            return doctors.FirstOrDefault(d => d.Id == doctorId);
        }

        public async Task<List<Doctor>> GetPendingVerificationsAsync(int page = 1, int pageSize = 10)
        {
            var doctors = await _databaseService.QueryAsync<Doctor>(
                "spAdmin_GetPendingVerifications",
                new { PageSize = pageSize, PageNumber = page }
            );
            return doctors.ToList();
        }

        public async Task<bool> VerifyDoctorAsync(int doctorId, bool isVerified)
        {
            var result = await _databaseService.ExecuteAsync(
                "spAdmin_VerifyDoctor",
                new { DoctorId = doctorId, IsVerified = isVerified }
            );
            return result > 0;
        }
    }
}