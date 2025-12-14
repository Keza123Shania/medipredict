using MediPredict.Data.Models;

namespace MediPredict.Services.Interfaces
{
    public interface IAppointmentService
    {
        Task<List<Appointment>> GetPatientAppointmentsAsync(int patientId, string? status = null, int page = 1, int pageSize = 10);
        Task<List<Appointment>> GetDoctorAppointmentsAsync(int doctorId, string? status = null, DateTime? startDate = null, DateTime? endDate = null, int page = 1, int pageSize = 10);
        Task<(bool success, string message, int? appointmentId)> CreateAppointmentAsync(int patientId, int doctorId, DateTime scheduledDate, int durationMinutes = 30, string? notes = null);
        Task<bool> UpdateAppointmentStatusAsync(int appointmentId, string status, string? diagnosis = null, string? treatmentPlan = null);
        Task<Appointment?> GetAppointmentByIdAsync(Guid appointmentId);
    }
}