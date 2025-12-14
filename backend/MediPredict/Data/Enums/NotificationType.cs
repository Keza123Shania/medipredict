namespace MediPredict.Data.Enums
{
    public enum NotificationType
    {
        AppointmentConfirmation = 1,
        AppointmentReminder3Weeks = 2,
        AppointmentReminder3Days = 3,
        AppointmentReminder1Day = 4,
        AppointmentReminderSameDay = 5,
        AppointmentCancellation = 6,
        AppointmentReschedule = 7,
        ConsultationSummary = 8,
        PrescriptionReady = 9,
        FollowUpReminder = 10
    }
}
