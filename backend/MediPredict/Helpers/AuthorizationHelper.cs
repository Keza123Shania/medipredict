namespace MediPredict.Helpers
{
    public static class AuthorizationHelper
    {
        public static bool IsAuthenticated(HttpContext context)
        {
            return !string.IsNullOrEmpty(context.Session.GetString("UserId"));
        }

        public static string? GetUserId(HttpContext context)
        {
            return context.Session.GetString("UserId");
        }

        public static string? GetUserRole(HttpContext context)
        {
            return context.Session.GetString("UserRole");
        }

        public static string? GetUserName(HttpContext context)
        {
            return context.Session.GetString("UserName");
        }

        public static bool IsInRole(HttpContext context, string role)
        {
            return GetUserRole(context) == role;
        }
    }
}