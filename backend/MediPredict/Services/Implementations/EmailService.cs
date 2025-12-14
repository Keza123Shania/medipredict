using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace MediPredict.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            // Read SMTP settings from configuration
            _smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            _smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            _fromEmail = _configuration["EmailSettings:FromEmail"] ?? "noreply@medipredict.com";
            _fromName = _configuration["EmailSettings:FromName"] ?? "MediPredict";
            _smtpUsername = _configuration["EmailSettings:SmtpUsername"] ?? "";
            _smtpPassword = _configuration["EmailSettings:SmtpPassword"] ?? "";
        }

        public async Task SendAppointmentConfirmationEmailAsync(string toEmail, string patientName, 
            string doctorName, DateTime appointmentDate, string timeSlot, string confirmationNumber, 
            string reasonForVisit)
        {
            var subject = "Appointment Confirmation - MediPredict";
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                        .info-box {{ background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 5px; }}
                        .info-row {{ margin: 10px 0; }}
                        .label {{ font-weight: bold; color: #667eea; }}
                        .footer {{ text-align: center; margin-top: 30px; color: #777; font-size: 12px; }}
                        .button {{ background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>✓ Appointment Confirmed</h1>
                            <p>Your appointment has been successfully scheduled</p>
                        </div>
                        <div class='content'>
                            <p>Dear {patientName},</p>
                            <p>Your appointment has been confirmed. Here are the details:</p>
                            
                            <div class='info-box'>
                                <div class='info-row'>
                                    <span class='label'>Confirmation Number:</span> {confirmationNumber}
                                </div>
                                <div class='info-row'>
                                    <span class='label'>Doctor:</span> Dr. {doctorName}
                                </div>
                                <div class='info-row'>
                                    <span class='label'>Date:</span> {appointmentDate:MMMM dd, yyyy}
                                </div>
                                <div class='info-row'>
                                    <span class='label'>Time:</span> {timeSlot}
                                </div>
                                <div class='info-row'>
                                    <span class='label'>Reason for Visit:</span> {reasonForVisit}
                                </div>
                            </div>

                            <p><strong>Important Reminders:</strong></p>
                            <ul>
                                <li>Please arrive 10-15 minutes before your scheduled time</li>
                                <li>Bring any relevant medical records or test results</li>
                                <li>You will receive a reminder email 24 hours before your appointment</li>
                                <li>If you need to cancel or reschedule, please do so at least 24 hours in advance</li>
                            </ul>

                            <div style='text-align: center;'>
                                <p>Thank you for choosing MediPredict!</p>
                            </div>
                        </div>
                        <div class='footer'>
                            <p>This is an automated message from MediPredict. Please do not reply to this email.</p>
                            <p>&copy; 2024 MediPredict. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendAppointmentReminderEmailAsync(string toEmail, string patientName, 
            string doctorName, DateTime appointmentDate, string timeSlot, string doctorAddress)
        {
            var subject = "Appointment Reminder - Tomorrow at " + timeSlot;
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                        .reminder-box {{ background: #fff3cd; padding: 20px; margin: 15px 0; border-left: 4px solid #f59e0b; border-radius: 5px; }}
                        .info-box {{ background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 5px; }}
                        .info-row {{ margin: 10px 0; }}
                        .label {{ font-weight: bold; color: #667eea; }}
                        .footer {{ text-align: center; margin-top: 30px; color: #777; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>⏰ Appointment Reminder</h1>
                            <p>Your appointment is tomorrow!</p>
                        </div>
                        <div class='content'>
                            <p>Dear {patientName},</p>
                            
                            <div class='reminder-box'>
                                <h3 style='margin-top: 0; color: #f59e0b;'>Don't forget your appointment tomorrow!</h3>
                            </div>
                            
                            <div class='info-box'>
                                <div class='info-row'>
                                    <span class='label'>Doctor:</span> Dr. {doctorName}
                                </div>
                                <div class='info-row'>
                                    <span class='label'>Date:</span> {appointmentDate:MMMM dd, yyyy}
                                </div>
                                <div class='info-row'>
                                    <span class='label'>Time:</span> {timeSlot}
                                </div>
                                <div class='info-row'>
                                    <span class='label'>Location:</span> {doctorAddress}
                                </div>
                            </div>

                            <p><strong>Please Remember:</strong></p>
                            <ul>
                                <li>Arrive 10-15 minutes early</li>
                                <li>Bring valid ID and insurance card</li>
                                <li>Bring any medical records or test results</li>
                                <li>List of current medications</li>
                            </ul>

                            <p>If you need to cancel or reschedule, please log in to your MediPredict account or contact us immediately.</p>

                            <div style='text-align: center; margin-top: 30px;'>
                                <p>We look forward to seeing you!</p>
                            </div>
                        </div>
                        <div class='footer'>
                            <p>This is an automated reminder from MediPredict. Please do not reply to this email.</p>
                            <p>&copy; 2024 MediPredict. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendAppointmentCancellationEmailAsync(string toEmail, string patientName, 
            string doctorName, DateTime appointmentDate, string timeSlot)
        {
            var subject = "Appointment Cancelled - MediPredict";
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #6b7280 0%, #374151 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                        .info-box {{ background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #6b7280; border-radius: 5px; }}
                        .info-row {{ margin: 10px 0; }}
                        .label {{ font-weight: bold; color: #6b7280; }}
                        .footer {{ text-align: center; margin-top: 30px; color: #777; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Appointment Cancelled</h1>
                        </div>
                        <div class='content'>
                            <p>Dear {patientName},</p>
                            <p>Your appointment has been cancelled:</p>
                            
                            <div class='info-box'>
                                <div class='info-row'>
                                    <span class='label'>Doctor:</span> Dr. {doctorName}
                                </div>
                                <div class='info-row'>
                                    <span class='label'>Date:</span> {appointmentDate:MMMM dd, yyyy}
                                </div>
                                <div class='info-row'>
                                    <span class='label'>Time:</span> {timeSlot}
                                </div>
                            </div>

                            <p>If you'd like to reschedule, please log in to your MediPredict account to book a new appointment.</p>

                            <div style='text-align: center; margin-top: 30px;'>
                                <p>Thank you for using MediPredict</p>
                            </div>
                        </div>
                        <div class='footer'>
                            <p>This is an automated message from MediPredict. Please do not reply to this email.</p>
                            <p>&copy; 2024 MediPredict. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                // Check if SMTP is configured
                if (string.IsNullOrEmpty(_smtpUsername) || string.IsNullOrEmpty(_smtpPassword))
                {
                    _logger.LogWarning("SMTP credentials not configured. Email not sent to {Email}", toEmail);
                    // In development, just log the email
                    _logger.LogInformation("EMAIL WOULD BE SENT TO: {Email}", toEmail);
                    _logger.LogInformation("SUBJECT: {Subject}", subject);
                    return;
                }

                using var message = new MailMessage();
                message.From = new MailAddress(_fromEmail, _fromName);
                message.To.Add(new MailAddress(toEmail));
                message.Subject = subject;
                message.Body = htmlBody;
                message.IsBodyHtml = true;

                using var smtpClient = new SmtpClient(_smtpServer, _smtpPort);
                smtpClient.EnableSsl = true;
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);

                await smtpClient.SendMailAsync(message);
                _logger.LogInformation("Email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                // Don't throw - we don't want email failures to break the application flow
            }
        }
    }
}
