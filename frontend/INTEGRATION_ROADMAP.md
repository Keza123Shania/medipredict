# Additional Integration Tasks

This document outlines additional integration work needed beyond registration and login.

## Completed ✓
1. Patient Registration - All required fields now included
2. Doctor Registration - All required fields now included  
3. Login Flow - Works for all user types
4. Environment Configuration - Mock data disabled, API URL configured

## Next Priority Tasks

### 1. Profile Management
**Status:** Needs Integration Work

**Backend APIs:**
- `GET /api/Profile/user-profile` - Get user profile
- `PUT /api/Profile/update-profile` - Update basic profile
- `POST /api/Profile/upload-picture` - Upload profile picture
- `GET /api/Profile/profile-picture/{userId}` - Get profile picture

**Frontend Files:**
- `app/patient/profile/page.tsx`
- `app/doctor/profile/page.tsx`
- `services/profile.service.ts`

**Tasks:**
- [ ] Verify profile fetch works correctly
- [ ] Test profile update functionality
- [ ] Test profile picture upload
- [ ] Ensure form validation matches backend requirements

### 2. Appointments System
**Status:** Needs Integration Work

**Backend APIs:**
- `GET /api/Appointments/patient/{patientId}` - Get patient appointments
- `GET /api/Appointments/doctor/{doctorId}` - Get doctor appointments
- `POST /api/Appointments/book` - Book appointment
- `PUT /api/Appointments/{appointmentId}/status` - Update status
- `GET /api/Appointments/{appointmentId}` - Get appointment details

**Frontend Files:**
- `app/patient/appointments/page.tsx`
- `app/patient/appointments/book/page.tsx`
- `app/doctor/appointments/page.tsx`
- `services/appointment.service.ts`
- `hooks/use-appointments.ts`

**Tasks:**
- [ ] Test appointment booking flow
- [ ] Verify appointment listing for patients
- [ ] Verify appointment listing for doctors
- [ ] Test appointment status updates
- [ ] Ensure date/time formatting is consistent

**Known Issues to Check:**
- Backend expects `BookAppointmentRequest` with specific structure
- Frontend `AppointmentBookingViewModel` should match backend expectations
- Time slot format needs verification

### 3. Doctor Listing and Search
**Status:** Needs Integration Work

**Backend APIs:**
- `GET /api/Doctors/search` - Search doctors
- `GET /api/Doctors/{id}` - Get doctor details
- `GET /api/Doctors/{id}/available-slots` - Get availability

**Frontend Files:**
- `app/doctors/page.tsx`
- `app/doctors/[id]/page.tsx`
- `services/doctor.service.ts`
- `hooks/use-doctors.ts`

**Tasks:**
- [ ] Test doctor search functionality
- [ ] Verify doctor profile display
- [ ] Test availability slot retrieval
- [ ] Ensure filtering and sorting work

### 4. AI Symptom Analysis
**Status:** Needs Integration Work

**Backend APIs:**
- `POST /api/AnalyzeSymptoms/analyze` - Analyze symptoms
- `GET /api/Predictions/patient/{patientId}` - Get patient predictions

**Frontend Files:**
- `app/patient/symptoms/page.tsx`
- `services/prediction.service.ts`
- `hooks/use-predictions.ts`
- `lib/comprehensive-symptoms.ts`

**Tasks:**
- [ ] Test symptom input form
- [ ] Verify AI analysis request/response format
- [ ] Test prediction result display
- [ ] Ensure symptom list matches backend expectations

### 5. Consultations
**Status:** Needs Integration Work

**Backend APIs:**
- `GET /api/Consultations/doctor/{doctorId}` - Get doctor consultations
- `GET /api/Consultations/{appointmentId}` - Get consultation details
- `POST /api/Consultations/complete` - Complete consultation
- `POST /api/Consultations/update` - Update consultation

**Frontend Files:**
- `app/doctor/consultations/page.tsx`
- `app/doctor/consultations/[id]/page.tsx`
- `services/consultation.service.ts`
- `hooks/use-consultations.ts`

**Tasks:**
- [ ] Test consultation form for doctors
- [ ] Verify prescription management
- [ ] Test consultation completion flow
- [ ] Ensure medical history display works

### 6. Admin Dashboard
**Status:** Needs Integration Work

**Backend APIs:**
- `GET /api/Admin/dashboard-stats` - Get dashboard statistics
- `GET /api/Admin/pending-doctors` - Get doctors pending verification
- `PUT /api/Admin/verify-doctor/{doctorId}` - Verify doctor
- `GET /api/Admin/all-users` - Get all users
- `PUT /api/Admin/toggle-user-status/{userId}` - Activate/deactivate user

**Frontend Files:**
- `app/admin/dashboard/page.tsx`
- `app/admin/doctors/page.tsx`
- `app/admin/users/page.tsx`
- `services/admin.service.ts`

**Tasks:**
- [ ] Test admin dashboard statistics
- [ ] Verify doctor verification workflow
- [ ] Test user management features
- [ ] Ensure admin permissions work correctly

### 7. Medical History
**Status:** Needs Integration Work

**Backend APIs:**
- `GET /api/MedicalHistory/patient/{patientId}` - Get patient medical history
- `POST /api/MedicalHistory` - Create medical history record
- `PUT /api/MedicalHistory/{id}` - Update medical history

**Frontend Files:**
- `app/patient/history/page.tsx`

**Tasks:**
- [ ] Verify medical history retrieval
- [ ] Test medical history creation
- [ ] Test medical history updates

## Common Integration Patterns to Follow

### 1. API Request Format
```typescript
// Always use this pattern
const response = await fetch(`${baseUrl}/endpoint`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
  credentials: "include", // Important for session cookies
})
```

### 2. Error Handling
```typescript
if (!response.ok) {
  const error = await response.json().catch(() => ({ message: "Request failed" }))
  console.error("API Error:", error)
  throw new Error(error.message || "Request failed")
}
```

### 3. Date Handling
- Backend expects ISO date strings (YYYY-MM-DD)
- Time format varies by endpoint (check specific API)
- Always validate date format before sending

### 4. File Uploads
- Use FormData for file uploads
- Set appropriate content type
- Check file size limits (backend: 50MB max)

### 5. Authentication
- Session cookies are automatically included with `credentials: "include"`
- User ID should be passed as query parameter or in request body
- Check authentication state from Zustand store

## Testing Strategy

### For Each Feature:
1. **Start with Backend API Testing:**
   - Test endpoint in Swagger UI
   - Verify request/response format
   - Check validation rules

2. **Frontend Integration:**
   - Ensure types match backend ViewModels
   - Test with real data
   - Handle loading and error states

3. **End-to-End Testing:**
   - Test complete user flows
   - Verify data persistence
   - Check error handling
   - Test edge cases

## Data Type Mismatches to Watch For

### Common Issues:
1. **Gender:** Backend uses string ("Male", "Female", "Other"), not enum
2. **Dates:** Must be ISO format strings, not Date objects
3. **Role:** Backend uses "Patient", "Doctor", "Admin" (capitalized)
4. **IDs:** Backend uses Guid strings, not numbers
5. **Enums:** Some backend enums are numbers, verify each case

## Recommended Order of Implementation

1. ✓ Registration & Login (COMPLETED)
2. Profile Management (HIGH PRIORITY)
3. Doctor Listing & Search (HIGH PRIORITY)
4. Appointments Booking (HIGH PRIORITY)
5. AI Symptom Analysis (MEDIUM PRIORITY)
6. Consultations (MEDIUM PRIORITY)
7. Medical History (LOW PRIORITY)
8. Admin Dashboard (LOW PRIORITY)

## Resources

- **Backend API Documentation:** http://localhost:5291/swagger
- **Frontend Types:** `types/backend-types.ts`
- **Backend ViewModels:** `MediPredict/Data/ViewModels/`
- **Backend Controllers:** `MediPredict/Controllers/Api/`
