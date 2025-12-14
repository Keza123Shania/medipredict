# Quick Start Guide - Using the Service Layer

## Setup

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Configure environment**:
```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Development with Mock Data

**Recommended for frontend development without running the backend**

1. Ensure `.env.local` has:
```
NEXT_PUBLIC_USE_MOCK=true
```

2. Start development server:
```bash
npm run dev
```

3. All features will work with mock data:
   - Login with any email and password "password"
   - Book appointments
   - View consultations
   - Generate predictions
   - Access admin dashboard

## Production with Real Backend

1. **Start the ASP.NET backend**:
```bash
cd MediPredict/MediPredict
dotnet run
```

2. **Update `.env.local`**:
```
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

3. **Start Next.js**:
```bash
npm run dev
```

4. Frontend now makes real API calls to the backend

## Using Services in Components

### Example 1: Authentication

```typescript
import { useAuth } from '@/hooks/use-auth'

function LoginPage() {
  const { signIn } = useAuth()
  
  const handleLogin = async () => {
    const result = await signIn({
      email: 'user@example.com',
      password: 'password123'
    })
    
    if (result.success) {
      // User logged in successfully
    } else {
      // Show error: result.error
    }
  }
}
```

### Example 2: Fetch Appointments

```typescript
import { useAppointments } from '@/api/hooks/use-appointments'

function AppointmentsList() {
  const { data, isLoading, error } = useAppointments({ 
    status: 'scheduled' 
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  const appointments = data?.data?.appointments || []
  
  return (
    <div>
      {appointments.map(apt => (
        <div key={apt.appointmentId}>{apt.doctorName}</div>
      ))}
    </div>
  )
}
```

### Example 3: Book Appointment

```typescript
import { useBookAppointment } from '@/api/hooks/use-appointments'

function BookingForm() {
  const bookMutation = useBookAppointment()
  
  const handleSubmit = async (formData) => {
    try {
      const result = await bookMutation.mutateAsync({
        doctorId: formData.doctorId,
        appointmentDate: formData.date,
        timeSlot: formData.time,
        reasonForVisit: formData.reason,
        durationMinutes: 30
      })
      
      if (result.success) {
        console.log('Booked!', result.data)
      }
    } catch (error) {
      console.error('Booking failed', error)
    }
  }
}
```

### Example 4: Create Prediction

```typescript
import { useCreatePrediction } from '@/api/hooks/use-predictions'

function SymptomChecker() {
  const createPrediction = useCreatePrediction()
  
  const handleAnalyze = async (symptoms: string[]) => {
    try {
      const result = await createPrediction.mutateAsync(symptoms)
      
      if (result.success) {
        const prediction = result.data
        console.log('Prediction:', prediction.primaryDisease)
        console.log('Confidence:', prediction.confidenceScore)
      }
    } catch (error) {
      console.error('Prediction failed', error)
    }
  }
}
```

## Direct Service Usage

You can also use services directly (outside of React hooks):

```typescript
import { appointmentService, authService } from '@/services'

// Login
const loginResult = await authService.login({
  email: 'user@example.com',
  password: 'password'
})

if (loginResult.success) {
  const userId = loginResult.data.userId
  
  // Get appointments
  const aptsResult = await appointmentService.getAppointments({
    userId,
    role: 'Patient'
  })
  
  console.log(aptsResult.data.appointments)
}
```

## Mock Data Details

### Mock Users

**Patient**:
- Email: `john.doe@email.com`
- Password: `password` (any password works in mock mode)
- Role: Patient

**Doctor**:
- Email: `dr.smith@email.com`
- Password: `password`
- Role: Doctor

**Admin**:
- Email: `admin@medipredict.com`
- Password: `password`
- Role: Admin

### Mock Doctors
- Dr. Sarah Smith (Cardiology)
- Dr. Michael Chen (Dermatology)
- Dr. Emily Johnson (Pediatrics)

### Mock Appointments
- Sample appointments for testing
- Various statuses (Scheduled, Completed, Cancelled)

## Switching Between Modes

### Toggle in Runtime (for testing)

You can temporarily change the mode by editing `services/config.ts`:

```typescript
export const SERVICE_CONFIG = {
  useMockData: true, // Change this to false for real API
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
  mockDelay: 500,
}
```

**Note**: Environment variables are preferred. Only change this file for quick local testing.

## Common Issues

### Issue: "User not authenticated"
**Solution**: Ensure you're logged in and localStorage has auth data

### Issue: API calls fail in real mode
**Solution**: 
1. Check backend is running on correct port
2. Verify CORS is enabled on backend
3. Check browser console for CORS errors

### Issue: Types don't match
**Solution**: 
1. Ensure you're importing from `@/types/backend-types`
2. Check that backend hasn't changed the model structure

### Issue: Mock data not updating
**Solution**: 
1. Clear browser localStorage
2. Hard refresh (Ctrl+Shift+R)
3. Check `services/mock-data.ts` for the data structure

## Testing Checklist

- [ ] Login with patient account
- [ ] Login with doctor account
- [ ] Login with admin account
- [ ] View appointments
- [ ] Book new appointment
- [ ] Cancel appointment
- [ ] Search for doctors
- [ ] Create AI prediction
- [ ] View consultation records
- [ ] Admin dashboard access

## Getting Help

1. **Check documentation**: 
   - `BACKEND_INTEGRATION.md` - Full API documentation
   - `CHANGES_SUMMARY.md` - What changed

2. **Check backend logs**: If using real API, check ASP.NET console

3. **Check browser console**: Look for errors and network requests

4. **Verify types**: Ensure you're using the correct types from `backend-types.ts`

## Tips

- Start with mock data to develop UI
- Switch to real API for integration testing
- Use browser DevTools Network tab to debug API calls
- Mock delay (500ms) simulates realistic network conditions
- All services return Promises - use async/await or .then()

## Next.js Specific

### API Routes
The service layer works independently of Next.js API routes. You can:
- Use services directly in pages
- Use services in API routes
- Use services in server components (with caution)

### Server vs Client
Services work in both environments, but authentication helpers (`getCurrentUserId`) only work client-side (they read localStorage).

For server-side usage, pass userId explicitly:
```typescript
const result = await appointmentService.getAppointments({
  userId: 'user-id-from-session',
  role: 'Patient'
})
```
