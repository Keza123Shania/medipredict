using MediPredict.Data.Models;

namespace MediPredict.Services.Interfaces
{
    public interface IDoctorService
    {
        Task<List<Doctor>> SearchDoctorsAsync(string? specialization = null, string? name = null, bool? isVerified = null, int page = 1, int pageSize = 10);
        Task<Doctor?> GetDoctorByIdAsync(Guid doctorId);
        Task<List<Doctor>> GetPendingVerificationsAsync(int page = 1, int pageSize = 10);
        Task<bool> VerifyDoctorAsync(int doctorId, bool isVerified);
    }
}