"use client"

import { useAuthStore } from "@/store/auth-store"
import type { AuthUser } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import type { LoginCredentials, RegisterData } from "@/types"
import { authService } from "@/services"

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, setLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Initialize auth state from storage
    setLoading(false)
  }, [setLoading])

  const signIn = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const response = await authService.login({
          email: credentials.email,
          password: credentials.password,
        })

        if (response.success && response.data) {
          // Convert backend response to AuthUser format
          const authUser: AuthUser = {
            id: response.data.userId,
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            role: response.data.role.toLowerCase(),
          }

          login(authUser)

          // Redirect based on role
          const redirectPath =
            response.data.role.toLowerCase() === "patient"
              ? "/patient/dashboard"
              : response.data.role.toLowerCase() === "doctor"
                ? "/doctor/dashboard"
                : "/admin/dashboard"
          router.push(redirectPath)

          return { success: true }
        }

        return { success: false, error: response.message || "Login failed" }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    },
    [login, router],
  )

  const signUp = useCallback(
    async (data: RegisterData) => {
      try {
        const response = await authService.register({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          confirmPassword: data.password,
          dateOfBirth: data.dateOfBirth || "2000-01-01",
          gender: data.gender || "Other",
          role: data.role === "patient" ? "Patient" : "Doctor",
          phoneNumber: data.phoneNumber || undefined,
          specialization: data.specialization,
          professionalTitle: data.professionalTitle,
          licenseNumber: data.licenseNumber,
          licenseState: data.licenseState,
          licenseIssueDate: data.licenseIssueDate,
          licenseExpiryDate: data.licenseExpiryDate,
          npiNumber: data.npiNumber,
          experience: data.experience,
          qualifications: data.qualifications,
          educationTraining: data.educationTraining,
          boardCertifications: data.boardCertifications,
          consultationFee: data.consultationFee,
        })

        if (response.success && response.data) {
          // After registration, we need to login
          const loginResult = await signIn({ email: data.email, password: data.password })
          return loginResult
        }

        return { success: false, error: response.message || "Registration failed" }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    },
    [signIn],
  )

  const signOut = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      logout()
      router.push("/login")
    }
  }, [logout, router])

  const requireAuth = useCallback(
    (allowedRoles?: string[]) => {
      if (!isAuthenticated) {
        router.push("/login")
        return false
      }
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push("/unauthorized")
        return false
      }
      return true
    },
    [isAuthenticated, user, router],
  )

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    requireAuth,
  }
}
