using MediPredict.Services.Interfaces;
using MediPredict.Helpers;
using System.Security.Claims;

namespace MediPredict.Middleware
{
    public class CustomAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;

        public CustomAuthenticationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ICustomAuthService authService)
        {
            var userId = context.Session.GetString("UserId");

            if (!string.IsNullOrEmpty(userId))
            {
                var user = await authService.GetUserByIdAsync(Guid.Parse(userId));

                if (user != null && user.IsActive)
                {
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Name, user.UserName),
                        new Claim(ClaimTypes.Email, user.Email),
                        new Claim(ClaimTypes.Role, user.Role?.Name ?? "Unknown"),
                        new Claim("UserId", user.Id.ToString()),
                        new Claim("FullName", user.FullName)
                    };

                    var identity = new ClaimsIdentity(claims, "CustomAuth");
                    context.User = new ClaimsPrincipal(identity);
                }
            }

            await _next(context);
        }
    }
}