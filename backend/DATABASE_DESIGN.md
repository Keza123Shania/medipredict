# MediPredict Database Design Documentation

## Overview
This document describes the complete database structure for the MediPredict application, a medical prediction and consultation management system built on ASP.NET Core Web API with Entity Framework Core and SQL Server.

**Database Name:** MediPredictDB  
**Connection Type:** SQL Server with Integrated Security  
**ORM:** Entity Framework Core 8.0.20  
**Additional Data Access:** Dapper 2.1.66 for stored procedures  

---

## Database Architecture

### Core Domains
1. **User Management** - Authentication and user profiles
2. **Medical Records** - Patient and doctor profiles
3. **Symptom Analysis** - AI-powered symptom tracking and disease prediction
4. **Appointments** - Scheduling and appointment management
5. **Consultations** - Doctor consultations and medical records
6. **Prescriptions** - Medication and treatment prescriptions

---

## Table Definitions

### 1. AspNetUsers
**Purpose:** Core authentication and user information table for all system users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | string (GUID) | PK, Required | Unique user identifier |
| UserName | string(256) | Required, Indexed | Username for login |
| Email | string(256) | Required, Unique, Indexed | User email address |
| PasswordHash | string | Required | Hashed password |
| FirstName | string(50) | Required | User's first name |
| LastName | string(50) | Required | User's last name |
| DateOfBirth | DateTime | Required | User's date of birth |
| Gender | string(10) | Required | User's gender |
| Role | string(20) | Required, Indexed | User role: "Patient", "Doctor", or "Admin" |
| PhoneNumber | string(20) | Nullable | Contact phone number |
| ProfilePicture | string(500) | Nullable | Path to profile picture |
| IsActive | bool | Default: true | Account active status |
| CreatedAt | DateTime | Default: UTC Now | Account creation timestamp |
| LastLoginAt | DateTime | Nullable | Last login timestamp |

**Relationships:**
- One-to-One with Patient (optional)
- One-to-One with Doctor (optional)

**Indexes:**
- Primary Key: Id
- Unique: Email
- Non-Unique: Role

**Business Rules:**
- A user can be either a Patient OR a Doctor (mutually exclusive)
- Admin users exist without Patient/Doctor profiles
- Email must be unique across all users

---

### 2. Patients
**Purpose:** Extended profile information for users with Patient role

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | int | PK, Identity | Patient record identifier |
| UserId | string | FK, Required, Unique | Reference to AspNetUsers.Id |
| BloodGroup | string(5) | Nullable | Blood type (e.g., "A+", "O-") |
| Allergies | string | Nullable | Known allergies |
| MedicalHistory | string | Nullable | Patient's medical history |
| EmergencyContact | string(100) | Nullable | Emergency contact name |
| EmergencyPhone | string(20) | Nullable | Emergency contact phone |
| Address | string(500) | Nullable | Patient's address |
| ProfilePicture | string(500) | Nullable | Path to profile picture |
| DateOfBirth | DateTime | Required | Date of birth |
| Gender | string(20) | Required | Gender |
| CreatedAt | DateTime | Default: UTC Now | Record creation timestamp |
| UpdatedAt | DateTime | Default: UTC Now | Last update timestamp |

**Relationships:**
- One-to-One with ApplicationUser (FK: UserId) - CASCADE DELETE
- One-to-Many with SymptomEntries
- One-to-Many with Appointments
- One-to-Many with ConsultationRecords

**Indexes:**
- Primary Key: Id
- Unique: UserId

**Business Rules:**
- Must have corresponding ApplicationUser with Role = "Patient"
- Deleting user cascades to delete patient profile

---

### 3. Doctors
**Purpose:** Extended profile information for users with Doctor role, including professional credentials

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | int | PK, Identity | Doctor record identifier |
| UserId | string | FK, Required, Unique | Reference to AspNetUsers.Id |
| Specialization | string(100) | Required, Indexed | Medical specialization |
| Qualifications | string | Required | Educational qualifications |
| Experience | int | Required, Range: 0-60 | Years of experience |
| LicenseNumber | string(50) | Required, Unique, Indexed | Medical license number |
| IsVerified | bool | Default: false, Indexed | Admin verification status |
| ConsultationFee | decimal(18,2) | Required, Range: 0-10000 | Fee per consultation |
| Bio | string | Nullable | Doctor biography |
| AvailableDays | string(100) | Nullable | Days available (e.g., "Mon,Wed,Fri") |
| AvailableTimeStart | TimeSpan | Nullable | Start of availability window |
| AvailableTimeEnd | TimeSpan | Nullable | End of availability window |
| Address | string(500) | Nullable | Clinic/office address |
| ProfilePicture | string(500) | Nullable | Path to profile picture |
| CreatedAt | DateTime | Default: UTC Now | Record creation timestamp |
| UpdatedAt | DateTime | Default: UTC Now | Last update timestamp |

**Relationships:**
- One-to-One with ApplicationUser (FK: UserId) - CASCADE DELETE
- One-to-Many with Appointments
- One-to-Many with ConsultationRecords

**Indexes:**
- Primary Key: Id
- Unique: UserId, LicenseNumber
- Non-Unique: Specialization, IsVerified

**Business Rules:**
- Must have corresponding ApplicationUser with Role = "Doctor"
- Only verified doctors (IsVerified = true) can accept appointments
- LicenseNumber must be unique across all doctors
- Deleting user cascades to delete doctor profile

---

### 4. Symptoms
**Purpose:** Master list of possible symptoms for AI prediction system

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | int | PK, Identity | Symptom identifier |
| Name | string(200) | Required | Symptom name |
| Description | string(500) | Nullable | Symptom description |
| Category | string(100) | Nullable | Symptom category/system affected |
| SeverityLevel | int | Range: 1-5, Default: 1 | Severity scale (1=mild, 5=severe) |
| IsActive | bool | Default: true | Whether symptom is active in system |

**Relationships:**
- No direct foreign key relationships (referenced in JSON)

**Indexes:**
- Primary Key: Id

**Business Rules:**
- Symptoms are referenced by ID in SymptomEntry.SymptomsJson
- Inactive symptoms (IsActive = false) hidden from user selection

---

### 5. Diseases
**Purpose:** Master list of diseases that can be predicted by the AI system

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | int | PK, Identity | Disease identifier |
| Name | string(200) | Required | Disease name |
| Description | string | Nullable | Disease description |
| SymptomsDescription | string | Nullable | Common symptoms description |
| RecommendedAction | string | Nullable | Recommended actions for patients |
| Precautions | string | Nullable | Precautionary measures |
| ProbabilityScore | decimal(5,2) | Range: 0-100, Nullable | Base probability score |
| IsActive | bool | Default: true | Whether disease is active in system |

**Relationships:**
- One-to-Many with AIPredictions - RESTRICT DELETE

**Indexes:**
- Primary Key: Id

**Business Rules:**
- Inactive diseases (IsActive = false) not used in predictions
- Cannot delete disease if referenced by AIPredictions

---

### 6. SymptomEntries
**Purpose:** Patient-reported symptoms for AI analysis

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | int | PK, Identity | Symptom entry identifier |
| PatientId | int | FK, Required | Reference to Patients.Id |
| SymptomsJson | string | Required | JSON array of symptom IDs |
| SeverityLevel | int | Range: 1-5, Default: 1 | Overall severity (1=mild, 5=severe) |
| Description | string(500) | Nullable | Additional description from patient |
| CreatedAt | DateTime | Default: UTC Now | Entry creation timestamp |

**Relationships:**
- Many-to-One with Patient (FK: PatientId) - CASCADE DELETE
- One-to-Many with AIPredictions
- One-to-Many with Appointments (optional link)

**Indexes:**
- Primary Key: Id

**Business Rules:**
- SymptomsJson stores array of Symptom.Id values
- Deleting patient cascades to delete symptom entries
- Each entry can trigger multiple AI predictions

---

### 7. AIPredictions
**Purpose:** AI-generated disease predictions based on symptoms

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | int | PK, Identity | Prediction identifier |
| SymptomEntryId | int | FK, Required | Reference to SymptomEntries.Id |
| DiseaseId | int | FK, Required | Reference to Diseases.Id |
| Probability | decimal(5,2) | Required, Range: 0-100 | Disease probability percentage |
| ConfidenceLevel | decimal(5,2) | Range: 0-100, Nullable | AI confidence percentage |
| Recommendations | string | Nullable | AI-generated recommendations |
| CreatedAt | DateTime | Default: UTC Now | Prediction timestamp |

**Relationships:**
- Many-to-One with SymptomEntry (FK: SymptomEntryId) - CASCADE DELETE
- Many-to-One with Disease (FK: DiseaseId) - RESTRICT DELETE
- One-to-Many with ConsultationRecords (optional reference)

**Indexes:**
- Primary Key: Id

**Business Rules:**
- Multiple predictions per symptom entry (different diseases)
- Deleting symptom entry cascades to delete predictions
- Cannot delete disease if predictions exist (RESTRICT)
- Predictions ordered by Probability (highest first)

---

### 8. Appointments
**Purpose:** Scheduled appointments between patients and doctors

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | int | PK, Identity | Appointment identifier |
| PatientId | int | FK, Required | Reference to Patients.Id |
| DoctorId | int | FK, Required | Reference to Doctors.Id |
| ConsultationRequestId | int | Nullable | Legacy consultation request ID |
| SymptomEntryId | int | FK, Nullable | Link to symptom entry if AI-driven |
| ScheduledDate | DateTime | Required | When appointment was scheduled |
| AppointmentDate | DateTime | Required | Actual appointment date/time |
| DurationMinutes | int | Range: 15-480, Default: 30 | Appointment duration |
| Status | string(20) | Required, Default: "Scheduled" | Status: Scheduled, Completed, Cancelled, NoShow |
| Notes | string(500) | Nullable | General notes |
| Diagnosis | string | Nullable | Doctor's diagnosis (post-appointment) |
| TreatmentPlan | string | Nullable | Treatment plan (post-appointment) |
| ConfirmationNumber | string(50) | Required | Unique confirmation code |
| ReasonForVisit | string(500) | Nullable | Patient's reason for visit |
| CreatedAt | DateTime | Default: UTC Now | Record creation timestamp |
| UpdatedAt | DateTime | Default: UTC Now | Last update timestamp |

**Email Reminder Tracking:**
| Column | Type | Description |
|--------|------|-------------|
| ConfirmationEmailSent | bool | Confirmation email sent flag |
| ConfirmationEmailSentAt | DateTime | Confirmation email timestamp |
| ThreeWeekReminderSent | bool | 3-week reminder sent flag |
| ThreeWeekReminderSentAt | DateTime | 3-week reminder timestamp |
| ThreeDayReminderSent | bool | 3-day reminder sent flag |
| ThreeDayReminderSentAt | DateTime | 3-day reminder timestamp |
| OneDayReminderSent | bool | 1-day reminder sent flag |
| OneDayReminderSentAt | DateTime | 1-day reminder timestamp |
| SameDayReminderSent | bool | Same-day reminder sent flag |
| SameDayReminderSentAt | DateTime | Same-day reminder timestamp |
| CancellationEmailSent | bool | Cancellation email sent flag |
| CancellationEmailSentAt | DateTime | Cancellation email timestamp |

**Relationships:**
- Many-to-One with Patient (FK: PatientId) - RESTRICT DELETE
- Many-to-One with Doctor (FK: DoctorId) - RESTRICT DELETE
- Many-to-One with SymptomEntry (FK: SymptomEntryId) - RESTRICT DELETE (optional)
- One-to-Many with ConsultationRecords

**Indexes:**
- Primary Key: Id

**Business Rules:**
- Status values: "Scheduled", "Completed", "Cancelled", "NoShow"
- Cannot delete patient/doctor if appointments exist (RESTRICT)
- SymptomEntryId links appointment to AI prediction if applicable
- ConfirmationNumber used for patient lookup
- Email reminder system tracks all notification stages

---

### 9. ConsultationRecords
**Purpose:** Detailed medical records from doctor-patient consultations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | int | PK, Identity | Consultation record identifier |
| AppointmentId | int | FK, Required | Reference to Appointments.Id |
| PatientId | int | FK, Required | Reference to Patients.Id |
| DoctorId | int | FK, Required | Reference to Doctors.Id |
| AIPredictionId | int | FK, Nullable | Reference to AIPredictions.Id |
| OfficialDiagnosis | string(500) | Required | Doctor's official diagnosis |
| AIDiagnosisConfirmed | bool | Required | Whether AI prediction was accurate |
| ConsultationNotes | string(2000) | Nullable | Consultation notes |
| TreatmentPlan | string(2000) | Nullable | Prescribed treatment plan |
| LabTestsOrdered | string(1000) | Nullable | Lab tests ordered |
| LabReports | string(2000) | Nullable | Lab test results |
| SpecialistReferrals | string(1000) | Nullable | Referrals to specialists |
| PatientRecordNotes | string(3000) | Nullable | Additional patient record notes |
| FollowUpRequired | bool | Default: false | Follow-up needed flag |
| FollowUpDate | DateTime | Nullable | Scheduled follow-up date |
| FollowUpInstructions | string(1000) | Nullable | Follow-up instructions |
| ConsultationDate | DateTime | Required | Date of consultation |
| CreatedAt | DateTime | Default: UTC Now | Record creation timestamp |
| UpdatedAt | DateTime | Nullable | Last update timestamp |

**Relationships:**
- Many-to-One with Appointment (FK: AppointmentId) - RESTRICT DELETE
- Many-to-One with Patient (FK: PatientId) - RESTRICT DELETE
- Many-to-One with Doctor (FK: DoctorId) - RESTRICT DELETE
- Many-to-One with AIPrediction (FK: AIPredictionId) - SET NULL (optional)
- One-to-Many with Prescriptions

**Indexes:**
- Primary Key: Id

**Business Rules:**
- One consultation record per appointment (after completion)
- Cannot delete appointment/patient/doctor if consultation exists (RESTRICT)
- AIPredictionId can be null if appointment not AI-driven
- AIDiagnosisConfirmed tracks AI accuracy for analytics
- If AIPrediction deleted, reference set to NULL

---

### 10. Prescriptions
**Purpose:** Medication prescriptions associated with consultations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | int | PK, Identity | Prescription identifier |
| ConsultationRecordId | int | FK, Required | Reference to ConsultationRecords.Id |
| DrugName | string(200) | Required | Name of prescribed medication |
| Dosage | string(100) | Required | Dosage amount |
| Frequency | string(100) | Required | How often to take (e.g., "3x daily") |
| Duration | string(100) | Required | Duration (e.g., "7 days") |
| Instructions | string(500) | Nullable | Special instructions |
| CreatedAt | DateTime | Default: UTC Now | Prescription creation timestamp |

**Relationships:**
- Many-to-One with ConsultationRecord (FK: ConsultationRecordId) - CASCADE DELETE

**Indexes:**
- Primary Key: Id

**Business Rules:**
- Multiple prescriptions per consultation
- Deleting consultation cascades to delete prescriptions

---

## Entity Relationships Diagram (ERD)

```
┌─────────────────┐
│  AspNetUsers    │
│  (Base Auth)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│ Patient │ │  Doctor  │
└────┬────┘ └────┬─────┘
     │           │
     │    ┌──────┴──────────┐
     │    │                 │
     ▼    ▼                 ▼
┌───────────────┐    ┌────────────────┐
│ SymptomEntry  │    │  Appointments  │
└───────┬───────┘    └───────┬────────┘
        │                    │
        ▼                    ▼
┌───────────────┐    ┌──────────────────────┐
│ AIPrediction  │◄───┤ ConsultationRecord   │
└───────┬───────┘    └──────────┬───────────┘
        │                       │
        ▼                       ▼
   ┌─────────┐         ┌──────────────┐
   │ Disease │         │ Prescription │
   └─────────┘         └──────────────┘
```

---

## Cascade Delete Behavior

### CASCADE DELETE (Parent deletion removes children)
- **ApplicationUser → Patient**: Deleting user deletes patient profile
- **ApplicationUser → Doctor**: Deleting user deletes doctor profile
- **Patient → SymptomEntry**: Deleting patient deletes symptom entries
- **SymptomEntry → AIPrediction**: Deleting symptom entry deletes predictions
- **ConsultationRecord → Prescription**: Deleting consultation deletes prescriptions

### RESTRICT DELETE (Cannot delete parent if children exist)
- **Patient → Appointment**: Cannot delete patient with appointments
- **Doctor → Appointment**: Cannot delete doctor with appointments
- **SymptomEntry → Appointment**: Cannot delete symptom entry linked to appointments
- **Appointment → ConsultationRecord**: Cannot delete appointment with consultation
- **Patient → ConsultationRecord**: Cannot delete patient with consultation records
- **Doctor → ConsultationRecord**: Cannot delete doctor with consultation records
- **Disease → AIPrediction**: Cannot delete disease with predictions

### SET NULL (Delete parent, keep children with null reference)
- **AIPrediction → ConsultationRecord**: Deleting prediction keeps consultation, sets AIPredictionId to null

---

## Key Indexes Summary

| Table | Index Type | Columns | Purpose |
|-------|-----------|---------|---------|
| AspNetUsers | Unique | Email | Login lookup, uniqueness |
| AspNetUsers | Non-Unique | Role | Role-based filtering |
| Patients | Unique | UserId | One-to-one relationship |
| Doctors | Unique | UserId | One-to-one relationship |
| Doctors | Unique | LicenseNumber | Credential uniqueness |
| Doctors | Non-Unique | Specialization | Search by specialty |
| Doctors | Non-Unique | IsVerified | Filter verified doctors |

---

## Data Integrity Constraints

### Application-Level Validations
1. **Email Format**: Must be valid email format (validated in code)
2. **Password**: Minimum 8 characters with complexity requirements
3. **Role Exclusivity**: User can only be Patient OR Doctor, not both
4. **Doctor Verification**: Only verified doctors visible to patients
5. **Appointment Status**: Limited to predefined values
6. **Date Validations**: 
   - DateOfBirth must be in past
   - AppointmentDate must be in future (when creating)
   - FollowUpDate must be after ConsultationDate

### Database-Level Constraints
1. **Required Fields**: NOT NULL constraints on essential fields
2. **Unique Constraints**: Email, LicenseNumber uniqueness
3. **Range Constraints**: SeverityLevel (1-5), Probability (0-100)
4. **Foreign Keys**: All relationships enforced at database level
5. **Default Values**: CreatedAt, IsActive, Status defaults

---

## Stored Procedures

The application uses Dapper for stored procedure execution. Procedures are located in:
- `Database/StoredProcedures/`
- `database procedures/*.sql`

### Procedure Categories:
1. **AuthenticationProcedures.sql** - User authentication
2. **UserRegistrationProcedures.sql** - User registration
3. **PatientManagementProcedures.sql** - Patient CRUD operations
4. **DoctorManagementProcedures.sql** - Doctor CRUD operations
5. **AppointmentManagementProcedures.sql** - Appointment operations
6. **AIModelProcedures.sql** - AI prediction operations
7. **AdminManagementProcedures.sql** - Admin operations

---

## Connection String

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=localhost;Initial Catalog=MediPredictDB;Integrated Security=True;TrustServerCertificate=True"
  }
}
```

**Connection Details:**
- **Server**: localhost (SQL Server)
- **Database**: MediPredictDB
- **Authentication**: Windows Integrated Security
- **SSL**: TrustServerCertificate enabled

---

## Migrations

Entity Framework migrations track schema changes over time.

### Existing Migrations:
1. `20251128122225_InitialCreate` - Initial database schema
2. `20251128122225_InitialCreate.Designer` - EF designer snapshot
3. `20251129093154_CustomAuthSystem` - Custom authentication
4. `20251129160853_AddDateOfBirthGenderAndNavigationProperties` - User properties
5. `20251129222924_AddConsultationAndPrescriptionTables` - Consultation system
6. `20251129233125_AddSymptomEntryLinkToAppointment` - Link symptom entries
7. `20251209165533_AddProfilePictureAndConsultationEnhancements` - Profile features

### Migration Commands:
```powershell
# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Rollback to specific migration
dotnet ef database update MigrationName

# Remove last migration (if not applied)
dotnet ef migrations remove
```

---

## Performance Considerations

### Optimizations Implemented:
1. **Indexes**: Strategic indexes on frequently queried columns
2. **Foreign Keys**: Proper relationship definitions for query optimization
3. **Decimal Precision**: Appropriate precision for financial/probability data
4. **String Lengths**: Appropriate maxLength constraints
5. **Delete Behavior**: RESTRICT prevents accidental data loss

### Query Performance Best Practices:
1. Use pagination for large datasets (Patients, Doctors, Appointments)
2. Filter by IsVerified when querying doctors
3. Filter by Status when querying appointments
4. Use date range filters for historical queries
5. Leverage relationship eager loading with `.Include()`

---

## Security Considerations

### Data Protection:
1. **Password Security**: Hashed passwords (never plaintext)
2. **Session Management**: Session-based authentication
3. **Role-Based Access**: Role property enforces authorization
4. **Soft Deletes**: IsActive flags prevent hard deletes
5. **Audit Trails**: CreatedAt, UpdatedAt timestamps

### Privacy:
1. **Medical Records**: HIPAA-style protection on sensitive fields
2. **Personal Information**: Minimal exposure in API responses
3. **Email Tracking**: Detailed audit trail for communications

---

## Future Enhancements (Suggested)

### Permission-Based Authorization:
Consider adding tables for granular permission control:
- **Permissions** table (permission definitions)
- **UserPermissions** table (user-specific permissions)
- **RolePermissions** table (role-to-permission mapping)

### Additional Features:
- **Audit Log** table for complete action tracking
- **Notifications** table for in-app notifications
- **Documents** table for storing medical documents
- **Billing** tables for payment processing
- **Insurance** tables for insurance information

---

## Database Size Estimates

### Expected Record Volumes (1 year):
- Users: ~10,000
- Patients: ~8,000
- Doctors: ~500
- Appointments: ~50,000
- SymptomEntries: ~30,000
- AIPredictions: ~150,000 (5 per entry)
- ConsultationRecords: ~40,000
- Prescriptions: ~120,000 (3 per consultation)

### Storage Estimates:
- Total Database Size: ~5-10 GB (1 year)
- JSON Fields (SymptomsJson): Minimal overhead
- Profile Pictures: Stored as file paths (files on disk)
- Indexes: ~10-15% overhead

---

## Maintenance Procedures

### Regular Maintenance:
1. **Index Optimization**: Rebuild fragmented indexes monthly
2. **Statistics Update**: Update query statistics weekly
3. **Backup Schedule**: 
   - Full backup: Daily
   - Differential: Every 6 hours
   - Transaction log: Every hour
4. **Archive Old Data**: Archive completed appointments > 2 years
5. **Monitor Growth**: Track table sizes and growth rates

### Health Checks:
```sql
-- Check table sizes
SELECT 
    t.NAME AS TableName,
    p.rows AS RowCounts,
    SUM(a.total_pages) * 8 AS TotalSpaceKB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
GROUP BY t.Name, p.Rows
ORDER BY TotalSpaceKB DESC;
```

---

## Version History

| Version | Date | Changes | Migration |
|---------|------|---------|-----------|
| 1.0 | Dec 2024 | Initial release | InitialCreate |
| 1.1 | Dec 2024 | Custom auth system | CustomAuthSystem |
| 1.2 | Dec 2024 | User profile enhancements | AddDateOfBirthGenderAndNavigationProperties |
| 1.3 | Dec 2024 | Consultation system | AddConsultationAndPrescriptionTables |
| 1.4 | Dec 2024 | Symptom-appointment linking | AddSymptomEntryLinkToAppointment |
| 1.5 | Dec 2024 | Profile pictures & consultation features | AddProfilePictureAndConsultationEnhancements |

---

## Contact & Support

For database-related issues or questions:
- Review migration files in `/Migrations/`
- Check stored procedures in `/database procedures/`
- Consult ApplicationDbContext.cs for relationship details
- Refer to individual model files in `/Data/Models/`

---

**Document Version:** 1.0  
**Last Updated:** December 12, 2025  
**Created By:** MediPredict Development Team
