using Microsoft.EntityFrameworkCore;
using MediPredict.Data.Models;
using MediPredict.Data.Enums;

namespace MediPredict.Data.DatabaseContext
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Core tables
        public DbSet<ApplicationUser> Users { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        
        // Medical data
        public DbSet<Symptom> Symptoms { get; set; }
        public DbSet<Disease> Diseases { get; set; }
        public DbSet<SymptomEntry> SymptomEntries { get; set; }
        public DbSet<SymptomEntrySymptom> SymptomEntrySymptoms { get; set; }
        public DbSet<AIPrediction> AIPredictions { get; set; }
        
        // Appointments and consultations
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<ConsultationRecord> ConsultationRecords { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        
        // Organizations and notifications
        public DbSet<HealthcareOrganization> HealthcareOrganizations { get; set; }
        public DbSet<DoctorAffiliation> DoctorAffiliations { get; set; }
        public DbSet<NotificationLog> NotificationLogs { get; set; }
        
        // Permission-based access control
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure enum conversions
            modelBuilder.Entity<ApplicationUser>()
                .Property(e => e.Gender)
                .HasConversion<int>();

            modelBuilder.Entity<Appointment>()
                .Property(e => e.Status)
                .HasConversion<int>();

            modelBuilder.Entity<NotificationLog>()
                .Property(e => e.Type)
                .HasConversion<int>();

            // Configure ApplicationUser
            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.RoleId);
                entity.HasIndex(e => e.IsActive);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);

                entity.HasOne(e => e.Role)
                    .WithMany(r => r.Users)
                    .HasForeignKey(e => e.RoleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Patient
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId).IsUnique();

                entity.HasOne(e => e.User)
                    .WithOne(u => u.Patient)
                    .HasForeignKey<Patient>(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Doctor
            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.HasIndex(e => e.LicenseNumber).IsUnique();
                entity.HasIndex(e => e.Specialization);
                entity.HasIndex(e => e.IsVerified);
                entity.Property(e => e.ConsultationFee).HasColumnType("decimal(18,2)");

                entity.HasOne(e => e.User)
                    .WithOne(u => u.Doctor)
                    .HasForeignKey<Doctor>(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure SymptomEntrySymptom junction table
            modelBuilder.Entity<SymptomEntrySymptom>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.SymptomEntryId, e.SymptomId }).IsUnique();

                entity.HasOne(e => e.SymptomEntry)
                    .WithMany(s => s.Symptoms)
                    .HasForeignKey(e => e.SymptomEntryId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Symptom)
                    .WithMany(s => s.SymptomEntries)
                    .HasForeignKey(e => e.SymptomId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure AIPrediction
            modelBuilder.Entity<AIPrediction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ConfidenceLevel).HasColumnType("decimal(5,2)");
                entity.Property(e => e.Probability).HasColumnType("decimal(5,2)");

                entity.HasOne(e => e.SymptomEntry)
                    .WithMany(s => s.AIPredictions)
                    .HasForeignKey(e => e.SymptomEntryId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Disease)
                    .WithMany()
                    .HasForeignKey(e => e.DiseaseId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure SymptomEntry
            modelBuilder.Entity<SymptomEntry>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Patient)
                    .WithMany()
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Appointment
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.AppointmentDate);
                entity.HasIndex(e => e.ConfirmationNumber).IsUnique();

                entity.HasOne(e => e.Patient)
                    .WithMany()
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                    .WithMany()
                    .HasForeignKey(e => e.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.SymptomEntry)
                    .WithMany()
                    .HasForeignKey(e => e.SymptomEntryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Disease
            modelBuilder.Entity<Disease>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.IsActive);
                entity.Property(e => e.ProbabilityScore).HasColumnType("decimal(5,2)");
            });

            // Configure ConsultationRecord
            modelBuilder.Entity<ConsultationRecord>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Appointment)
                    .WithMany()
                    .HasForeignKey(e => e.AppointmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Patient)
                    .WithMany()
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                    .WithMany()
                    .HasForeignKey(e => e.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.AIPrediction)
                    .WithMany()
                    .HasForeignKey(e => e.AIPredictionId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure Prescription
            modelBuilder.Entity<Prescription>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.ConsultationRecord)
                    .WithMany(c => c.Prescriptions)
                    .HasForeignKey(e => e.ConsultationRecordId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure HealthcareOrganization
            modelBuilder.Entity<HealthcareOrganization>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.IsActive);
            });

            // Configure DoctorAffiliation
            modelBuilder.Entity<DoctorAffiliation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.DoctorId, e.OrganizationId });

                entity.HasOne(e => e.Doctor)
                    .WithMany(d => d.Affiliations)
                    .HasForeignKey(e => e.DoctorId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Organization)
                    .WithMany(o => o.DoctorAffiliations)
                    .HasForeignKey(e => e.OrganizationId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure NotificationLog
            modelBuilder.Entity<NotificationLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.Type, e.SentAt });
                entity.HasIndex(e => new { e.IsSent, e.CreatedAt });

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Appointment)
                    .WithMany(a => a.Notifications)
                    .HasForeignKey(e => e.AppointmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Consultation)
                    .WithMany()
                    .HasForeignKey(e => e.ConsultationId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Permission
            modelBuilder.Entity<Permission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name).IsUnique();
                entity.HasIndex(e => e.Category);
            });

            // Configure Role
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // Configure RolePermission
            modelBuilder.Entity<RolePermission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.RoleId, e.PermissionId }).IsUnique();

                entity.HasOne(e => e.Role)
                    .WithMany(r => r.RolePermissions)
                    .HasForeignKey(e => e.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Permission)
                    .WithMany(p => p.RolePermissions)
                    .HasForeignKey(e => e.PermissionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure UserPermission
            modelBuilder.Entity<UserPermission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.PermissionId }).IsUnique();

                entity.HasOne(e => e.User)
                    .WithMany(u => u.UserPermissions)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Permission)
                    .WithMany(p => p.UserPermissions)
                    .HasForeignKey(e => e.PermissionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}