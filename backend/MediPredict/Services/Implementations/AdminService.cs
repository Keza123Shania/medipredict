using MediPredict.Data.Models;
using MediPredict.Services.Interfaces;
using MediPredict.Services.Implementations;

namespace MediPredict.Services.Implementations
{
    public class AdminService : IAdminService
    {
        private readonly IDatabaseService _databaseService;

        public AdminService(IDatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        public async Task<DashboardStats> GetDashboardStatsAsync()
        {
            var result = await _databaseService.QuerySingleAsync<DashboardStats>(
                "spAdmin_GetDashboardStats"
            );
            return result ?? new DashboardStats();
        }

        public async Task<List<User>> GetAllUsersAsync(string? role = null, bool? isActive = null, int page = 1, int pageSize = 10)
        {
            var users = await _databaseService.QueryAsync<User>(
                "spAdmin_GetAllUsers",
                new
                {
                    Role = role,
                    IsActive = isActive,
                    PageSize = pageSize,
                    PageNumber = page
                }
            );
            return users.ToList();
        }

        public async Task<bool> UpdateUserStatusAsync(string userId, bool isActive)
        {
            var result = await _databaseService.ExecuteAsync(
                "spAdmin_UpdateUserStatus",
                new { UserId = userId, IsActive = isActive }
            );
            return result > 0;
        }
    }
}