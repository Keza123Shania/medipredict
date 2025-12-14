using MediPredict.Data.DatabaseContext;
using MediPredict.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace MediPredict.Services
{
    public interface IPermissionService
    {
        Task<bool> HasPermissionAsync(Guid userId, string permissionName);
        Task<List<string>> GetUserPermissionsAsync(Guid userId);
        Task<bool> AssignPermissionToUserAsync(Guid userId, Guid permissionId);
        Task<bool> RemovePermissionFromUserAsync(Guid userId, Guid permissionId);
        Task<bool> AssignPermissionToRoleAsync(Guid roleId, Guid permissionId);
        Task<bool> RemovePermissionFromRoleAsync(Guid roleId, Guid permissionId);
    }

    public class PermissionService : IPermissionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PermissionService> _logger;

        public PermissionService(ApplicationDbContext context, ILogger<PermissionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> HasPermissionAsync(Guid userId, string permissionName)
        {
            try
            {
                _logger.LogInformation("Checking permission {PermissionName} for user {UserId}", permissionName, userId);
                
                var user = await _context.Users
                    .Include(u => u.Role)
                        .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
                    .Include(u => u.UserPermissions)
                        .ThenInclude(up => up.Permission)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    _logger.LogWarning("User {UserId} not found in database", userId);
                    return false;
                }

                _logger.LogInformation("User {UserId} found, Role: {RoleName}, RoleId: {RoleId}", 
                    userId, user.Role?.Name ?? "NULL", user.RoleId);

                // Check direct user permissions
                var directPermissionCount = user.UserPermissions?.Count ?? 0;
                _logger.LogInformation("User has {Count} direct permissions", directPermissionCount);
                
                var hasDirectPermission = user.UserPermissions?
                    .Any(up => up.Permission.Name == permissionName) ?? false;

                if (hasDirectPermission)
                {
                    _logger.LogInformation("User {UserId} has direct permission {PermissionName}", userId, permissionName);
                    return true;
                }

                // Check role-based permissions
                var rolePermissionCount = user.Role?.RolePermissions?.Count ?? 0;
                _logger.LogInformation("User's role has {Count} permissions", rolePermissionCount);
                
                if (user.Role != null && user.Role.RolePermissions != null)
                {
                    var rolePermissionNames = user.Role.RolePermissions
                        .Select(rp => rp.Permission?.Name)
                        .Where(n => n != null)
                        .ToList();
                    _logger.LogInformation("Role permissions: {Permissions}", string.Join(", ", rolePermissionNames));
                }
                
                var hasRolePermission = user.Role?.RolePermissions
                    ?.Any(rp => rp.Permission?.Name == permissionName) ?? false;

                _logger.LogInformation("Permission check result for {PermissionName}: {Result}", permissionName, hasRolePermission);
                return hasRolePermission;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking permission {PermissionName} for user {UserId}", permissionName, userId);
                return false;
            }
        }

        public async Task<List<string>> GetUserPermissionsAsync(Guid userId)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Role)
                        .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
                    .Include(u => u.UserPermissions)
                        .ThenInclude(up => up.Permission)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    return new List<string>();

                var permissions = new HashSet<string>();

                // Add role permissions
                if (user.Role?.RolePermissions != null)
                {
                    foreach (var rp in user.Role.RolePermissions)
                    {
                        permissions.Add(rp.Permission.Name);
                    }
                }

                // Add direct user permissions
                foreach (var up in user.UserPermissions)
                {
                    permissions.Add(up.Permission.Name);
                }

                return permissions.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions for user {UserId}", userId);
                return new List<string>();
            }
        }

        public async Task<bool> AssignPermissionToUserAsync(Guid userId, Guid permissionId)
        {
            try
            {
                var existingPermission = await _context.UserPermissions
                    .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permissionId);

                if (existingPermission != null)
                    return true; // Already assigned

                var userPermission = new UserPermission
                {
                    UserId = userId,
                    PermissionId = permissionId,
                    AssignedAt = DateTime.UtcNow
                };

                _context.UserPermissions.Add(userPermission);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Assigned permission {PermissionId} to user {UserId}", permissionId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning permission {PermissionId} to user {UserId}", permissionId, userId);
                return false;
            }
        }

        public async Task<bool> RemovePermissionFromUserAsync(Guid userId, Guid permissionId)
        {
            try
            {
                var userPermission = await _context.UserPermissions
                    .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permissionId);

                if (userPermission == null)
                    return true; // Already removed

                _context.UserPermissions.Remove(userPermission);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Removed permission {PermissionId} from user {UserId}", permissionId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing permission {PermissionId} from user {UserId}", permissionId, userId);
                return false;
            }
        }

        public async Task<bool> AssignPermissionToRoleAsync(Guid roleId, Guid permissionId)
        {
            try
            {
                var existingPermission = await _context.RolePermissions
                    .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

                if (existingPermission != null)
                    return true; // Already assigned

                var rolePermission = new RolePermission
                {
                    RoleId = roleId,
                    PermissionId = permissionId,
                    AssignedAt = DateTime.UtcNow
                };

                _context.RolePermissions.Add(rolePermission);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Assigned permission {PermissionId} to role {RoleId}", permissionId, roleId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning permission {PermissionId} to role {RoleId}", permissionId, roleId);
                return false;
            }
        }

        public async Task<bool> RemovePermissionFromRoleAsync(Guid roleId, Guid permissionId)
        {
            try
            {
                var rolePermission = await _context.RolePermissions
                    .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

                if (rolePermission == null)
                    return true; // Already removed

                _context.RolePermissions.Remove(rolePermission);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Removed permission {PermissionId} from role {RoleId}", permissionId, roleId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing permission {PermissionId} from role {RoleId}", permissionId, roleId);
                return false;
            }
        }
    }
}
