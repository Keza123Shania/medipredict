using MediPredict.Data.Enums;

namespace MediPredict.Helpers
{
    public static class EnumHelper
    {
        public static AppointmentStatus ToAppointmentStatus(string status)
        {
            return status?.ToLower() switch
            {
                "scheduled" => AppointmentStatus.Scheduled,
                "confirmed" => AppointmentStatus.Confirmed,
                "inprogress" => AppointmentStatus.InProgress,
                "completed" => AppointmentStatus.Completed,
                "cancelled" => AppointmentStatus.Cancelled,
                "noshow" => AppointmentStatus.NoShow,
                "rescheduled" => AppointmentStatus.Rescheduled,
                _ => AppointmentStatus.Scheduled
            };
        }

        public static string FromAppointmentStatus(AppointmentStatus status)
        {
            return status.ToString();
        }

        public static UserRole ToUserRole(string role)
        {
            return role?.ToLower() switch
            {
                "patient" => UserRole.Patient,
                "doctor" => UserRole.Doctor,
                "admin" => UserRole.Admin,
                "systemadmin" => UserRole.SystemAdmin,
                _ => UserRole.Patient
            };
        }

        public static string FromUserRole(UserRole role)
        {
            return role.ToString();
        }

        public static Gender ToGender(string gender)
        {
            return gender?.ToLower() switch
            {
                "male" => Gender.Male,
                "female" => Gender.Female,
                "other" => Gender.Other,
                _ => Gender.PreferNotToSay
            };
        }

        public static string FromGender(Gender gender)
        {
            return gender.ToString();
        }
    }
}
