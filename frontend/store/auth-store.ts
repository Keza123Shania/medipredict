import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ApplicationUser } from "@/types/backend-types"

// Compatibility type that matches both old User and new ApplicationUser
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  profilePicture?: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: string | number
  address?: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthStore extends AuthState {
  setUser: (user: AuthUser | null) => void
  login: (user: AuthUser) => void
  logout: () => void
  setLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "medipredict-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
