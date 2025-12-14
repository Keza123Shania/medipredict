using MediPredict.Data.DatabaseContext;
using MediPredict.Data.Models;
using MediPredict.Data.Enums;
using Microsoft.EntityFrameworkCore;

namespace MediPredict.Data
{
    public static class PermissionSeeder
    {
        public static async Task SeedPermissionsAndRolesAsync(ApplicationDbContext context)
        {
            // Check if already seeded
            if (await context.Permissions.AnyAsync())
            {
                // Permissions exist, check for new permissions and add them
                await AddMissingPermissionsAsync(context);
                
                // Check if admin user needs to be created
                await CreateDefaultAdminUserIfNeeded(context);
                return;
            }

            // Define Permissions
            var permissions = new List<Permission>
            {
                // Patient Management
                new Permission { Name = "ViewPatients", Description = "View patient information", Category = "Patients" },
                new Permission { Name = "CreatePatient", Description = "Create new patient records", Category = "Patients" },
                new Permission { Name = "UpdatePatient", Description = "Update patient information", Category = "Patients" },
                new Permission { Name = "DeletePatient", Description = "Delete patient records", Category = "Patients" },
                
                // Doctor Management
                new Permission { Name = "ViewDoctors", Description = "View doctor information", Category = "Doctors" },
                new Permission { Name = "CreateDoctor", Description = "Create new doctor records", Category = "Doctors" },
                new Permission { Name = "UpdateDoctor", Description = "Update doctor information", Category = "Doctors" },
                new Permission { Name = "DeleteDoctor", Description = "Delete doctor records", Category = "Doctors" },
                new Permission { Name = "VerifyDoctor", Description = "Verify doctor credentials", Category = "Doctors" },
                
                // Appointment Management
                new Permission { Name = "ViewAppointments", Description = "View appointments", Category = "Appointments" },
                new Permission { Name = "CreateAppointment", Description = "Create new appointments", Category = "Appointments" },
                new Permission { Name = "UpdateAppointment", Description = "Update appointment details", Category = "Appointments" },
                new Permission { Name = "CancelAppointment", Description = "Cancel appointments", Category = "Appointments" },
                new Permission { Name = "RescheduleAppointment", Description = "Reschedule appointments", Category = "Appointments" },
                new Permission { Name = "ViewOwnAppointments", Description = "View own appointments only", Category = "Appointments" },
                
                // Symptom & Prediction
                new Permission { Name = "ViewSymptoms", Description = "View symptom data", Category = "Symptoms" },
                new Permission { Name = "CreateSymptomEntry", Description = "Create symptom entries", Category = "Symptoms" },
                new Permission { Name = "ViewPredictions", Description = "View AI predictions", Category = "Predictions" },
                new Permission { Name = "CreatePrediction", Description = "Generate AI predictions", Category = "Predictions" },
                
                // Consultation & Prescription
                new Permission { Name = "ViewConsultations", Description = "View consultation records", Category = "Consultations" },
                new Permission { Name = "CreateConsultation", Description = "Create consultation records", Category = "Consultations" },
                new Permission { Name = "UpdateConsultation", Description = "Update consultation records", Category = "Consultations" },
                new Permission { Name = "ViewPrescriptions", Description = "View prescriptions", Category = "Prescriptions" },
                new Permission { Name = "CreatePrescription", Description = "Create prescriptions", Category = "Prescriptions" },
                new Permission { Name = "UpdatePrescription", Description = "Update prescriptions", Category = "Prescriptions" },
                
                // Organization Management
                new Permission { Name = "ViewOrganizations", Description = "View healthcare organizations", Category = "Organizations" },
                new Permission { Name = "CreateOrganization", Description = "Create healthcare organizations", Category = "Organizations" },
                new Permission { Name = "UpdateOrganization", Description = "Update organization details", Category = "Organizations" },
                new Permission { Name = "DeleteOrganization", Description = "Delete organizations", Category = "Organizations" },
                
                // Affiliation Management
                new Permission { Name = "ViewAffiliations", Description = "View doctor affiliations", Category = "Affiliations" },
                new Permission { Name = "ManageAffiliations", Description = "Manage doctor affiliations", Category = "Affiliations" },
                
                // Notification Management
                new Permission { Name = "ViewNotifications", Description = "View notification logs", Category = "Notifications" },
                new Permission { Name = "ManageNotifications", Description = "Manage and retry notifications", Category = "Notifications" },
                
                // System Administration
                new Permission { Name = "ViewUsers", Description = "View all users", Category = "Admin" },
                new Permission { Name = "ManageUsers", Description = "Create, update, delete users", Category = "Admin" },
                new Permission { Name = "ManageRoles", Description = "Manage roles and permissions", Category = "Admin" },
                new Permission { Name = "ViewSystemLogs", Description = "View system logs", Category = "Admin" },
                new Permission { Name = "ManageSystemSettings", Description = "Manage system settings", Category = "Admin" }
            };

            await context.Permissions.AddRangeAsync(permissions);
            await context.SaveChangesAsync();

            // Define Roles
            var adminRole = new Role { Name = "Admin", Description = "System administrator with full access" };
            var doctorRole = new Role { Name = "Doctor", Description = "Medical doctor with patient consultation access" };
            var patientRole = new Role { Name = "Patient", Description = "Patient with limited access to own records" };

            await context.Roles.AddRangeAsync(new[] { adminRole, doctorRole, patientRole });
            await context.SaveChangesAsync();

            // Assign Permissions to Admin Role (all permissions)
            var adminPermissions = permissions.Select(p => new RolePermission
            {
                RoleId = adminRole.Id,
                PermissionId = p.Id
            }).ToList();

            // Assign Permissions to Doctor Role
            var doctorPermissionNames = new[]
            {
                "ViewPatients", "UpdatePatient",
                "ViewDoctors", "UpdateDoctor",
                "ViewAppointments", "UpdateAppointment", "CancelAppointment", "RescheduleAppointment", "ViewOwnAppointments",
                "ViewSymptoms", "ViewPredictions",
                "ViewConsultations", "CreateConsultation", "UpdateConsultation",
                "ViewPrescriptions", "CreatePrescription", "UpdatePrescription",
                "ViewAffiliations", "ManageAffiliations",
                "ViewNotifications"
            };

            var doctorPermissions = permissions
                .Where(p => doctorPermissionNames.Contains(p.Name))
                .Select(p => new RolePermission
                {
                    RoleId = doctorRole.Id,
                    PermissionId = p.Id
                }).ToList();

            // Assign Permissions to Patient Role
            var patientPermissionNames = new[]
            {
                "ViewOwnAppointments", "CreateAppointment", "CancelAppointment", "RescheduleAppointment", "RescheduleAppointment",
                "ViewSymptoms", "CreateSymptomEntry",
                "ViewPredictions", "CreatePrediction",
                "ViewConsultations", "ViewPrescriptions"
            };

            var patientPermissions = permissions
                .Where(p => patientPermissionNames.Contains(p.Name))
                .Select(p => new RolePermission
                {
                    RoleId = patientRole.Id,
                    PermissionId = p.Id
                }).ToList();

            await context.RolePermissions.AddRangeAsync(adminPermissions);
            await context.RolePermissions.AddRangeAsync(doctorPermissions);
            await context.RolePermissions.AddRangeAsync(patientPermissions);
            await context.SaveChangesAsync();

            // Create default admin user
            await CreateDefaultAdminUserIfNeeded(context);
        }

        private static async Task CreateDefaultAdminUserIfNeeded(ApplicationDbContext context)
        {
            // Find admin role
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
            if (adminRole == null)
            {
                Console.WriteLine("Admin role not found. Cannot create admin user.");
                return;
            }

            // Check if admin user already exists
            var adminExists = await context.Users.AnyAsync(u => u.Email == "admin@medipredict.com");
            if (adminExists)
            {
                Console.WriteLine("Admin user already exists.");
                return;
            }

            // Create default admin user
            var adminUser = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = "admin",
                Email = "admin@medipredict.com",
                FirstName = "System",
                LastName = "Administrator",
                DateOfBirth = new DateTime(1990, 1, 1),
                Gender = Gender.Other,
                PasswordHash = "/3vZexp3id3Sd1Ei/WgX8xc2ctqfgCzuxX8oQyW/WJ8=", // Password@123
                RoleId = adminRole.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                PhoneNumber = "+1234567890"
            };

            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();

            Console.WriteLine("======================================");
            Console.WriteLine("DEFAULT ADMIN ACCOUNT CREATED");
            Console.WriteLine("======================================");
            Console.WriteLine("Email: admin@medipredict.com");
            Console.WriteLine("Password: Password@123");
            Console.WriteLine("======================================");
            Console.WriteLine("IMPORTANT: Please change this password immediately after first login!");
            Console.WriteLine("======================================");
        }

        public static async Task AddMissingPermissionsAsync(ApplicationDbContext context)
        {
            // Check if RescheduleAppointment permission exists
            var reschedulePermission = await context.Permissions
                .FirstOrDefaultAsync(p => p.Name == "RescheduleAppointment");

            if (reschedulePermission == null)
            {
                // Add the missing permission
                reschedulePermission = new Permission 
                { 
                    Name = "RescheduleAppointment", 
                    Description = "Reschedule appointments", 
                    Category = "Appointments" 
                };
                await context.Permissions.AddAsync(reschedulePermission);
                await context.SaveChangesAsync();

                Console.WriteLine("Added missing permission: RescheduleAppointment");

                // Add permission to Patient role
                var patientRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Patient");
                if (patientRole != null)
                {
                    var patientRolePermission = new RolePermission
                    {
                        RoleId = patientRole.Id,
                        PermissionId = reschedulePermission.Id
                    };
                    await context.RolePermissions.AddAsync(patientRolePermission);
                    Console.WriteLine("Added RescheduleAppointment permission to Patient role");
                }

                // Add permission to Doctor role
                var doctorRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Doctor");
                if (doctorRole != null)
                {
                    var doctorRolePermission = new RolePermission
                    {
                        RoleId = doctorRole.Id,
                        PermissionId = reschedulePermission.Id
                    };
                    await context.RolePermissions.AddAsync(doctorRolePermission);
                    Console.WriteLine("Added RescheduleAppointment permission to Doctor role");
                }

                await context.SaveChangesAsync();
                Console.WriteLine("RescheduleAppointment permission successfully added to database");
            }

            // Ensure CancelAppointment is assigned to Doctor role
            var cancelPermission = await context.Permissions
                .FirstOrDefaultAsync(p => p.Name == "CancelAppointment");
            
            if (cancelPermission != null)
            {
                var doctorRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Doctor");
                if (doctorRole != null)
                {
                    var hasCancelPermission = await context.RolePermissions
                        .AnyAsync(rp => rp.RoleId == doctorRole.Id && rp.PermissionId == cancelPermission.Id);
                    
                    if (!hasCancelPermission)
                    {
                        var doctorCancelPermission = new RolePermission
                        {
                            RoleId = doctorRole.Id,
                            PermissionId = cancelPermission.Id
                        };
                        await context.RolePermissions.AddAsync(doctorCancelPermission);
                        await context.SaveChangesAsync();
                        Console.WriteLine("Added CancelAppointment permission to Doctor role");
                    }
                }
            }

            // Ensure ViewConsultations and CreateConsultation permissions exist and are assigned to Doctor role
            Console.WriteLine("Checking consultation permissions...");
            var consultationPermissionsToCheck = new[]
            {
                new { Name = "ViewConsultations", Description = "View consultation records", Category = "Consultations" },
                new { Name = "CreateConsultation", Description = "Create consultation records", Category = "Consultations" }
            };

            foreach (var permDef in consultationPermissionsToCheck)
            {
                Console.WriteLine($"Checking permission: {permDef.Name}");
                var permission = await context.Permissions
                    .FirstOrDefaultAsync(p => p.Name == permDef.Name);

                if (permission == null)
                {
                    // Add the missing permission
                    Console.WriteLine($"Permission {permDef.Name} not found, creating...");
                    permission = new Permission
                    {
                        Name = permDef.Name,
                        Description = permDef.Description,
                        Category = permDef.Category
                    };
                    await context.Permissions.AddAsync(permission);
                    await context.SaveChangesAsync();
                    Console.WriteLine($"✓ Created permission: {permDef.Name}");
                }
                else
                {
                    Console.WriteLine($"Permission {permDef.Name} already exists (ID: {permission.Id})");
                }

                // Ensure Doctor role has this permission
                var doctorRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Doctor");
                if (doctorRole != null)
                {
                    Console.WriteLine($"Doctor role found (ID: {doctorRole.Id}), checking assignment...");
                    var hasPermission = await context.RolePermissions
                        .AnyAsync(rp => rp.RoleId == doctorRole.Id && rp.PermissionId == permission.Id);

                    if (!hasPermission)
                    {
                        Console.WriteLine($"Doctor role does NOT have {permDef.Name}, adding...");
                        var rolePermission = new RolePermission
                        {
                            RoleId = doctorRole.Id,
                            PermissionId = permission.Id
                        };
                        await context.RolePermissions.AddAsync(rolePermission);
                        await context.SaveChangesAsync();
                        Console.WriteLine($"✓ Added {permDef.Name} permission to Doctor role");
                    }
                    else
                    {
                        Console.WriteLine($"Doctor role already has {permDef.Name}");
                    }
                }
                else
                {
                    Console.WriteLine("WARNING: Doctor role not found!");
                }

                // Also ensure Patient role has ViewConsultations
                if (permDef.Name == "ViewConsultations")
                {
                    var patientRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Patient");
                    if (patientRole != null)
                    {
                        Console.WriteLine($"Patient role found (ID: {patientRole.Id}), checking ViewConsultations assignment...");
                        var hasPermission = await context.RolePermissions
                            .AnyAsync(rp => rp.RoleId == patientRole.Id && rp.PermissionId == permission.Id);

                        if (!hasPermission)
                        {
                            Console.WriteLine("Patient role does NOT have ViewConsultations, adding...");
                            var rolePermission = new RolePermission
                            {
                                RoleId = patientRole.Id,
                                PermissionId = permission.Id
                            };
                            await context.RolePermissions.AddAsync(rolePermission);
                            await context.SaveChangesAsync();
                            Console.WriteLine("✓ Added ViewConsultations permission to Patient role");
                        }
                        else
                        {
                            Console.WriteLine("Patient role already has ViewConsultations");
                        }
                    }
                    else
                    {
                        Console.WriteLine("WARNING: Patient role not found!");
                    }
                }
            }
            Console.WriteLine("Consultation permissions check completed.");
            
            // Ensure CreatePrediction permission is assigned to Patient role
            Console.WriteLine("Checking CreatePrediction permission for Patient role...");
            var createPredictionPermission = await context.Permissions
                .FirstOrDefaultAsync(p => p.Name == "CreatePrediction");
            
            if (createPredictionPermission != null)
            {
                var patientRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Patient");
                if (patientRole != null)
                {
                    var hasCreatePrediction = await context.RolePermissions
                        .AnyAsync(rp => rp.RoleId == patientRole.Id && rp.PermissionId == createPredictionPermission.Id);
                    
                    if (!hasCreatePrediction)
                    {
                        Console.WriteLine("Patient role does NOT have CreatePrediction, adding...");
                        var rolePermission = new RolePermission
                        {
                            RoleId = patientRole.Id,
                            PermissionId = createPredictionPermission.Id
                        };
                        await context.RolePermissions.AddAsync(rolePermission);
                        await context.SaveChangesAsync();
                        Console.WriteLine("✓ Added CreatePrediction permission to Patient role");
                    }
                    else
                    {
                        Console.WriteLine("Patient role already has CreatePrediction");
                    }
                }
            }
            Console.WriteLine("CreatePrediction permission check completed.");
        }
    }
}
