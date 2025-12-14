using System.Threading.Tasks;

namespace MediPredict.Services
{
    public interface IEmailService
    {
        Task SendAppointmentConfirmationEmailAsync(string toEmail, string patientName, string doctorName, 
            DateTime appointmentDate, string timeSlot, string confirmationNumber, string reasonForVisit);
        
        Task SendAppointmentReminderEmailAsync(string toEmail, string patientName, string doctorName, 
            DateTime appointmentDate, string timeSlot, string doctorAddress);
        
        Task SendAppointmentCancellationEmailAsync(string toEmail, string patientName, string doctorName, 
            DateTime appointmentDate, string timeSlot);
    }
}
