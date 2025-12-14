# Frontend Service Layer - Backend Integration

## Overview

The frontend has been updated to align with the ASP.NET Web API backend. A comprehensive service layer has been created that supports both **mock data** (for development) and **real API calls** (for production).

## Key Changes

### 1. Backend-Aligned Types (`types/backend-types.ts`)

All TypeScript types now match the C# ViewModels and Models from the backend:

- `ApiResponse<T>` - Wraps all API responses with `success`, `message`, and `data`
- `ApplicationUser` - Matches the backend User model
- `AppointmentItemViewModel` - Matches backend appointment structure
- `ConsultationViewModel` - Complete consultation data structure
- `DoctorProfileViewModel` - Doctor information and profile
- `PredictionResultViewModel` - AI prediction results
- And many more...

### 2. Service Layer (`services/`)

Created a complete service layer with mock data support:

#### Configuration (`services/config.ts`)
- `SERVICE_CONFIG` - Toggle between mock and real API
- Set `NEXT_PUBLIC_USE_MOCK=true` in `.env` to use mock data
- Set `NEXT_PUBLIC_API_BASE_URL` for backend URL

#### Services
- **authService** - Authentication and user management
- **appointmentService** - Appointment booking and management
- **doctorService** - Doctor profiles and search
- **consultationService** - Medical consultations and records
- **predictionService** - AI symptom analysis
- **adminService** - Admin dashboard and management

Each service supports both modes:
```typescript
if (SERVICE_CONFIG.useMockData) {
  // Return mock data
} else {
  // Make real API call
}
```

### 3. Mock Data (`services/mock-data.ts`)

Comprehensive mock data that mirrors backend structure:
- Mock users (Patient, Doctor, Admin)
- Mock doctors with profiles
- Mock appointments
- Mock consultations
- Mock predictions
- Mock admin statistics

### 4. Updated Hooks

All hooks in `api/hooks/` now use the service layer:
- `use-auth.ts` - Updated to use authService
- `use-appointments.ts` - Uses appointmentService
- `use-doctors.ts` - Uses doctorService
- `use-consultations.ts` - Uses consultationService
- `use-predictions.ts` - Uses predictionService

## Backend API Endpoints

### Authentication (`/api/Auth`)
- `POST /api/Auth/login` - User login
- `POST /api/Auth/register` - User registration
- `GET /api/Auth/current-user?userId={guid}` - Get current user
- `POST /api/Auth/logout` - Logout

### Appointments (`/api/Appointments`)
- `GET /api/Appointments?userId={guid}&role={role}&status={status}` - Get appointments
- `GET /api/Appointments/{id}?userId={guid}` - Get single appointment
- `POST /api/Appointments` - Book appointment
- `PATCH /api/Appointments/{id}/status` - Update status
- `POST /api/Appointments/{id}/cancel` - Cancel appointment
- `POST /api/Appointments/{id}/reschedule` - Reschedule appointment

### Doctors (`/api/Doctors`)
- `GET /api/Doctors?specialization={spec}&name={name}&page={page}&pageSize={size}` - Get doctors
- `GET /api/Doctors/{id}` - Get doctor by ID
- `PUT /api/Doctors/{id}` - Update doctor profile

### Consultations (`/api/Consultations`)
- `GET /api/Consultations/appointment/{appointmentId}?userId={guid}` - Get by appointment
- `POST /api/Consultations` - Save/update consultation
- `GET /api/Consultations/patient/{patientId}` - Get patient history
- `GET /api/Consultations/doctor?userId={guid}` - Get doctor consultations

### Predictions (`/api/Predictions`)
- `POST /api/Predictions` - Create prediction
- `GET /api/Predictions/{entryId}` - Get prediction
- `GET /api/Predictions/history/{userId}` - Get history

### Admin (`/api/Admin`)
- `GET /api/Admin/dashboard` - Dashboard data
- `GET /api/Admin/doctors/pending` - Pending doctor approvals
- `POST /api/Admin/doctors/{id}/approve` - Approve doctor
- `POST /api/Admin/doctors/{id}/reject` - Reject doctor

## Important Backend Expectations

### 1. Authentication
- Backend uses **query parameters** for userId (not headers/tokens)
- Example: `?userId=guid-here`
- **No JWT tokens in current implementation** - Backend does NOT return tokens
- Login response only contains: `{ userId, email, firstName, lastName, role }`
- All subsequent requests use userId in query params

### 2. Request/Response Format
All responses wrapped in `ApiResponse`:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### 3. Enums
- `Gender`: 1=Male, 2=Female, 3=Other, 4=PreferNotToSay
- `AppointmentStatus`: 1=Scheduled, 2=Confirmed, 3=InProgress, 4=Completed, 5=Cancelled, 6=NoShow, 7=Rescheduled

### 4. Date Formats
- All dates in ISO 8601 format: `2024-12-13T10:00:00Z`
- TimeSlots as strings: `"10:00 AM"`

### 5. Required Fields

#### Appointment Booking:
```typescript
{
  userId: string (Guid)
  doctorId: string (Guid)
  appointmentDate: string // Date only: "2024-12-20"
  appointmentTime: string // Time only: "10:00 AM"
  reasonForVisit: string
  additionalNotes?: string
  durationMinutes: number
}
```
**IMPORTANT**: Backend expects separate `appointmentDate` and `appointmentTime` fields!

#### User Registration:
```typescript
{
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string (ISO)
  gender: string
  role: "Patient" | "Doctor"
  password: string
  confirmPassword: string
  // Doctor-specific:
  specialization?: string
  licenseNumber?: string
  experience?: number
}
```

## Using the Service Layer

### Development Mode (Mock Data)

1. Set environment variable:
```bash
NEXT_PUBLIC_USE_MOCK=true
```

2. Use services normally:
```typescript
import { appointmentService } from '@/services'

const result = await appointmentService.getAppointments({
  userId: 'user-id',
  role: 'Patient'
})
// Returns mock data
```

### Production Mode (Real API)

1. Set environment variables:
```bash
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

2. Services automatically switch to real API calls:
```typescript
// Same code, but now makes real HTTP requests
const result = await appointmentService.getAppointments({
  userId: 'user-id',
  role: 'Patient'
})
```

## Migration Path

To switch from mock to real API:

1. **No code changes needed in UI components**
2. **Update environment variables**
3. **Ensure backend is running**
4. **Test each feature incrementally**

## Testing

### With Mock Data
- Run `npm run dev`
- All features work without backend
- Mock delay simulates network latency (500ms)

### With Real Backend
- Start ASP.NET backend on port 5000
- Update `.env.local`:
  ```
  NEXT_PUBLIC_USE_MOCK=false
  NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
  ```
- Run `npm run dev`

## Notes

### Removed/Adjusted Frontend Fields
- No token-based authentication (backend uses userId in query params)
- Simplified user role to string (backend uses Role object)
- Removed fields not required by backend

### Maintained Features
- All UI components unchanged
- No styling/layout modifications
- Type safety preserved
- React Query integration maintained

## Next Steps

1. **Test with mock data** - Verify all features work
2. **Start backend** - Run ASP.NET Web API
3. **Switch to real API** - Update environment variables
4. **Incremental testing** - Test each module (auth, appointments, etc.)
5. **Handle edge cases** - Add error handling as needed

## Support

For issues or questions:
1. Check backend API is running
2. Verify environment variables
3. Check browser console for errors
4. Review network tab for API calls
