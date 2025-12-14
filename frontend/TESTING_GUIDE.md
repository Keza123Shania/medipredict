# Quick Start Testing Guide

## Prerequisites
- Backend running on `http://localhost:5291`
- Frontend running on `http://localhost:3000`
- SQL Server with MediPredict database

## Start the Applications

### 1. Start Backend (Terminal 1)
```powershell
cd C:\Users\yvann\Downloads\ConnectingBoth\MediPredict
dotnet run
```
Expected output: Backend API running on http://localhost:5291

### 2. Start Frontend (Terminal 2)
```powershell
cd C:\Users\yvann\Downloads\ConnectingBoth\MediPredict_Frontend
npm run dev
# or
pnpm dev
```
Expected output: Frontend running on http://localhost:3000

## Test Patient Registration

1. Navigate to: http://localhost:3000/register
2. Select "Patient"
3. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: patient@test.com
   - Date of Birth: 1990-01-01
   - Gender: Male
   - Phone Number: +1234567890 (optional)
   - Password: Test123
   - Confirm Password: Test123
4. Click "Create Account"
5. Should redirect to: `/patient/dashboard`

## Test Doctor Registration

1. Navigate to: http://localhost:3000/register
2. Select "Doctor"
3. Fill in the form:
   - First Name: Jane
   - Last Name: Smith
   - Email: doctor@test.com
   - Date of Birth: 1985-05-15
   - Gender: Female
   - Specialization: Cardiology
   - License Number: MD123456
   - Years of Experience: 10
   - Consultation Fee: 150
   - Qualifications: MBBS, MD Cardiology
   - Phone Number: +1234567890
   - Password: Test123
   - Confirm Password: Test123
4. Click "Create Account"
5. Should redirect to: `/doctor/dashboard`

## Test Login

1. Navigate to: http://localhost:3000/login
2. Enter credentials:
   - Email: patient@test.com (or doctor@test.com)
   - Password: Test123
3. Click "Sign in"
4. Should redirect to appropriate dashboard

## Verify Backend

### Check Swagger UI
- Open: http://localhost:5291/swagger
- Test endpoints directly

### Check Database
```sql
-- View all users
SELECT * FROM Users;

-- View patients
SELECT * FROM Patients;

-- View doctors
SELECT * FROM Doctors;

-- Check doctor verification status
SELECT u.Email, d.IsVerified 
FROM Users u 
JOIN Doctors d ON u.Id = d.UserId;
```

### Check Backend Logs
- Location: `MediPredict/Logs/medipredict-api-YYYYMMDD.txt`
- Look for registration and login events

## Common Issues and Solutions

### Issue: "CORS error"
**Solution:** 
- Ensure backend CORS is configured (already done)
- Check that frontend is using correct API URL in `.env.local`

### Issue: "Invalid registration data"
**Solution:**
- Open browser DevTools → Network tab
- Check the registration request payload
- Verify all required fields are present
- Check backend logs for specific validation errors

### Issue: "Registration failed"
**Solution:**
- Check if email is already registered
- Verify date format is YYYY-MM-DD
- Ensure all doctor fields are filled
- Check console for detailed error messages

### Issue: "Login failed"
**Solution:**
- Verify email and password are correct
- Check if user account is active
- For doctors, verify account is created (isVerified can be false)

### Issue: "Mock data still being used"
**Solution:**
- Check `.env.local` has `NEXT_PUBLIC_USE_MOCK=false`
- Restart frontend dev server after changing .env file
- Clear browser localStorage

## Debug Tips

### Frontend Console
Open browser DevTools (F12) → Console:
- Registration requests are logged with full payload
- Validation errors are logged
- API responses are visible

### Network Tab
Open browser DevTools (F12) → Network:
- Filter by "Fetch/XHR"
- Check request/response for `/api/Auth/register` and `/api/Auth/login`
- Verify request payload matches backend expectations

### Backend Logs
Check `MediPredict/Logs/` for:
- Registration attempts
- Login attempts
- Validation errors
- Database errors

## Verify Environment Configuration

### Frontend `.env.local`
```bash
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:5291
```

### Backend Port Configuration
Check `MediPredict/Properties/launchSettings.json`:
- Should have applicationUrl: `http://localhost:5291`

## Success Indicators

### Patient Registration Success
- ✓ No console errors
- ✓ User created in database
- ✓ Patient record created
- ✓ Auto-login successful
- ✓ Redirected to `/patient/dashboard`
- ✓ User info stored in localStorage

### Doctor Registration Success
- ✓ No console errors
- ✓ User created in database
- ✓ Doctor record created with `isVerified: false`
- ✓ Auto-login successful
- ✓ Redirected to `/doctor/dashboard`
- ✓ User info stored in localStorage

### Login Success
- ✓ No console errors
- ✓ User authenticated
- ✓ Correct dashboard displayed
- ✓ User info in localStorage matches logged-in user
