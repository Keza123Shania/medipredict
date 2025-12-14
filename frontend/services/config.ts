/**
 * Service Layer Configuration
 * Toggle between mock data and real API calls
 */

export const SERVICE_CONFIG = {
  useMockData: false, // Use real API calls from database
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7146",
  mockDelay: 500, // Simulate network delay in ms
}

/**
 * Helper function to simulate async delay
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Helper to wrap mock data in API response format
 */
export function mockApiResponse<T>(data: T, message = "Success"): Promise<{
  success: boolean
  message: string
  data: T
}> {
  return Promise.resolve({
    success: true,
    message,
    data,
  })
}

/**
 * Helper to generate mock error response
 */
export function mockApiError(message: string): Promise<never> {
  return Promise.reject(new Error(message))
}

/**
 * Helper to get userId from localStorage
 */
export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null
  try {
    const authData = localStorage.getItem("medipredict-auth")
    if (authData) {
      const parsed = JSON.parse(authData)
      return parsed.state?.user?.id || null
    }
  } catch {
    return null
  }
  return null
}

/**
 * Helper to get user role from localStorage
 */
export function getCurrentUserRole(): string | null {
  if (typeof window === "undefined") return null
  try {
    const authData = localStorage.getItem("medipredict-auth")
    if (authData) {
      const parsed = JSON.parse(authData)
      return parsed.state?.user?.role || null
    }
  } catch {
    return null
  }
  return null
}
