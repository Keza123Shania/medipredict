# MediPredict Backend - Complete Technical Documentation

## 📚 Table of Contents
1. [Project Architecture](#project-architecture)
2. [Database Schema](#database-schema)
3. [API Endpoints by Module](#api-endpoints-by-module)
4. [Authentication & Authorization](#authentication--authorization)
5. [Services & Dependencies](#services--dependencies)
6. [File Structure Reference](#file-structure-reference)
7. [Deployment Guide](#deployment-guide)
8. [Testing Strategy](#testing-strategy)

---

## 🏗️ PROJECT ARCHITECTURE

### Technology Stack
- **Framework**: ASP.NET Core Web API (.NET 6/7/8)
- **Database**: Microsoft SQL Server
- **ORM**: Entity Framework Core
- **Authentication**: Custom JWT/Cookie-based with Claims
- **Authorization**: Permission-Based Access Control (PBAC)
- **Logging**: Serilog (File + Console)
- **Email**: SMTP Integration
- **AI Integration**: External ML Service via HttpClient

### Project Structure
```
MediPredict/
├── Controllers/Api/          # API endpoints
├── Data/
│   ├── DatabaseContext/      # EF Core DbContext
│   ├── Models/               # Entity models
│   ├── ViewModels/           # DTOs for API requests/responses
│   └── Enums/                # Enumerations
├── Services/                 # Business logic
│   ├── Interfaces/           # Service contracts
│   └── Implementations/      # Service implementations
├── Middleware/               # Custom middleware
├── Attributes/               # Custom attributes
├── Helpers/                  # Utility classes
├── Migrations/               # EF Core migrations
└── Program.cs                # Application entry point
```

---

## 🗄️ DATABASE SCHEMA

### Core Tables

#### 1. **Users** (formerly AspNetUsers)
```sql
- Id (Guid, PK)
- Email (string, unique)
- PasswordHash (string)
- FirstName (string)
- LastName (string)
- DateOfBirth (DateTime?)
- Gender (int)
- PhoneNumber (string?)
- ProfilePicture (byte[]?)
- RoleId (Guid, FK -> Roles)
- EmailConfirmed (bool)
- IsActive (bool)
- CreatedAt (DateTime)
- LastLoginAt (DateTime?)
```

#### 2. **Roles**
```sql
- Id (Guid, PK)
- Name (string, unique) - "Admin", "Doctor", "Patient"
- Description (string)
- CreatedAt (DateTime)
```

#### 3. **Permissions**
```sql
- Id (Guid, PK)
- Name (string, unique) - e.g., "ViewPatients", "CreateAppointment"
- Description (string)
- Category (string) - e.g., "Patient Management"
- CreatedAt (DateTime)
```

#### 4. **RolePermissions** (Many-to-Many)
```sql
- RoleId (Guid, FK -> Roles)
- PermissionId (Guid, FK -> Permissions)
- PK: (RoleId, PermissionId)
```

#### 5. **UserPermissions** (Many-to-Many)
```sql
- UserId (Guid, FK -> Users)
- PermissionId (Guid, FK -> Permissions)
- PK: (UserId, PermissionId)
```

#### 6. **Patients**
```sql
- Id (Guid, PK)
- UserId (Guid, FK -> Users, unique)
- BloodGroup (string?)
- Allergies (string?)
- MedicalHistory (string?)
- EmergencyContactName (string?)
- EmergencyContactPhone (string?)
- CreatedAt (DateTime)
- UpdatedAt (DateTime)
```

#### 7. **Doctors**
```sql
- Id (Guid, PK)
- UserId (Guid, FK -> Users, unique)
- Specialization (string)
- LicenseNumber (string)
- YearsOfExperience (int)
- Qualifications (string)
- Biography (string?)
- ConsultationFee (decimal)
- IsVerified (bool)
- VerificationStatus (int) - Pending/Approved/Rejected
- CreatedAt (DateTime)
- UpdatedAt (DateTime)
```

#### 8. **Appointments**
```sql
- Id (Guid, PK)
- PatientId (Guid, FK -> Patients)
- DoctorId (Guid, FK -> Doctors)
- AppointmentDate (DateTime)
- Status (int) - Pending/Confirmed/Completed/Cancelled
- ReasonForVisit (string)
- Diagnosis (string?)
- TreatmentPlan (string?)
- ConfirmationNumber (string, unique)
- CreatedAt (DateTime)
- UpdatedAt (DateTime)
```

#### 9. **Symptoms**
```sql
- Id (Guid, PK)
- Name (string, unique)
- Description (string?)
- Category (string?)
```

#### 10. **SymptomEntries**
```sql
- Id (Guid, PK)
- PatientId (Guid, FK -> Patients)
- Description (string?)
- SeverityLevel (int)
- CreatedAt (DateTime)
```

#### 11. **SymptomEntrySymptoms** (Many-to-Many)
```sql
- SymptomEntryId (Guid, FK -> SymptomEntries)
- SymptomId (Guid, FK -> Symptoms)
- PK: (SymptomEntryId, SymptomId)
```

#### 12. **Diseases**
```sql
- Id (Guid, PK)
- Name (string, unique)
- Description (string?)
- Severity (string?)
- Recommendations (string?)
```

#### 13. **AIPredictions**
```sql
- Id (Guid, PK)
- SymptomEntryId (Guid, FK -> SymptomEntries)
- DiseaseId (Guid, FK -> Diseases)
- Probability (decimal)
- PredictionDate (DateTime)
```

#### 14. **ConsultationRecords**
```sql
- Id (Guid, PK)
- AppointmentId (Guid, FK -> Appointments)
- PatientId (Guid, FK -> Patients)
- DoctorId (Guid, FK -> Doctors)
- AIPredictionId (Guid?, FK -> AIPredictions)
- ConsultationDate (DateTime)
- OfficialDiagnosis (string)
- AIDiagnosisConfirmed (bool?)
- ConsultationNotes (string?)
- TreatmentPlan (string?)
- LabTestsOrdered (string?)
- LabReports (string?)
- SpecialistReferrals (string?)
- PatientRecordNotes (string?)
- FollowUpRequired (bool)
- FollowUpDate (DateTime?)
- FollowUpInstructions (string?)
```

#### 15. **Prescriptions**
```sql
- Id (Guid, PK)
- ConsultationRecordId (Guid, FK -> ConsultationRecords)
- DrugName (string)
- Dosage (string)
- Frequency (string)
- Duration (string)
- Instructions (string?)
- CreatedAt (DateTime)
```

#### 16. **NotificationLogs**
```sql
- Id (Guid, PK)
- UserId (Guid, FK -> Users)
- Message (string)
- Type (string)
- IsRead (bool)
- CreatedAt (DateTime)
```

---

## 🔌 API ENDPOINTS BY MODULE

### Authentication Module (Therese)

#### POST `/api/Auth/register`
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "gender": 1,
  "phoneNumber": "+1234567890",
  "role": "Patient"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "success": true,
    "userId": "guid",
    "email": "user@example.com"
  }
}
```

#### POST `/api/Auth/login`
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* ApplicationUser object */ },
    "token": "jwt-token-if-using-jwt"
  }
}
```

#### POST `/api/Auth/logout`
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET `/api/Auth/current-user?userId={guid}`
**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": { /* ApplicationUser object */ }
}
```

---

### AI & Symptoms Module (Yvan)

#### POST `/api/AnalyzeSymptoms`
**Permission:** `CreateSymptomEntry`
**Request Body:**
```json
{
  "patientId": "guid",
  "symptoms": [
    {
      "symptomId": "guid",
      "severity": 5
    }
  ],
  "description": "Feeling unwell for 3 days",
  "severityLevel": 7
}
```
**Response:**
```json
{
  "success": true,
  "message": "Symptoms analyzed successfully",
  "data": {
    "entryId": "guid",
    "predictions": [
      {
        "disease": "Common Cold",
        "probability": 0.75,
        "description": "Viral infection..."
      }
    ]
  }
}
```

#### POST `/api/Predictions`
**Permission:** `CreatePrediction`
**Request Body:**
```json
{
  "symptomEntryId": "guid",
  "symptoms": ["fever", "cough", "headache"]
}
```

#### GET `/api/Predictions/{entryId}`
**Response:** Prediction details

#### GET `/api/Predictions/history/{userId}`
**Response:** List of all predictions for user

#### GET `/api/Symptoms`
**Permission:** `ViewSymptoms`
**Response:** List of all available symptoms

---

### Doctor Search & Medical Records Module (Shania)

#### GET `/api/Doctors`
**Permission:** `ViewDoctors`
**Query Parameters:**
- `specialization` (string, optional)
- `name` (string, optional)
- `isVerified` (bool, optional)
- `page` (int, default: 1)
- `pageSize` (int, default: 12)

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "guid",
        "firstName": "Jane",
        "lastName": "Smith",
        "specialization": "Cardiology",
        "yearsOfExperience": 10,
        "consultationFee": 150.00,
        "isVerified": true
      }
    ],
    "totalCount": 25,
    "currentPage": 1,
    "pageSize": 12
  }
}
```

#### GET `/api/Doctors/{id}`
**Response:** Detailed doctor profile

#### GET `/api/Doctors/specializations`
**Response:** List of all specializations

#### GET `/api/Profile/patient/{userId}`
**Permission:** `ViewPatients`
**Response:** Patient profile with medical history

#### GET `/api/MedicalHistory/{userId}`
**Permission:** `ViewConsultations`
**Response:**
```json
{
  "success": true,
  "data": {
    "patientId": "guid",
    "patientName": "John Doe",
    "consultations": [ /* array of consultations */ ],
    "appointments": [ /* array of appointments */ ],
    "predictions": [ /* array of AI predictions */ ],
    "totalConsultations": 5,
    "totalAppointments": 8,
    "totalPredictions": 3
  }
}
```

#### GET `/api/MedicalHistory/consultation/{consultationId}?userId={userId}`
**Permission:** `ViewConsultations`
**Response:** Detailed consultation record

#### GET `/api/Dashboard/patient/{userId}`
**Permission:** `ViewPatients`
**Response:** Patient dashboard with upcoming appointments, recent predictions, statistics

---

### Appointments Module (Tsuu)

#### GET `/api/Appointments`
**Permission:** `ViewAppointments`
**Query Parameters:**
- `userId` (string, required)
- `role` (string, optional) - "Patient" or "Doctor"
- `status` (string, optional) - "Pending", "Confirmed", "Completed", "Cancelled"

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "guid",
        "patientName": "John Doe",
        "doctorName": "Dr. Jane Smith",
        "appointmentDate": "2025-12-20T10:00:00",
        "status": "Confirmed",
        "reasonForVisit": "Annual checkup",
        "confirmationNumber": "APT123456"
      }
    ]
  }
}
```

#### GET `/api/Appointments/{id}?userId={userId}`
**Permission:** `ViewAppointments`
**Response:** Single appointment details

#### POST `/api/Appointments`
**Permission:** `CreateAppointment`
**Request Body:**
```json
{
  "patientId": "guid",
  "doctorId": "guid",
  "appointmentDate": "2025-12-20T10:00:00",
  "reasonForVisit": "General consultation",
  "symptomEntryId": "guid"
}
```

#### PUT `/api/Appointments/{id}/cancel`
**Permission:** `CancelAppointment`
**Response:** Success message

#### PUT `/api/Appointments/{id}/reschedule`
**Permission:** `UpdateAppointment`
**Request Body:**
```json
{
  "newAppointmentDate": "2025-12-25T14:00:00"
}
```

---

### Consultations Module (Kendra)

#### GET `/api/Consultations/appointment/{appointmentId}`
**Permission:** `ViewConsultations`
**Response:** Consultation record for specific appointment

#### POST `/api/Consultations`
**Permission:** `CreateConsultation`
**Request Body:**
```json
{
  "appointmentId": "guid",
  "patientId": "guid",
  "doctorId": "guid",
  "aiPredictionId": "guid",
  "officialDiagnosis": "Common viral infection",
  "aiDiagnosisConfirmed": true,
  "consultationNotes": "Patient presents with...",
  "treatmentPlan": "Rest, fluids, OTC medication",
  "labTestsOrdered": "None",
  "followUpRequired": false,
  "prescriptions": [
    {
      "drugName": "Ibuprofen",
      "dosage": "400mg",
      "frequency": "Every 6 hours",
      "duration": "3 days",
      "instructions": "Take with food"
    }
  ]
}
```

#### GET `/api/Consultations/patient/{patientId}/history`
**Permission:** `ViewConsultations`
**Response:** All consultation history for patient

#### GET `/api/Dashboard/doctor/{userId}`
**Permission:** `ViewDoctors`
**Response:** Doctor dashboard with appointments, consultations, statistics

#### GET `/api/Dashboard/admin`
**Permission:** `ViewSystemLogs` (or admin-specific)
**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "totalPatients": 1200,
    "totalDoctors": 300,
    "totalAppointments": 5000,
    "pendingDoctorVerifications": 15,
    "topDiseases": [
      {
        "disease": "Common Cold",
        "count": 450
      }
    ],
    "recentActivities": [ /* array of logs */ ]
  }
}
```

---

### Admin Module (Therese, Yvan, Kendra)

#### GET `/api/Admin/doctors/pending`
**Permission:** `VerifyDoctor`
**Response:** List of doctors awaiting verification

#### POST `/api/Admin/doctors/{doctorId}/approve`
**Permission:** `VerifyDoctor`
**Response:** Success message + email sent to doctor

#### POST `/api/Admin/doctors/{doctorId}/reject`
**Permission:** `VerifyDoctor`
**Request Body:**
```json
{
  "reason": "Incomplete credentials"
}
```

#### GET `/api/Admin/patients`
**Permission:** `ViewPatients`
**Response:** List of all patients

#### GET `/api/Admin/doctors`
**Permission:** `ViewDoctors`
**Response:** List of all doctors

#### POST `/api/Admin/users/{userId}/suspend`
**Permission:** `ManageUsers`
**Response:** User suspended

#### POST `/api/Admin/users/{userId}/activate`
**Permission:** `ManageUsers`
**Response:** User activated

#### POST `/api/Admin/users/{userId}/block`
**Permission:** `ManageUsers`
**Response:** User blocked

#### POST `/api/Admin/users/{userId}/unblock`
**Permission:** `ManageUsers`
**Response:** User unblocked

#### PUT `/api/Admin/appointments/{appointmentId}/status`
**Permission:** `UpdateAppointment`
**Request Body:**
```json
{
  "status": "Completed"
}
```

#### GET `/api/Admin/logs`
**Permission:** `ViewSystemLogs`
**Query Parameters:**
- `page` (int)
- `pageSize` (int)
- `level` (string) - "Info", "Warning", "Error"

**Response:** System activity logs

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Authentication Flow

1. **User Registration**
   - User submits registration form
   - `CustomAuthService.RegisterAsync()` validates and creates user
   - Password hashed using BCrypt/similar
   - User assigned to Role (Patient/Doctor/Admin)
   - Email verification token sent (optional)

2. **User Login**
   - User submits email + password
   - `CustomAuthService.LoginAsync()` validates credentials
   - On success, authentication cookie/JWT issued
   - Claims added: UserId, Email, RoleId, RoleName

3. **Authentication Middleware**
   - `CustomAuthenticationMiddleware` intercepts requests
   - Validates cookie/JWT token
   - Extracts claims and attaches to HttpContext.User
   - Sets `UserId` and `RoleName` claims

### Authorization Flow (PBAC)

1. **Permission Seeding**
   - On application startup, `PermissionSeeder` runs
   - Seeds 40+ permissions across 9 categories
   - Creates 3 roles: Admin, Doctor, Patient
   - Maps permissions to roles:
     - **Admin**: All permissions
     - **Doctor**: 17 permissions (consultations, appointments, patient data)
     - **Patient**: 8 permissions (view own data, create appointments)

2. **Permission Checking**
   - Controller action decorated with `[RequirePermission("PermissionName")]`
   - `RequirePermissionAttribute` (IAsyncAuthorizationFilter) executes before action
   - Extracts `UserId` from claims
   - Calls `PermissionService.HasPermissionAsync(userId, permissionName)`
   - `PermissionService` checks:
     - User's direct permissions (`UserPermissions` table)
     - User's role permissions (`RolePermissions` via `Roles`)
   - If permission found, allows request
   - If not found, returns 403 Forbidden

3. **Permission Assignment**
   - Admins can assign custom permissions to users via `PermissionService.AssignPermissionToUserAsync()`
   - Useful for exceptions (e.g., temp admin rights)

### Key Permission Names
```
Patient Management:
- ViewPatients
- UpdatePatient
- DeletePatient

Doctor Management:
- ViewDoctors
- VerifyDoctor
- UpdateDoctor

Appointments:
- ViewAppointments
- CreateAppointment
- UpdateAppointment
- CancelAppointment

Consultations:
- ViewConsultations
- CreateConsultation
- UpdateConsultation

Prescriptions:
- ViewPrescriptions
- CreatePrescription

AI/Symptoms:
- CreateSymptomEntry
- ViewSymptoms
- CreatePrediction

Admin:
- ManageUsers
- ViewSystemLogs
- ManagePermissions
```

---

## 🛠️ SERVICES & DEPENDENCIES

### Service Registration (Program.cs)

```csharp
// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Custom Services
builder.Services.AddScoped<ICustomAuthService, CustomAuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAIService, AIService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IProfilePictureService, ProfilePictureService>();
builder.Services.AddScoped<IDatabaseService, DatabaseService>();

// Background Services
builder.Services.AddHostedService<AppointmentReminderService>();

// HttpClient for ML integration
builder.Services.AddHttpClient();
```

### Service Descriptions

#### **CustomAuthService**
- User registration
- Login/logout
- Password hashing/verification
- User retrieval by ID/email
- Update last login timestamp

#### **UserService**
- User management operations
- Profile updates
- DEPRECATED: Contains RegisterUserAsync (redirects to CustomAuthService)

#### **AIService**
- Symptom analysis
- ML model integration via HTTP
- Prediction result processing
- Disease data retrieval

#### **AppointmentService**
- Appointment creation
- Appointment cancellation/rescheduling
- Availability checking
- Confirmation number generation

#### **DoctorService**
- Doctor search/filtering
- Doctor profile retrieval
- Specialization management
- Verification status updates

#### **AdminService**
- Doctor verification (approve/reject)
- User management (suspend/activate/block)
- System analytics
- Log retrieval

#### **PermissionService**
- Permission checking (`HasPermissionAsync`)
- Get user permissions
- Assign/remove permissions to users
- Assign/remove permissions to roles

#### **EmailService**
- Send appointment confirmations
- Send verification emails
- Send password reset emails
- Send doctor approval/rejection emails

#### **AppointmentReminderService** (Background)
- Runs every hour
- Checks appointments within next 24 hours
- Sends reminder emails

#### **DatabaseService**
- Execute stored procedures (if using Dapper)
- Query execution with parameters

---

## 📁 FILE STRUCTURE REFERENCE

### Complete File Listing

```
MediPredict/
│
├── Controllers/Api/
│   ├── AdminController.cs              # Admin operations
│   ├── AnalyzeSymptomsController.cs    # Symptom analysis
│   ├── AppointmentsController.cs       # Appointment management
│   ├── AuthController.cs               # Authentication
│   ├── ConsultationsController.cs      # Consultations
│   ├── DashboardController.cs          # Dashboards (Patient/Doctor/Admin)
│   ├── DoctorsController.cs            # Doctor search/profiles
│   ├── MedicalHistoryController.cs     # Medical records
│   ├── PredictionsController.cs        # AI predictions
│   ├── ProfileController.cs            # User profiles
│   └── SymptomsController.cs           # Symptom management
│
├── Data/
│   ├── DatabaseContext/
│   │   └── ApplicationDbContext.cs     # EF Core DbContext
│   │
│   ├── Models/
│   │   ├── AIPrediction.cs
│   │   ├── ApiResponse.cs
│   │   ├── ApplicationUser.cs
│   │   ├── Appointment.cs
│   │   ├── ConsultationRecord.cs
│   │   ├── Disease.cs
│   │   ├── Doctor.cs
│   │   ├── DoctorAffiliation.cs
│   │   ├── HealthcareOrganization.cs
│   │   ├── NotificationLog.cs
│   │   ├── Patient.cs
│   │   ├── Permission.cs
│   │   ├── Person.cs
│   │   ├── Prescription.cs
│   │   ├── Role.cs
│   │   ├── RolePermission.cs
│   │   ├── Symptom.cs
│   │   ├── SymptomEntry.cs
│   │   ├── SymptomEntrySymptom.cs
│   │   ├── User.cs
│   │   ├── UserPermission.cs
│   │   └── Enums/
│   │       ├── AppointmentStatus.cs
│   │       ├── Gender.cs
│   │       └── UserRole.cs
│   │
│   ├── ViewModels/
│   │   ├── AdminViewModel.cs
│   │   ├── AppointmentViewModel.cs
│   │   ├── ComprehensivePredictionViewModel.cs
│   │   ├── ConsultationViewModel.cs
│   │   ├── DoctorProfileViewModel.cs
│   │   ├── MockPredictionResultViewModel.cs
│   │   ├── PredictionResultViewModel.cs
│   │   ├── ProfileViewModels.cs
│   │   ├── SymptomEntryViewModel.cs
│   │   ├── SymptomInputViewModel.cs
│   │   └── UserRegistrationViewModel.cs
│   │
│   └── PermissionSeeder.cs             # Seeds permissions & roles
│
├── Services/
│   ├── IEmailService.cs
│   ├── PermissionService.cs            # PBAC logic
│   │
│   ├── Interfaces/
│   │   ├── IAdminService.cs
│   │   ├── IAIService.cs
│   │   ├── IAppointmentService.cs
│   │   ├── IAuthenticationService.cs
│   │   ├── ICustomAuthService.cs
│   │   ├── IDoctorService.cs
│   │   ├── IProfilePictureService.cs
│   │   └── IUserService.cs
│   │
│   └── Implementations/
│       ├── AdminService.cs
│       ├── AIService.cs
│       ├── AppointmentReminderService.cs
│       ├── AppointmentService.cs
│       ├── CustomAuthService.cs
│       ├── DatabaseService.cs
│       ├── DoctorService.cs
│       ├── EmailService.cs
│       ├── ProfilePictureService.cs
│       └── UserService.cs
│
├── Attributes/
│   └── RequirePermissionAttribute.cs   # Authorization filter
│
├── Middleware/
│   └── CustomAuthenticationMiddleware.cs
│
├── Helpers/
│   ├── AuthorizationHelper.cs
│   └── EnumHelper.cs
│
├── Migrations/                         # All EF Core migrations
│
├── Properties/
│   └── launchSettings.json
│
├── wwwroot/                            # Static files
│
├── appsettings.json
├── appsettings.Development.json
├── MediPredict.csproj
├── Program.cs
└── MediPredict.http                    # HTTP test requests
```

---

## 🚀 DEPLOYMENT GUIDE

### Prerequisites
- SQL Server (local or Azure)
- .NET SDK 6/7/8
- Visual Studio 2022 or VS Code
- Git

### Step 1: Database Setup

1. **Update Connection String** in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MediPredictDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

2. **Apply Migrations**:
```bash
dotnet ef database update
```

3. **Seed Data** (runs automatically on startup via `PermissionSeeder`)

### Step 2: Configuration

1. **Email Settings** (in `appsettings.json`):
```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "noreply@medipredict.com",
    "SenderName": "MediPredict",
    "Username": "your-email",
    "Password": "your-app-password"
  }
}
```

2. **AI Service URL** (if using external ML):
```json
{
  "AIService": {
    "BaseUrl": "https://ml-service.example.com",
    "ApiKey": "your-api-key"
  }
}
```

### Step 3: Build & Run

```bash
# Restore packages
dotnet restore

# Build project
dotnet build

# Run application
dotnet run
```

Application will start on:
- **HTTP**: http://localhost:5000
- **HTTPS**: https://localhost:5001

### Step 4: Test Endpoints

1. Navigate to **Swagger UI**: `https://localhost:5001/swagger`
2. Test authentication: Register → Login
3. Test protected endpoints with proper permissions

### Step 5: Production Deployment

#### Option A: Azure App Service
```bash
# Publish to Azure
dotnet publish -c Release
# Deploy via Azure Portal or CLI
az webapp deploy --resource-group <rg> --name <app-name> --src-path ./bin/Release/net6.0/publish.zip
```

#### Option B: IIS
1. Publish: `dotnet publish -c Release`
2. Copy output to IIS directory
3. Configure application pool (.NET CLR Version: No Managed Code)
4. Set permissions for IIS user

#### Option C: Docker
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY bin/Release/net6.0/publish/ .
ENTRYPOINT ["dotnet", "MediPredict.dll"]
```

---

## 🧪 TESTING STRATEGY

### Unit Tests
Focus on:
- **Services**: CustomAuthService, AIService, AppointmentService
- **Permission Logic**: PermissionService.HasPermissionAsync
- **Helpers**: EnumHelper, AuthorizationHelper

Example test:
```csharp
[Fact]
public async Task RegisterAsync_ValidUser_ReturnsSuccess()
{
    // Arrange
    var authService = new CustomAuthService(mockContext, mockLogger);
    var model = new UserRegistrationViewModel { /* ... */ };

    // Act
    var (success, message, user) = await authService.RegisterAsync(model);

    // Assert
    Assert.True(success);
    Assert.NotNull(user);
}
```

### Integration Tests
Test complete API flows:
- Register → Login → Create Appointment → Get Appointments
- Doctor Search → View Profile → Book Appointment
- Symptom Entry → AI Prediction → View Results

### Manual Testing Checklist
- [ ] User registration (Patient, Doctor)
- [ ] Login/Logout
- [ ] Patient: Submit symptoms → View predictions
- [ ] Patient: Search doctors → Book appointment
- [ ] Doctor: View appointments → Create consultation
- [ ] Doctor: Write prescription
- [ ] Admin: Verify doctor → Approve
- [ ] Admin: View system logs
- [ ] Permission checks (try accessing forbidden endpoints)

---

## 📊 KEY METRICS TO MONITOR

### Application Metrics
- Active users (daily/weekly/monthly)
- Appointments created/completed/cancelled
- AI predictions requested
- Doctor verification turnaround time

### Performance Metrics
- API response time (target: <200ms)
- Database query time
- Concurrent users supported
- Error rate (target: <1%)

### Business Metrics
- Patient-to-doctor ratio
- Average consultations per doctor
- Most common diseases predicted
- Appointment cancellation rate

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Cannot access a disposed object: DbContext"
**Solution**: Ensure services are registered as `Scoped`, not `Singleton`

### Issue 2: "401 Unauthorized" on protected endpoints
**Solution**: 
- Check authentication cookie/JWT is sent
- Verify `CustomAuthenticationMiddleware` is running
- Check `UserId` claim is present

### Issue 3: "403 Forbidden" on endpoint
**Solution**:
- Verify user has required permission in database
- Check `RequirePermission` attribute has correct permission name
- Run PermissionSeeder to ensure permissions exist

### Issue 4: Migration fails
**Solution**:
```bash
# Drop database and recreate
dotnet ef database drop
dotnet ef database update
```

---

## 📞 SUPPORT & MAINTENANCE

### Code Review Checklist
- [ ] All endpoints have permission attributes
- [ ] No sensitive data in logs
- [ ] Proper exception handling
- [ ] Input validation on all endpoints
- [ ] Database queries use parameters (SQL injection protection)

### Regular Maintenance Tasks
- Review and rotate API keys monthly
- Audit user permissions quarterly
- Clean up old logs (>90 days)
- Backup database daily
- Update NuGet packages for security patches

---

## 📝 CHANGE LOG

### Version 1.0 (December 2025)
- Initial release
- Permission-Based Access Control implemented
- All CRUD operations for patients, doctors, appointments
- AI prediction integration
- Email notifications
- Admin dashboard with analytics

---

## 🎯 FUTURE ENHANCEMENTS

### Planned Features
1. **Real-time Notifications** (SignalR)
2. **Video Consultation** (WebRTC integration)
3. **Mobile App API** (optimized endpoints)
4. **Multi-language Support**
5. **Advanced Analytics Dashboard**
6. **Payment Integration** (Stripe/PayPal)
7. **Insurance Claims Processing**
8. **Telemedicine Compliance** (HIPAA)

---

## 📚 ADDITIONAL RESOURCES

### Documentation Links
- [ASP.NET Core Docs](https://docs.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [Serilog](https://serilog.net/)

### Team Contacts
- **Project Lead**: [Name]
- **Backend Team**: Therese, Yvan, Shania, Tsuu, Kendra
- **Repository**: [GitHub URL]

---

*Last Updated: December 13, 2025*
*MediPredict Backend v1.0 - Complete Technical Documentation*
