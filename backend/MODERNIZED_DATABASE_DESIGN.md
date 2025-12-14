# MediPredict Modernized Database Design

## Executive Summary

This document describes the **modernized database schema** for MediPredict, addressing critical design flaws in the original implementation. The new design follows industry best practices, eliminates data redundancy, improves referential integrity, and provides better scalability for healthcare application requirements.

---

## 🎯 Problems Fixed

### 1. **Eliminated Duplicate Personal Information** ✅
**Problem:** Personal data (first name, last name, DOB, gender, phone, address, profile picture) existed in three tables: `AspNetUsers`, `Patients`, and `Doctors`.

**Solution:** Created abstract `Person` base class containing all shared attributes. `ApplicationUser` now inherits from `Person`, eliminating redundancy while maintaining clean separation of concerns.

### 2. **Replaced JSON Symptoms Storage** ✅
**Problem:** Symptoms stored as JSON arrays broke referential integrity and prevented proper database querying.

**Solution:** Implemented proper many-to-many relationship with `SymptomEntrySymptom` junction table, enabling database-enforced referential integrity and efficient querying.

### 3. **Extracted Email Tracking** ✅
**Problem:** 12 email tracking columns (ConfirmationEmailSent, ThreeWeekReminderSent, etc.) polluted the Appointments table.

**Solution:** Created dedicated `NotificationLog` table with flexible notification type enum, supporting unlimited notification types without schema changes.

### 4. **Added Healthcare Organization Structure** ✅
**Problem:** Doctors existed as standalone entities without organizational context.

**Solution:** Added `HealthcareOrganization` and `DoctorAffiliation` tables to model real-world healthcare structures with multiple locations and affiliations.

### 5. **Converted Status Strings to Enums** ✅
**Problem:** Status fields used hardcoded strings ("Scheduled", "Completed") without database validation.

**Solution:** Created proper enums (`AppointmentStatus`, `NotificationType`, `UserRole`, `Gender`) stored as integers with application-level type safety.

### 6. **Standardized ID Types to GUID** ✅
**Problem:** Mixed use of `string GUIDs` (AspNetUsers) and `int IDENTITY` (all other tables) created inconsistency and conversion overhead.

**Solution:** Standardized all primary keys and foreign keys to `Guid` type throughout the entire schema.

---

## 📊 New Database Schema

### Core Tables (11 Total)

#### 1. **AspNetUsers** (Inherited from Person)
User authentication and base identity information.

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| UserName | string(256) | Unique username |
| Email | string(256) | Unique email (from Person) |
| PasswordHash | string | Hashed password |
| FirstName | string(50) | From Person |
| LastName | string(50) | From Person |
| DateOfBirth | DateTime | From Person |
| Gender | Gender (enum) | From Person |
| PhoneNumber | string(20) | From Person |
| Address | string(500) | From Person |
| ProfilePicture | string(500) | From Person |
| Role | UserRole (enum) | Patient/Doctor/Admin |
| IsActive | bool | Account status |
| CreatedAt | DateTime | Registration date |
| LastLoginAt | DateTime | Last login |

**Enums:**
- `UserRole`: Patient = 1, Doctor = 2, Admin = 3, SystemAdmin = 4
- `Gender`: Male = 1, Female = 2, Other = 3, PreferNotToSay = 4

**Indexes:**
- Primary: Id
- Unique: Email
- Non-Unique: Role, IsActive

---

#### 2. **Patients**
Patient-specific medical information (no duplicate personal fields).

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| UserId | Guid | FK to AspNetUsers |
| BloodGroup | string(5) | Blood type (A+, O-, etc.) |
| Allergies | string | Known allergies |
| MedicalHistory | string | Medical history |
| EmergencyContact | string(100) | Emergency contact name |
| EmergencyPhone | string(20) | Emergency phone |
| CreatedAt | DateTime | Record creation |
| UpdatedAt | DateTime | Last update |

**Relationships:**
- One-to-One with ApplicationUser (CASCADE DELETE)

**Indexes:**
- Unique: UserId

---

#### 3. **Doctors**
Doctor-specific professional information (no duplicate personal fields).

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| UserId | Guid | FK to AspNetUsers |
| Specialization | string(100) | Medical specialty |
| Qualifications | string | Educational background |
| Experience | int | Years of experience |
| LicenseNumber | string(50) | Unique medical license |
| IsVerified | bool | Admin verification status |
| ConsultationFee | decimal(18,2) | Fee per consultation |
| Bio | string | Professional biography |
| AvailableDays | string(100) | Available days |
| AvailableTimeStart | TimeSpan | Availability start |
| AvailableTimeEnd | TimeSpan | Availability end |
| CreatedAt | DateTime | Record creation |
| UpdatedAt | DateTime | Last update |

**Relationships:**
- One-to-One with ApplicationUser (CASCADE DELETE)
- One-to-Many with DoctorAffiliations

**Indexes:**
- Unique: UserId, LicenseNumber
- Non-Unique: Specialization, IsVerified

---

#### 4. **Symptoms**
Master symptom catalog.

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| Name | string(200) | Symptom name |
| Description | string(500) | Description |
| Category | string(100) | Body system/category |
| SeverityLevel | int (1-5) | Default severity |
| IsActive | bool | Active status |
| CreatedAt | DateTime | Record creation |

**Relationships:**
- Many-to-Many with SymptomEntries (via SymptomEntrySymptom)

---

#### 5. **SymptomEntries**
Patient symptom reports (no more JSON!).

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| PatientId | Guid | FK to Patients |
| SeverityLevel | int (1-5) | Overall severity |
| Description | string(500) | Additional notes |
| CreatedAt | DateTime | Entry timestamp |

**Relationships:**
- Many-to-One with Patient (CASCADE DELETE)
- Many-to-Many with Symptoms (via SymptomEntrySymptom)
- One-to-Many with AIPredictions

---

#### 6. **SymptomEntrySymptom** ⭐ NEW
Junction table for many-to-many symptom relationships.

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| SymptomEntryId | Guid | FK to SymptomEntries |
| SymptomId | Guid | FK to Symptoms |
| SeverityLevel | int (1-5) | Symptom-specific severity |
| AdditionalNotes | string(500) | Symptom-specific notes |
| CreatedAt | DateTime | Link creation |

**Relationships:**
- Many-to-One with SymptomEntry (CASCADE DELETE)
- Many-to-One with Symptom (RESTRICT DELETE)

**Indexes:**
- Unique: (SymptomEntryId, SymptomId) composite

**Benefits:**
- Referential integrity enforced
- Efficient querying with SQL joins
- Per-symptom severity tracking
- Database-level validation

---

#### 7. **Diseases**
Disease catalog for AI predictions.

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| Name | string(200) | Disease name |
| Description | string | Full description |
| SymptomsDescription | string | Common symptoms |
| RecommendedAction | string | Recommendations |
| Precautions | string | Precautionary measures |
| ProbabilityScore | decimal(5,2) | Base probability |
| IsActive | bool | Active status |
| CreatedAt | DateTime | Record creation |
| UpdatedAt | DateTime | Last update |

---

#### 8. **AIPredictions**
AI disease prediction results.

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| SymptomEntryId | Guid | FK to SymptomEntries |
| DiseaseId | Guid | FK to Diseases |
| Probability | decimal(5,2) | Prediction probability % |
| ConfidenceLevel | decimal(5,2) | AI confidence % |
| Recommendations | string | AI recommendations |
| CreatedAt | DateTime | Prediction timestamp |

**Relationships:**
- Many-to-One with SymptomEntry (CASCADE DELETE)
- Many-to-One with Disease (RESTRICT DELETE)

---

#### 9. **Appointments**
Appointment scheduling (no more email tracking columns!).

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| PatientId | Guid | FK to Patients |
| DoctorId | Guid | FK to Doctors |
| SymptomEntryId | Guid | Optional link to symptoms |
| ScheduledDate | DateTime | When scheduled |
| AppointmentDate | DateTime | Actual appointment time |
| DurationMinutes | int | Duration (15-480) |
| Status | AppointmentStatus | Enum status |
| Notes | string(500) | General notes |
| Diagnosis | string | Post-appointment diagnosis |
| TreatmentPlan | string | Treatment plan |
| ConfirmationNumber | string(50) | Unique confirmation code |
| ReasonForVisit | string(500) | Visit reason |
| CreatedAt | DateTime | Record creation |
| UpdatedAt | DateTime | Last update |

**Enum: AppointmentStatus**
- Scheduled = 1
- Confirmed = 2
- InProgress = 3
- Completed = 4
- Cancelled = 5
- NoShow = 6
- Rescheduled = 7

**Relationships:**
- Many-to-One with Patient (RESTRICT DELETE)
- Many-to-One with Doctor (RESTRICT DELETE)
- Many-to-One with SymptomEntry (RESTRICT DELETE)
- One-to-Many with NotificationLogs

**Indexes:**
- Unique: ConfirmationNumber
- Non-Unique: Status, AppointmentDate

---

#### 10. **NotificationLog** ⭐ NEW
Centralized notification tracking (replaces 12 email columns!).

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| Type | NotificationType | Enum notification type |
| UserId | Guid | FK to AspNetUsers |
| AppointmentId | Guid | Optional FK to Appointments |
| ConsultationId | Guid | Optional FK to ConsultationRecords |
| RecipientEmail | string(256) | Email address |
| Subject | string(500) | Email subject |
| MessageBody | string | Email body |
| IsSent | bool | Send status |
| SentAt | DateTime | Send timestamp |
| ErrorMessage | string(500) | Error if failed |
| RetryCount | int | Retry attempts |
| CreatedAt | DateTime | Log creation |

**Enum: NotificationType**
- AppointmentConfirmation = 1
- ThreeWeekReminder = 2
- ThreeDayReminder = 3
- OneDayReminder = 4
- SameDayReminder = 5
- AppointmentCancellation = 6
- AppointmentRescheduled = 7
- ConsultationComplete = 8
- PrescriptionReady = 9
- FollowUpReminder = 10

**Relationships:**
- Many-to-One with ApplicationUser (RESTRICT DELETE)
- Many-to-One with Appointment (RESTRICT DELETE)
- Many-to-One with ConsultationRecord (RESTRICT DELETE)

**Indexes:**
- Composite: (UserId, Type, SentAt)
- Composite: (IsSent, CreatedAt)

**Benefits:**
- Unlimited notification types without schema changes
- Complete audit trail with retry tracking
- Error logging for failed notifications
- Flexible querying by type, user, status
- Supports appointments, consultations, and future entities

---

#### 11. **ConsultationRecords**
Doctor consultation records.

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| AppointmentId | Guid | FK to Appointments |
| PatientId | Guid | FK to Patients |
| DoctorId | Guid | FK to Doctors |
| AIPredictionId | Guid | Optional FK to AIPredictions |
| OfficialDiagnosis | string(500) | Doctor's diagnosis |
| AIDiagnosisConfirmed | bool | AI accuracy flag |
| ConsultationNotes | string(2000) | Consultation notes |
| TreatmentPlan | string(2000) | Treatment plan |
| LabTestsOrdered | string(1000) | Lab tests |
| LabReports | string(2000) | Lab results |
| SpecialistReferrals | string(1000) | Referrals |
| PatientRecordNotes | string(3000) | Additional notes |
| FollowUpRequired | bool | Follow-up needed |
| FollowUpDate | DateTime | Follow-up date |
| FollowUpInstructions | string(1000) | Follow-up instructions |
| ConsultationDate | DateTime | Consultation date |
| CreatedAt | DateTime | Record creation |
| UpdatedAt | DateTime | Last update |

**Relationships:**
- Many-to-One with Appointment (RESTRICT DELETE)
- Many-to-One with Patient (RESTRICT DELETE)
- Many-to-One with Doctor (RESTRICT DELETE)
- Many-to-One with AIPrediction (SET NULL)
- One-to-Many with Prescriptions

---

#### 12. **Prescriptions**
Medication prescriptions.

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| ConsultationRecordId | Guid | FK to ConsultationRecords |
| DrugName | string(200) | Medication name |
| Dosage | string(100) | Dosage amount |
| Frequency | string(100) | Frequency (3x daily) |
| Duration | string(100) | Duration (7 days) |
| Instructions | string(500) | Special instructions |
| CreatedAt | DateTime | Prescription date |

**Relationships:**
- Many-to-One with ConsultationRecord (CASCADE DELETE)

---

#### 13. **HealthcareOrganizations** ⭐ NEW
Healthcare facilities and organizations.

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| Name | string(200) | Organization name |
| Type | string(100) | Hospital/Clinic/Practice |
| Address | string(500) | Street address |
| City | string(100) | City |
| State | string(50) | State/province |
| PostalCode | string(20) | Postal code |
| Country | string(50) | Country |
| Phone | string(20) | Contact phone |
| Email | string(256) | Contact email |
| Website | string(200) | Website URL |
| Description | string | Organization description |
| IsActive | bool | Active status |
| CreatedAt | DateTime | Record creation |
| UpdatedAt | DateTime | Last update |

**Relationships:**
- One-to-Many with DoctorAffiliations

**Indexes:**
- Non-Unique: Name, IsActive

---

#### 14. **DoctorAffiliations** ⭐ NEW
Doctor-organization relationships.

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid | Primary key |
| DoctorId | Guid | FK to Doctors |
| OrganizationId | Guid | FK to HealthcareOrganizations |
| Position | string(100) | Staff/Consultant/Partner |
| Department | string(50) | Department name |
| StartDate | DateTime | Affiliation start |
| EndDate | DateTime | Affiliation end (if inactive) |
| IsPrimary | bool | Primary affiliation flag |
| IsActive | bool | Active status |
| CreatedAt | DateTime | Record creation |

**Relationships:**
- Many-to-One with Doctor (CASCADE DELETE)
- Many-to-One with HealthcareOrganization (RESTRICT DELETE)

**Indexes:**
- Composite: (DoctorId, OrganizationId)

**Benefits:**
- Real-world healthcare modeling
- Multiple organizational affiliations
- Historical tracking with start/end dates
- Primary affiliation designation

---

## 🔄 Cascade Delete Behavior

### CASCADE DELETE (Parent deletion removes children)
- `ApplicationUser → Patient` - Delete user removes patient profile
- `ApplicationUser → Doctor` - Delete user removes doctor profile
- `Patient → SymptomEntry` - Delete patient removes symptom entries
- `SymptomEntry → AIPrediction` - Delete entry removes predictions
- `SymptomEntry → SymptomEntrySymptom` - Delete entry removes symptom links
- `ConsultationRecord → Prescription` - Delete consultation removes prescriptions
- `Doctor → DoctorAffiliation` - Delete doctor removes affiliations

### RESTRICT DELETE (Cannot delete parent if children exist)
- `Patient → Appointment` - Cannot delete patient with appointments
- `Doctor → Appointment` - Cannot delete doctor with appointments
- `Symptom → SymptomEntrySymptom` - Cannot delete symptom in use
- `Disease → AIPrediction` - Cannot delete disease with predictions
- `Appointment → ConsultationRecord` - Cannot delete appointment with consultation
- `Appointment → NotificationLog` - Cannot delete appointment with notifications
- `HealthcareOrganization → DoctorAffiliation` - Cannot delete org with doctors

### SET NULL (Delete parent, keep children with null reference)
- `AIPrediction → ConsultationRecord` - Delete prediction keeps consultation

---

## 📈 Performance Optimizations

### Strategic Indexes
1. **Unique Indexes:**
   - ApplicationUser.Email
   - Patient.UserId
   - Doctor.UserId
   - Doctor.LicenseNumber
   - Appointment.ConfirmationNumber
   - SymptomEntrySymptom.(SymptomEntryId, SymptomId)

2. **Non-Unique Indexes:**
   - ApplicationUser.Role, IsActive
   - Doctor.Specialization, IsVerified
   - Appointment.Status, AppointmentDate
   - NotificationLog.(UserId, Type, SentAt), (IsSent, CreatedAt)
   - HealthcareOrganization.Name, IsActive
   - DoctorAffiliation.(DoctorId, OrganizationId)

### Query Optimization
- Enum storage as integers reduces index size
- Composite indexes support complex filtering
- Foreign key indexes improve join performance
- GUID clustering with sequential generation

---

## 🎯 Migration Strategy

### Phase 1: Data Preservation (BEFORE migration)
```sql
-- Backup existing data
SELECT * INTO AspNetUsers_Backup FROM AspNetUsers;
SELECT * INTO Patients_Backup FROM Patients;
-- ... backup all tables
```

### Phase 2: Data Transformation
```csharp
// Convert existing int IDs to GUIDs with mapping table
// Migrate SymptomsJson to SymptomEntrySymptom records
// Create NotificationLog entries from email tracking columns
// Transform string statuses to enum integers
```

### Phase 3: Validation
- Verify all foreign key relationships
- Confirm data integrity constraints
- Test cascade delete behavior
- Validate enum conversions

---

## 🔍 Benefits Summary

| Issue | Before | After |
|-------|--------|-------|
| **Data Redundancy** | Personal info in 3 tables | Single inheritance hierarchy |
| **Symptoms Storage** | Unvalidated JSON | Proper many-to-many with FK |
| **Email Tracking** | 12 columns in Appointments | Flexible NotificationLog table |
| **Status Management** | Hardcoded strings | Type-safe enums |
| **ID Consistency** | Mixed string/int types | Consistent GUID throughout |
| **Organization Model** | None | Full healthcare structure |
| **Scalability** | Schema changes for new features | Extensible enum patterns |
| **Data Integrity** | Application-level only | Database-enforced constraints |

---

## 📝 Developer Notes

### Using Enums in Code
```csharp
// Type-safe status checking
if (appointment.Status == AppointmentStatus.Scheduled)
{
    // Send confirmation
}

// Easy conversions
var statusName = appointment.Status.ToString(); // "Scheduled"
var statusValue = (int)appointment.Status; // 1
```

### Querying Symptoms
```csharp
// Old way (JSON parsing in application):
var symptoms = JsonConvert.DeserializeObject<int[]>(entry.SymptomsJson);

// New way (proper SQL join):
var symptoms = await _context.SymptomEntries
    .Include(e => e.Symptoms)
    .ThenInclude(s => s.Symptom)
    .Where(e => e.Id == entryId)
    .SelectMany(e => e.Symptoms)
    .ToListAsync();
```

### Notification Logging
```csharp
// Create notification log entry
var notification = new NotificationLog
{
    Type = NotificationType.ThreeDayReminder,
    UserId = appointment.PatientId,
    AppointmentId = appointment.Id,
    RecipientEmail = patient.Email,
    Subject = "Appointment Reminder",
    MessageBody = emailContent,
    CreatedAt = DateTime.UtcNow
};

await _context.NotificationLogs.AddAsync(notification);
await _context.SaveChangesAsync();

// Mark as sent after successful delivery
notification.IsSent = true;
notification.SentAt = DateTime.UtcNow;
await _context.SaveChangesAsync();
```

---

## 🚀 Next Steps

1. ✅ **Models Updated** - All entity models modernized
2. ✅ **DbContext Updated** - Relationships and constraints configured
3. ⏳ **Create Migration** - Generate EF Core migration
4. ⏳ **Data Migration Script** - Transform existing data
5. ⏳ **Update Services** - Modify service layer for GUID IDs
6. ⏳ **Update Controllers** - Update API endpoints
7. ⏳ **Update ViewModels** - Align DTOs with new structure
8. ⏳ **Testing** - Comprehensive testing of new schema

---

**Document Version:** 2.0  
**Last Updated:** December 12, 2025  
**Migration Status:** Models Complete, Ready for Migration
