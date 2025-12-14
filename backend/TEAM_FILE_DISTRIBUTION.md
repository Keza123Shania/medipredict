# MediPredict Backend - Team File Distribution Guide

## 📋 Project Overview
This document outlines which files each team member should push to GitHub based on their assigned modules. After merging all contributions, the result will be a complete, functional MediPredict Web API backend.

---

## 👥 Team Members & Their Modules

### 1. **Therese** - Authentication & User Management
- **Patient Module**: User Registration & Authentication
- **Admin Module**: User Management

### 2. **Yvan** - AI/Symptoms & System Monitoring
- **Patient Module**: Symptom Input & AI Prediction
- **Doctor Module**: Patient Management
- **Admin Module**: System Monitoring

### 3. **Shania** - Doctor Search & Medical Records
- **Patient Module**: Doctor Search & Connection, Medical Records Management, Patient Dashboard

### 4. **Tsuu** - Appointments
- **Patient Module**: Appointment Booking
- **Doctor Module**: Appointment Management

### 5. **Kendra** - Consultations & Admin Dashboard
- **Doctor Module**: Doctor Registration & Profile Management, Consultation & Diagnosis, Doctor Dashboard
- **Admin Module**: Dashboard & Analytics

---

## 📂 DETAILED FILE DISTRIBUTION BY TEAM MEMBER

### 🔹 **THERESE** - Authentication & User Management

#### Controllers
```
MediPredict/Controllers/Api/
├── AuthController.cs                    ✅ (Complete - register, login, logout, current-user endpoints)
└── AdminController.cs                   ⚠️ (PARTIAL - Only user management methods)
    ├── SuspendUser (Line ~357)
    ├── ActivateUser (Line ~396)
    ├── BlockUser (Line ~435)
    └── UnblockUser (Line ~474)
```

#### Services
```
MediPredict/Services/
├── Interfaces/
│   ├── ICustomAuthService.cs            ✅ (Authentication service interface)
│   └── IUserService.cs                  ✅ (User service interface)
└── Implementations/
    ├── CustomAuthService.cs             ✅ (Register, Login, Password hashing/verification)
    └── UserService.cs                   ✅ (User management operations)
```

#### Models
```
MediPredict/Data/Models/
├── ApplicationUser.cs                   ✅ (User entity with authentication properties)
├── Person.cs                            ✅ (Base person entity)
├── User.cs                              ✅ (If exists separately)
└── Patient.cs                           ⚠️ (PARTIAL - Only registration-related properties)
```

#### ViewModels
```
MediPredict/Data/ViewModels/
├── UserRegistrationViewModel.cs         ✅ (Registration data model)
└── ProfileViewModels.cs                 ⚠️ (PARTIAL - Only user profile sections)
```

#### Middleware
```
MediPredict/Middleware/
└── CustomAuthenticationMiddleware.cs    ✅ (JWT/Cookie authentication logic)
```

#### Helpers
```
MediPredict/Helpers/
└── AuthorizationHelper.cs               ✅ (If contains auth-related utilities)
```

---

### 🔹 **YVAN** - AI/Symptoms & System Monitoring

#### Controllers
```
MediPredict/Controllers/Api/
├── AnalyzeSymptomsController.cs         ✅ (Symptom analysis endpoint)
├── PredictionsController.cs             ✅ (AI predictions - create, get, history)
├── SymptomsController.cs                ✅ (Symptom management)
└── AdminController.cs                   ⚠️ (PARTIAL - Only monitoring methods)
    ├── GetSystemLogs (Line ~550)
    └── GetAnalytics (Line ~242-333)
```

#### Services
```
MediPredict/Services/
├── Interfaces/
│   └── IAIService.cs                    ✅ (AI service interface)
└── Implementations/
    └── AIService.cs                     ✅ (AI prediction logic, ML integration)
```

#### Models
```
MediPredict/Data/Models/
├── Symptom.cs                           ✅ (Symptom entity)
├── SymptomEntry.cs                      ✅ (Patient symptom entries)
├── SymptomEntrySymptom.cs               ✅ (Junction table)
├── AIPrediction.cs                      ✅ (AI prediction results)
├── Disease.cs                           ✅ (Disease entity)
└── NotificationLog.cs                   ✅ (System monitoring logs)
```

#### ViewModels
```
MediPredict/Data/ViewModels/
├── SymptomInputViewModel.cs             ✅ (Symptom input data)
├── SymptomEntryViewModel.cs             ✅ (Symptom entry data)
├── PredictionResultViewModel.cs         ✅ (Prediction results)
├── ComprehensivePredictionViewModel.cs  ✅ (Detailed prediction data)
└── MockPredictionResultViewModel.cs     ✅ (If used for testing)
```

#### Database Stored Procedures (If applicable)
```
MediPredict/Database/StoredProcedures/
└── AIModelProcedures.sql                ✅ (AI-related database procedures)
```

---

### 🔹 **SHANIA** - Doctor Search & Medical Records

#### Controllers
```
MediPredict/Controllers/Api/
├── DoctorsController.cs                 ✅ (Doctor search, profiles, specializations)
├── ProfileController.cs                 ✅ (Patient profile viewing)
├── MedicalHistoryController.cs          ✅ (Medical history, consultation details)
└── DashboardController.cs               ⚠️ (PARTIAL - Only GetPatientDashboard method, Line ~29-130)
```

#### Services
```
MediPredict/Services/
├── Interfaces/
│   └── IDoctorService.cs                ✅ (Doctor service interface)
└── Implementations/
    └── DoctorService.cs                 ✅ (Doctor search, filtering logic)
```

#### Models
```
MediPredict/Data/Models/
├── Doctor.cs                            ✅ (Doctor entity)
├── DoctorAffiliation.cs                 ✅ (Doctor-organization relationship)
├── HealthcareOrganization.cs            ✅ (Healthcare facility entity)
└── Patient.cs                           ⚠️ (PARTIAL - Medical history properties)
```

#### ViewModels
```
MediPredict/Data/ViewModels/
├── DoctorProfileViewModel.cs            ✅ (Doctor profile data)
├── ProfileViewModels.cs                 ⚠️ (PARTIAL - Patient profile sections)
└── ConsultationViewModel.cs             ⚠️ (PARTIAL - For viewing consultations only)
```

---

### 🔹 **TSUU** - Appointments

#### Controllers
```
MediPredict/Controllers/Api/
├── AppointmentsController.cs            ✅ (All appointment endpoints - get, create, cancel, reschedule)
└── AdminController.cs                   ⚠️ (PARTIAL - Only UpdateAppointmentStatus method, Line ~513)
```

#### Services
```
MediPredict/Services/
├── Interfaces/
│   └── IAppointmentService.cs           ✅ (Appointment service interface)
└── Implementations/
    ├── AppointmentService.cs            ✅ (Appointment booking, cancellation logic)
    └── AppointmentReminderService.cs    ✅ (Background service for reminders)
```

#### Models
```
MediPredict/Data/Models/
└── Appointment.cs                       ✅ (Appointment entity with all statuses)
```

#### ViewModels
```
MediPredict/Data/ViewModels/
└── AppointmentViewModel.cs              ✅ (Appointment data model)
```

#### Database Stored Procedures (If applicable)
```
MediPredict/Database/StoredProcedures/
└── AppointmentManagementProcedures.sql  ✅ (Appointment-related procedures)
```

---

### 🔹 **KENDRA** - Consultations & Admin Dashboard

#### Controllers
```
MediPredict/Controllers/Api/
├── ConsultationsController.cs           ✅ (Get consultations, create consultation, history)
├── DashboardController.cs               ⚠️ (PARTIAL - GetDoctorDashboard + GetAdminDashboard methods)
│   ├── GetDoctorDashboard (Line ~137-240)
│   └── GetAdminDashboard (Line ~242-410)
└── AdminController.cs                   ⚠️ (PARTIAL - Doctor verification methods)
    ├── GetPendingDoctors (Line ~36)
    ├── ApproveDoctor (Line ~81)
    ├── RejectDoctor (Line ~127)
    ├── GetAllPatients (Line ~198)
    └── GetAllDoctors (Line ~271)
```

#### Services
```
MediPredict/Services/
├── Interfaces/
│   └── IAdminService.cs                 ✅ (Admin service interface)
└── Implementations/
    └── AdminService.cs                  ✅ (Admin operations - verification, analytics)
```

#### Models
```
MediPredict/Data/Models/
├── ConsultationRecord.cs                ✅ (Consultation entity)
├── Prescription.cs                      ✅ (Prescription entity)
└── Doctor.cs                            ⚠️ (PARTIAL - Verification properties)
```

#### ViewModels
```
MediPredict/Data/ViewModels/
├── ConsultationViewModel.cs             ⚠️ (PARTIAL - Consultation creation)
├── AdminViewModel.cs                    ✅ (Admin dashboard data)
└── ProfileViewModels.cs                 ⚠️ (PARTIAL - Doctor profile creation)
```

#### Database Stored Procedures (If applicable)
```
MediPredict/Database/StoredProcedures/
├── DoctorManagementProcedures.sql       ✅
└── AdminManagementProcedures.sql        ✅
```

---

## 🔗 SHARED/COMMON FILES (Required by ALL Team Members)

### Core Configuration & Setup
```
MediPredict/
├── Program.cs                           ✅ ALL (Dependency injection, middleware setup)
├── appsettings.json                     ✅ ALL (Connection strings, API keys)
├── appsettings.Development.json         ✅ ALL (Development configuration)
├── MediPredict.csproj                   ✅ ALL (NuGet packages, project settings)
└── MediPredict.csproj.user              ⚠️ (Optional - local user settings)
```

### Database Context
```
MediPredict/Data/DatabaseContext/
└── ApplicationDbContext.cs              ✅ ALL (Entity Framework DbContext with all DbSets)
```

### Database Migrations
```
MediPredict/Migrations/
├── All migration files                  ✅ ALL (Complete migration history)
└── ApplicationDbContextModelSnapshot.cs ✅ ALL (Current database schema snapshot)
```

### Permission-Based Access Control (PBAC) System
```
MediPredict/Data/
├── PermissionSeeder.cs                  ✅ ALL (Seeds permissions and roles)
└── Models/
    ├── Permission.cs                    ✅ ALL (Permission entity)
    ├── Role.cs                          ✅ ALL (Role entity)
    ├── RolePermission.cs                ✅ ALL (Role-Permission mapping)
    └── UserPermission.cs                ✅ ALL (User-Permission mapping)

MediPredict/Services/
├── IPermissionService.cs                ✅ ALL (Permission service interface)
└── PermissionService.cs                 ✅ ALL (Permission checking logic)

MediPredict/Attributes/
└── RequirePermissionAttribute.cs        ✅ ALL (Authorization filter attribute)
```

### Shared Models & Enums
```
MediPredict/Data/Models/
├── ApiResponse.cs                       ✅ ALL (Standard API response wrapper)
└── Enums/
    ├── AppointmentStatus.cs             ✅ ALL
    ├── Gender.cs                        ✅ ALL
    ├── UserRole.cs                      ✅ ALL (If still in use)
    └── All other enums                  ✅ ALL

MediPredict/Helpers/
├── EnumHelper.cs                        ✅ ALL (Enum conversion utilities)
└── Any other helper classes             ✅ ALL
```

### Email Service
```
MediPredict/Services/
├── IEmailService.cs                     ✅ ALL (Email service interface)
└── Implementations/
    └── EmailService.cs                  ✅ ALL (Email sending logic)
```

### Database Service (If using Stored Procedures)
```
MediPredict/Services/
├── Interfaces/
│   └── IDatabaseService.cs              ✅ ALL
└── Implementations/
    └── DatabaseService.cs               ✅ ALL (Dapper/SP execution)
```

### Profile Picture Service
```
MediPredict/Services/
├── Interfaces/
│   └── IProfilePictureService.cs        ✅ ALL
└── Implementations/
    └── ProfilePictureService.cs         ✅ ALL
```

### Static Files & Assets
```
MediPredict/wwwroot/
└── (All static files)                   ✅ ALL
```

### Launch Settings
```
MediPredict/Properties/
└── launchSettings.json                  ✅ ALL (Development server configuration)
```

### Documentation Files
```
MediPredict/
├── MODEL_DOCUMENTATION.md               ✅ ALL
├── PHASE1_IMPLEMENTATION_SUMMARY.md     ✅ ALL
└── MIGRATION_COMMANDS.txt               ✅ ALL
```

---

## ⚠️ IMPORTANT: AdminController.cs Distribution Strategy

**AdminController.cs** contains methods for multiple team members. Here's how to handle it:

### **Option 1: Merge Approach (RECOMMENDED)**
- **Therese** pushes: User management methods (SuspendUser, ActivateUser, BlockUser, UnblockUser)
- **Yvan** pushes: Monitoring methods (GetSystemLogs, analytics sections)
- **Kendra** pushes: Doctor verification & dashboard methods (GetPendingDoctors, ApproveDoctor, RejectDoctor, GetAdminDashboard, GetAllPatients, GetAllDoctors)

**How to implement:**
1. Each person creates their version with only their methods
2. During merge, combine all methods into one file
3. Resolve any conflicts in imports/dependencies

### **Option 2: Single Person Approach**
- **One person (e.g., Kendra as Admin lead)** pushes the complete AdminController.cs
- Others exclude it from their commits

---

## ⚠️ IMPORTANT: DashboardController.cs Distribution

**DashboardController.cs** has methods for 2 team members:

- **Shania** pushes: `GetPatientDashboard` method (Lines ~29-130)
- **Kendra** pushes: `GetDoctorDashboard` (Lines ~137-240) + `GetAdminDashboard` (Lines ~242-410)

**Merge Strategy:** Same as AdminController - combine during merge.

---

## 📋 FILE CHECKLIST FOR EACH TEAM MEMBER

### ✅ **Therese's Checklist**
- [ ] AuthController.cs
- [ ] CustomAuthService.cs + ICustomAuthService.cs
- [ ] UserService.cs + IUserService.cs
- [ ] CustomAuthenticationMiddleware.cs
- [ ] ApplicationUser.cs, Person.cs
- [ ] UserRegistrationViewModel.cs
- [ ] AdminController.cs (user management methods only)
- [ ] **ALL SHARED/COMMON FILES** listed above

### ✅ **Yvan's Checklist**
- [ ] AnalyzeSymptomsController.cs
- [ ] PredictionsController.cs
- [ ] SymptomsController.cs
- [ ] AIService.cs + IAIService.cs
- [ ] Symptom.cs, SymptomEntry.cs, SymptomEntrySymptom.cs, AIPrediction.cs, Disease.cs
- [ ] All symptom/prediction ViewModels
- [ ] AdminController.cs (monitoring methods only)
- [ ] **ALL SHARED/COMMON FILES** listed above

### ✅ **Shania's Checklist**
- [ ] DoctorsController.cs
- [ ] ProfileController.cs
- [ ] MedicalHistoryController.cs
- [ ] DashboardController.cs (GetPatientDashboard only)
- [ ] DoctorService.cs + IDoctorService.cs
- [ ] Doctor.cs, DoctorAffiliation.cs, HealthcareOrganization.cs
- [ ] DoctorProfileViewModel.cs
- [ ] **ALL SHARED/COMMON FILES** listed above

### ✅ **Tsuu's Checklist**
- [ ] AppointmentsController.cs
- [ ] AppointmentService.cs + IAppointmentService.cs
- [ ] AppointmentReminderService.cs
- [ ] Appointment.cs
- [ ] AppointmentViewModel.cs
- [ ] AdminController.cs (UpdateAppointmentStatus only)
- [ ] **ALL SHARED/COMMON FILES** listed above

### ✅ **Kendra's Checklist**
- [ ] ConsultationsController.cs
- [ ] DashboardController.cs (GetDoctorDashboard + GetAdminDashboard)
- [ ] AdminService.cs + IAdminService.cs
- [ ] ConsultationRecord.cs, Prescription.cs
- [ ] ConsultationViewModel.cs (creation parts)
- [ ] AdminViewModel.cs
- [ ] AdminController.cs (doctor verification & analytics methods)
- [ ] **ALL SHARED/COMMON FILES** listed above

---

## 🔀 GIT MERGE STRATEGY

### Step 1: Create Individual Branches
Each team member creates their own branch:
```bash
git checkout -b therese/authentication
git checkout -b yvan/ai-symptoms
git checkout -b shania/doctors-records
git checkout -b tsuu/appointments
git checkout -b kendra/consultations-admin
```

### Step 2: Push Module-Specific Files
Each person:
1. Commits only their assigned files (including ALL shared files)
2. Pushes to their branch
3. Creates Pull Request to `main`/`develop`

### Step 3: Merge Order (IMPORTANT)
Merge in this order to minimize conflicts:
1. **First**: Shared files (whoever pushes first)
2. **Therese** - Authentication (base for others)
3. **Yvan** - AI/Symptoms
4. **Shania** - Doctors/Records
5. **Tsuu** - Appointments
6. **Kendra** - Consultations/Admin

### Step 4: Resolve Conflicts
Pay special attention to:
- `AdminController.cs` - Combine all team members' methods
- `DashboardController.cs` - Combine Shania's + Kendra's methods
- `Program.cs` - Ensure all services are registered
- `ApplicationDbContext.cs` - Verify all DbSets present

---

## ✅ POST-MERGE VERIFICATION

After merging all branches, verify:

1. **Build Success**
   ```bash
   dotnet build
   ```

2. **No Missing Dependencies**
   - Check all using statements resolve
   - Verify all services registered in Program.cs

3. **Database Migration**
   ```bash
   Add-Migration VerifyMerge
   Update-Database
   ```

4. **Run Application**
   ```bash
   dotnet run
   ```

5. **Test All Endpoints**
   - Authentication (Therese)
   - AI Predictions (Yvan)
   - Doctor Search (Shania)
   - Appointments (Tsuu)
   - Consultations (Kendra)
   - Admin functions (All)

---

## 📞 COORDINATION TIPS

### Before Pushing:
- [ ] Announce in team chat which files you're pushing
- [ ] Check if anyone else modified the same files
- [ ] Ensure you have latest shared files

### During Merge:
- [ ] Review each Pull Request carefully
- [ ] Test locally before approving
- [ ] Communicate conflicts immediately

### After Merge:
- [ ] Pull latest `main` branch
- [ ] Verify your module still works
- [ ] Report any issues

---

## 🚨 CRITICAL FILES - DO NOT SKIP

These files MUST be included by EVERYONE:

1. `ApplicationDbContext.cs` - Database context
2. `Program.cs` - Application startup
3. `appsettings.json` - Configuration
4. All files in `Migrations/` folder - Database schema
5. `PermissionSeeder.cs` - PBAC system
6. `RequirePermissionAttribute.cs` - Authorization
7. `PermissionService.cs` - Permission logic
8. All PBAC models (Permission, Role, RolePermission, UserPermission)
9. `MediPredict.csproj` - Project dependencies

**Missing any of these will cause build failures!**

---

## 📄 FINAL NOTE

This distribution ensures:
- ✅ No duplicate work
- ✅ Clear ownership per module
- ✅ Minimal merge conflicts
- ✅ Complete functionality after merge
- ✅ All team members contribute meaningfully

**Good luck with the merge! 🚀**

---

*Last Updated: December 13, 2025*
*MediPredict Backend Team - v1.0*
