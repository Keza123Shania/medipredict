/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 * Supports both mock data and real API calls
 */

import type {
  ApiResponse,
  ApplicationUser,
  LoginViewModel,
  UserRegistrationViewModel,
  LoginResponse,
} from "@/types/backend-types"
import { SERVICE_CONFIG, delay, mockApiResponse } from "./config"
import { mockUsers } from "./mock-data"

class AuthService {
  private baseUrl = `${SERVICE_CONFIG.apiBaseUrl}/api/Auth`

  /**
   * Login user
   */
  async login(credentials: LoginViewModel): Promise<ApiResponse<LoginResponse>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      // Mock login logic
      const user = mockUsers.find((u) => u.email === credentials.email)
      if (user && credentials.password === "password") {
        // Any password works in mock mode
        return mockApiResponse<LoginResponse>(
          {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role?.name || "Patient",
          },
          "Login successful",
        )
      }
      throw new Error("Invalid email or password")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Login failed" }))
      throw new Error(error.message || "Invalid email or password")
    }

    return response.json()
  }

  /**
   * Register new user
   */
  async register(data: UserRegistrationViewModel): Promise<ApiResponse<{ success: boolean; userId: string }>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      // Mock registration
      const newUserId = `user-${Date.now()}`
      return mockApiResponse(
        {
          success: true,
          userId: newUserId,
        },
        "Registration successful",
      )
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      let error: any = {}
      
      if (contentType && contentType.includes("application/json")) {
        error = await response.json().catch(() => ({ message: "Registration failed" }))
      } else {
        const text = await response.text()
        error = { message: text || "Registration failed" }
      }
      
      console.error("Registration error:", error)
      console.error("Response status:", response.status)
      if (error.errors) {
        console.error("Validation errors:", JSON.stringify(error.errors, null, 2))
      }
      if (error.data) {
        console.error("Error data:", error.data)
      }
      console.error("Request payload:", JSON.stringify(data, null, 2))
      
      // Extract error message
      const errorMessage = error.message || error.title || "Registration failed"
      throw new Error(errorMessage)
    }

    return response.json()
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string): Promise<ApiResponse<ApplicationUser>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)

      const user = mockUsers.find((u) => u.id === userId)
      if (!user) {
        throw new Error("User not found")
      }
      return mockApiResponse(user, "User retrieved successfully")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/current-user?userId=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      throw new Error("Failed to retrieve user")
    }

    return response.json()
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    if (SERVICE_CONFIG.useMockData) {
      await delay(SERVICE_CONFIG.mockDelay)
      return mockApiResponse(undefined, "Logout successful")
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      throw new Error("Logout failed")
    }

    return response.json()
  }
}

export const authService = new AuthService()
