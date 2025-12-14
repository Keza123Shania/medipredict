using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MediPredict.Data.DatabaseContext;
using MediPredict.Data.Enums;

namespace MediPredict.Services.Implementations
{
    public class AppointmentReminderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AppointmentReminderService> _logger;

        public AppointmentReminderService(
            IServiceProvider serviceProvider,
            ILogger<AppointmentReminderService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Appointment Reminder Service started at {Time}", DateTime.UtcNow);

            // Wait 30 seconds on startup before first check
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SendScheduledRemindersAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while sending appointment reminders");
                }

                // Check every 30 minutes for pending reminders
                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }

            _logger.LogInformation("Appointment Reminder Service stopped at {Time}", DateTime.UtcNow);
        }

        private async Task SendScheduledRemindersAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var now = DateTime.UtcNow;
            _logger.LogInformation("Checking for reminders to send at {Time}", now);

            // Get all scheduled appointments that haven't occurred yet - optimized query
            var upcomingAppointments = await context.Appointments
                .AsNoTracking()
                .Where(a => a.Status == AppointmentStatus.Scheduled && a.AppointmentDate > now)
                .Select(a => new {
                    Appointment = a,
                    PatientEmail = a.Patient.User.Email,
                    PatientName = a.Patient.User.FirstName + " " + a.Patient.User.LastName,
                    DoctorName = a.Doctor.User.FirstName + " " + a.Doctor.User.LastName,
                    DoctorSpecialization = a.Doctor.Specialization,
                    SentNotificationTypes = a.Notifications.Where(n => n.IsSent).Select(n => n.Type).ToList()
                })
                .ToListAsync();

            _logger.LogInformation("Found {Count} scheduled appointments to evaluate", upcomingAppointments.Count);

            foreach (var item in upcomingAppointments)
            {
                try
                {
                    var appointment = item.Appointment;
                    var timeUntilAppointment = appointment.AppointmentDate - now;
                    var hoursUntilAppointment = timeUntilAppointment.TotalHours;
                    var daysUntilAppointment = timeUntilAppointment.TotalDays;

                    _logger.LogDebug("Appointment {Id}: {Hours} hours until appointment ({Days} days)",
                        appointment.Id, hoursUntilAppointment, daysUntilAppointment);

                    // Check if reminder already sent by checking NotificationLog
                    var sentNotifications = item.SentNotificationTypes;

                    // 3-WEEK REMINDER (21 days before)
                    if (!sentNotifications.Contains(NotificationType.AppointmentReminder3Weeks) && daysUntilAppointment <= 21 && daysUntilAppointment > 20)
                    {
                        await SendReminderEmailOptimized(appointment.Id, item.PatientEmail, item.PatientName, item.DoctorName, 
                            item.DoctorSpecialization, appointment.AppointmentDate, emailService, context, NotificationType.AppointmentReminder3Weeks);
                        _logger.LogInformation("3-week reminder sent for appointment {Id}", appointment.Id);
                    }
                    // 3-DAY REMINDER (72 hours before)
                    else if (!sentNotifications.Contains(NotificationType.AppointmentReminder3Days) && hoursUntilAppointment <= 72 && hoursUntilAppointment > 48)
                    {
                        await SendReminderEmailOptimized(appointment.Id, item.PatientEmail, item.PatientName, item.DoctorName, 
                            item.DoctorSpecialization, appointment.AppointmentDate, emailService, context, NotificationType.AppointmentReminder3Days);
                        _logger.LogInformation("3-day reminder sent for appointment {Id}", appointment.Id);
                    }
                    // 24-HOUR REMINDER (1 day before)
                    else if (!sentNotifications.Contains(NotificationType.AppointmentReminder1Day) && hoursUntilAppointment <= 26 && hoursUntilAppointment > 6)
                    {
                        await SendReminderEmailOptimized(appointment.Id, item.PatientEmail, item.PatientName, item.DoctorName, 
                            item.DoctorSpecialization, appointment.AppointmentDate, emailService, context, NotificationType.AppointmentReminder1Day);
                        _logger.LogInformation("24-hour reminder sent for appointment {Id}", appointment.Id);
                    }
                    // SAME-DAY REMINDER (2-3 hours before)
                    else if (!sentNotifications.Contains(NotificationType.AppointmentReminderSameDay) && hoursUntilAppointment <= 3 && hoursUntilAppointment > 0.5)
                    {
                        await SendReminderEmailOptimized(appointment.Id, item.PatientEmail, item.PatientName, item.DoctorName, 
                            item.DoctorSpecialization, appointment.AppointmentDate, emailService, context, NotificationType.AppointmentReminderSameDay);
                        _logger.LogInformation("Same-day reminder sent for appointment {Id}", appointment.Id);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending reminder for appointment {Id}", item.Appointment.Id);
                }
            }
        }

        private async Task SendReminderEmailOptimized(
            Guid appointmentId,
            string patientEmail,
            string patientName,
            string doctorName,
            string doctorSpecialization,
            DateTime appointmentDate,
            IEmailService emailService,
            ApplicationDbContext context,
            NotificationType notificationType)
        {
            try
            {
                // Convert UTC to local time for display
                var localAppointmentTime = appointmentDate.ToLocalTime();
                var timeSlot = localAppointmentTime.ToString("hh:mm tt");

                // Send email
                await emailService.SendAppointmentReminderEmailAsync(
                    patientEmail,
                    patientName,
                    doctorName,
                    localAppointmentTime.Date,
                    timeSlot,
                    "Medical Center" // Simplified address
                );

                // Get patient user ID for this appointment
                var patientUserId = await context.Appointments
                    .Where(a => a.Id == appointmentId)
                    .Select(a => a.Patient.UserId)
                    .FirstOrDefaultAsync();

                // Log notification in NotificationLog
                var notificationLog = new Data.Models.NotificationLog
                {
                    Type = notificationType,
                    UserId = patientUserId,
                    AppointmentId = appointmentId,
                    RecipientEmail = patientEmail,
                    Subject = $"Appointment Reminder - {notificationType}",
                    MessageBody = $"Reminder for appointment with {doctorName} on {localAppointmentTime.Date:MMM dd, yyyy} at {timeSlot}",
                    IsSent = true,
                    SentAt = DateTime.UtcNow
                };

                context.NotificationLogs.Add(notificationLog);
                await context.SaveChangesAsync();

                _logger.LogInformation(
                    "Sent {ReminderType} reminder email to {Email} for appointment {Id}",
                    notificationType, patientEmail, appointmentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to send {ReminderType} reminder email for appointment {Id}",
                    notificationType, appointmentId);
                
                throw;
            }
        }
    }
}
