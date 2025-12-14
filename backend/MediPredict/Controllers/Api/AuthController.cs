using Microsoft.AspNetCore.Mvc;
using MediPredict.Services.Interfaces;
using MediPredict.Data.ViewModels;
using MediPredict.Data.Models;
using MediPredict.Data.Enums;
using MediPredict.Helpers;

namespace MediPredict.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ICustomAuthService _authService;
        private readonly IUserService _userService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(ICustomAuthService authService, IUserService userService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<object>>> Register([FromBody] UserRegistrationViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Invalid registration data",
                        Data = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    });
                }

                var (success, message, user) = await _authService.RegisterAsync(model);
                
                if (success)
                {
                    return Ok(new ApiResponse<object>
                    {
                        Success = true,
                        Message = message,
                        Data = new { 
                            success = true,
                            userId = user?.Id,
                            email = user?.Email
                        }
                    });
                }

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred during registration"
                });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<object>>> Login([FromBody] LoginViewModel model)
        {
            try
            {
                var (success, message, user) = await _authService.LoginAsync(model.Email, model.Password);
                
                if (success && user != null && user.IsActive)
                {
                    // Set session data for authentication
                    HttpContext.Session.SetString("UserId", user.Id.ToString());
                    HttpContext.Session.SetString("UserEmail", user.Email);
                    HttpContext.Session.SetString("UserRole", user.Role?.Name ?? "Unknown");
                    
                    // Update last login
                    await _authService.UpdateLastLoginAsync(user.Id);
                    
                    _logger.LogInformation("Session created for user {Email} with ID {UserId}", user.Email, user.Id);
                    
                    return Ok(new ApiResponse<object>
                    {
                        Success = true,
                        Message = "Login successful",
                        Data = new
                        {
                            userId = user.Id,
                            email = user.Email,
                            firstName = user.FirstName,
                            lastName = user.LastName,
                            role = user.Role?.Name ?? "Unknown"
                        }
                    });
                }

                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid email or password"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred during login"
                });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Clear session
            HttpContext.Session.Clear();
            
            return Ok(new ApiResponse
            {
                Success = true,
                Message = "Logout successful"
            });
        }

        [HttpGet("current-user")]
        public async Task<ActionResult<ApiResponse<ApplicationUser>>> GetCurrentUser([FromQuery] string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse<ApplicationUser>
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                var userGuid = Guid.Parse(userId);
                var user = await _authService.GetUserByIdAsync(userGuid);
                
                if (user == null)
                {
                    return NotFound(new ApiResponse<ApplicationUser>
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                return Ok(new ApiResponse<ApplicationUser>
                {
                    Success = true,
                    Message = "User retrieved successfully",
                    Data = user
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user");
                return StatusCode(500, new ApiResponse<ApplicationUser>
                {
                    Success = false,
                    Message = "An error occurred while retrieving user"
                });
            }
        }
    }

    public class LoginViewModel
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
