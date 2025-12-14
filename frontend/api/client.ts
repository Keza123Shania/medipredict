const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

interface RequestConfig extends RequestInit {
  params?: Record<string, string>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getAuthHeaders(): HeadersInit {
    if (typeof window === "undefined") return {}
    const token = localStorage.getItem("medipredict-auth")
    if (token) {
      try {
        const parsed = JSON.parse(token)
        if (parsed.state?.token) {
          return { Authorization: `Bearer ${parsed.state.token}` }
        }
      } catch {
        return {}
      }
    }
    return {}
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }
    return url.toString()
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...requestConfig } = config
    const url = this.buildUrl(endpoint, params)

    const response = await fetch(url, {
      ...requestConfig,
      credentials: 'include', // Important: Send cookies with cross-origin requests
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...requestConfig.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" })
  }

  post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export { USE_MOCK }
