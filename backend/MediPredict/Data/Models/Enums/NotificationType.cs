namespace MediPredict.Data.Models.Enums
{
    public enum NotificationType
    {
        AppointmentConfirmation = 1,
        ThreeWeekReminder = 2,
        ThreeDayReminder = 3,
        OneDayReminder = 4,
        SameDayReminder = 5,
        AppointmentCancellation = 6,
        AppointmentRescheduled = 7,
        ConsultationComplete = 8,
        PrescriptionReady = 9,
        FollowUpReminder = 10
    }
}
