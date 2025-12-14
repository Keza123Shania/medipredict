"use client"

import { type ReactNode } from "react"
import { UnifiedLayout } from "./unified-layout"
import type { UserRole } from "@/types"

interface DashboardLayoutProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  return <UnifiedLayout allowedRoles={allowedRoles}>{children}</UnifiedLayout>
}
