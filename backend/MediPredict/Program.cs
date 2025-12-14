using MediPredict.Data.DatabaseContext;
using MediPredict.Middleware;
using MediPredict.Services.Implementations;
using MediPredict.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("Logs/medipredict-api-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

// Register custom services
builder.Services.AddScoped<ICustomAuthService, CustomAuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<MediPredict.Services.Implementations.IDatabaseService, MediPredict.Services.Implementations.DatabaseService>();
builder.Services.AddScoped<IAIService, AIService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IProfilePictureService, ProfilePictureService>();
builder.Services.AddScoped<MediPredict.Services.IEmailService, MediPredict.Services.Implementations.EmailService>();
builder.Services.AddScoped<MediPredict.Services.IPermissionService, MediPredict.Services.PermissionService>();

// Add background services
builder.Services.AddHostedService<MediPredict.Services.Implementations.AppointmentReminderService>();

// Add HttpClient for ML service integration
builder.Services.AddHttpClient();

// Add Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "MediPredict API",
        Version = "v1",
        Description = "AI-Powered Medical Diagnosis and Appointment Management System API",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "MediPredict Team",
            Email = "support@medipredict.com"
        }
    });
});

// Add CORS policy for frontend integration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", corsBuilder =>
    {
        corsBuilder.SetIsOriginAllowed(_ => true) // <--- The Magic Line: Allows ANY domain
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials(); // Required for your Session cookies
    });
});

// Add session support (for custom authentication)
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.Name = ".MediPredict.Session";
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

// Configure file upload limits
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 52428800; // 50MB
});

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 52428800; // 50MB
});

var app = builder.Build();

// Configure the HTTP request pipeline
// Allow Swagger in ALL environments for the demo
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "MediPredict API V1");
    c.RoutePrefix = "swagger"; 
});

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/error");
    // app.UseHsts(); // Optional: Comment this out if you have SSL issues on Railway
}

// Enable static files for file uploads (profile pictures, etc.)
app.UseStaticFiles();

// Enable CORS
app.UseCors("AllowAll");

app.UseRouting();

// Enable session before authentication
app.UseSession();

// Use custom authentication middleware
app.UseMiddleware<CustomAuthenticationMiddleware>();

app.UseAuthorization();

app.MapControllers();

// Add a simple health check endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    version = "1.0.0"
}));

// Seed permissions and roles
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await MediPredict.Data.PermissionSeeder.SeedPermissionsAndRolesAsync(context);
    await MediPredict.Data.PermissionSeeder.AddMissingPermissionsAsync(context);
}

app.Run();