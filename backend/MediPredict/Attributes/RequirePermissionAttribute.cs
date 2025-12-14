using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using MediPredict.Services;

namespace MediPredict.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class RequirePermissionAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string[] _permissions;

        public RequirePermissionAttribute(params string[] permissions)
        {
            _permissions = permissions;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<RequirePermissionAttribute>>();
            
            // Get userId from session (since we're using session-based auth)
            var userIdString = context.HttpContext.Session.GetString("UserId");
            
            logger.LogInformation("RequirePermission check - UserId from session: {UserIdString}, Required permissions: {Permissions}", 
                userIdString ?? "NULL", string.Join(", ", _permissions));

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                logger.LogWarning("Authorization failed - No valid UserId in session");
                context.Result = new UnauthorizedObjectResult(new
                {
                    success = false,
                    message = "Authentication required"
                });
                return;
            }

            var permissionService = context.HttpContext.RequestServices
                .GetRequiredService<IPermissionService>();

            // Check if user has ANY of the specified permissions (OR logic)
            foreach (var permission in _permissions)
            {
                logger.LogInformation("Checking permission: {Permission} for user {UserId}", permission, userId);
                var hasPermission = await permissionService.HasPermissionAsync(userId, permission);
                logger.LogInformation("Permission {Permission} check result: {Result}", permission, hasPermission);
                
                if (hasPermission)
                {
                    logger.LogInformation("Authorization successful - User {UserId} has permission {Permission}", userId, permission);
                    return; // User has at least one required permission
                }
            }

            // User doesn't have any of the required permissions
            logger.LogWarning("Authorization failed - User {UserId} does not have any of these permissions: {Permissions}", 
                userId, string.Join(", ", _permissions));
            context.Result = new ObjectResult(new
            {
                success = false,
                message = $"Permission denied. Required permission(s): {string.Join(" OR ", _permissions)}"
            })
            {
                StatusCode = 403
            };
        }
    }
}
