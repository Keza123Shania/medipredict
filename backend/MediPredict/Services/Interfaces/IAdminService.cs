using MediPredict.Data.Models;

namespace MediPredict.Services.Interfaces
{
    public interface IAdminService
    {
        Task<DashboardStats> GetDashboardStatsAsync();
        Task<List<User>> GetAllUsersAsync(string? role = null, bool? isActive = null, int page = 1, int pageSize = 10);
        Task<bool> UpdateUserStatusAsync(string userId, bool isActive);
    }

    public class DashboardStats
    {
        public int TotalPatients { get; set; }
        public int TotalDoctors { get; set; }
        public int VerifiedDoctors { get; set; }
        public int ScheduledAppointments { get; set; }
        public int TodayAppointments { get; set; }
        public int TodayPredictions { get; set; }
        public int PendingConsultations { get; set; }
    }
}