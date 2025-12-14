using MediPredict.Data.Models;
using MediPredict.Services.Interfaces;
using MediPredict.Services.Implementations;

namespace MediPredict.Services.Implementations
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IDatabaseService _databaseService;

        public AppointmentService(IDatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        public async Task<List<Appointment>> GetPatientAppointmentsAsync(int patientId, string? status = null, int page = 1, int pageSize = 10)
        {
            var appointments = await _databaseService.QueryAsync<Appointment>(
                "spAppointment_GetByPatientId",
                new { PatientId = patientId, Status = status, PageSize = pageSize, PageNumber = page }
            );
            return appointments.ToList();
        }

        public async Task<List<Appointment>> GetDoctorAppointmentsAsync(int doctorId, string? status = null, DateTime? startDate = null, DateTime? endDate = null, int page = 1, int pageSize = 10)
        {
            var appointments = await _databaseService.QueryAsync<Appointment>(
                "spAppointment_GetByDoctorId",
                new
                {
                    DoctorId = doctorId,
                    Status = status,
                    StartDate = startDate,
                    EndDate = endDate,
                    PageSize = pageSize,
                    PageNumber = page
                }
            );
            return appointments.ToList();
        }

        public async Task<(bool success, string message, int? appointmentId)> CreateAppointmentAsync(int patientId, int doctorId, DateTime scheduledDate, int durationMinutes = 30, string? notes = null)
        {
            var result = await _databaseService.QuerySingleAsync<dynamic>(
                "spAppointment_Create",
                new
                {
                    PatientId = patientId,
                    DoctorId = doctorId,
                    ScheduledDate = scheduledDate,
                    DurationMinutes = durationMinutes,
                    Notes = notes
                }
            );

            if (result?.Status == "Success")
            {
                return (true, result.Message, result.AppointmentId);
            }

            return (false, result?.Message ?? "Failed to create appointment", null);
        }

        public async Task<bool> UpdateAppointmentStatusAsync(int appointmentId, string status, string? diagnosis = null, string? treatmentPlan = null)
        {
            var result = await _databaseService.ExecuteAsync(
                "spAppointment_UpdateStatus",
                new
                {
                    AppointmentId = appointmentId,
                    Status = status,
                    Diagnosis = diagnosis,
                    TreatmentPlan = treatmentPlan
                }
            );
            return result > 0;
        }

        public async Task<Appointment?> GetAppointmentByIdAsync(Guid appointmentId)
        {
            // This would need a new stored procedure or we can get from existing ones
            // For now, returning first from patient appointments (simplified)
            var appointments = await GetPatientAppointmentsAsync(1); // This needs proper implementation
            return appointments.FirstOrDefault(a => a.Id == appointmentId);
        }
    }
}