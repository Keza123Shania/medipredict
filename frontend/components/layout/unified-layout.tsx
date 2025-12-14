"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  FileText,
  Search,
  Settings,
  Stethoscope,
  Brain,
  BarChart3,
  CalendarDays,
  Activity,
  LogOut,
  Menu,
  Bell,
  Shield,
  User,
  ChevronLeft,
  X,
} from "lucide-react"
import type { UserRole } from "@/types"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const patientNavItems: NavItem[] = [
  { title: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
  { title: "AI Prediction", href: "/patient/predict", icon: Activity },
  { title: "Find Doctors", href: "/patient/doctors", icon: Search },
  { title: "Appointments", href: "/patient/appointments", icon: Calendar },
  { title: "Consultations", href: "/patient/consultations", icon: MessageSquare },
  { title: "Profile", href: "/patient/profile", icon: Settings },
]

const doctorNavItems: NavItem[] = [
  { title: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { title: "Appointments", href: "/doctor/appointments", icon: Calendar },
  { title: "Consultations", href: "/doctor/consultations", icon: MessageSquare },
  { title: "Profile", href: "/doctor/profile", icon: User },
]

const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { title: "Patients", href: "/admin/users", icon: Users },
]

interface UnifiedLayoutProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export function UnifiedLayout({ children, allowedRoles }: UnifiedLayoutProps) {
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user && !allowedRoles.includes(user.role)) {
        router.push("/unauthorized")
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router])

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="hidden lg:block w-64 border-r bg-slate-900 dark:bg-slate-950">
          <Skeleton className="h-full w-full bg-slate-800 dark:bg-slate-900" />
        </div>
        <div className="flex-1 flex flex-col">
          <Skeleton className="h-16 w-full" />
          <div className="flex-1 p-6">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null
  }

  const navItems =
    user.role === "patient" ? patientNavItems : user.role === "doctor" ? doctorNavItems : adminNavItems

  const getRoleBadge = () => {
    switch (user.role) {
      case "admin":
        return <span className="ml-auto text-xs font-semibold bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Admin</span>
      case "doctor":
        return <span className="ml-auto text-xs font-semibold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Doctor</span>
      case "patient":
        return <span className="ml-auto text-xs font-semibold bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Patient</span>
    }
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case "admin":
        return Shield
      case "doctor":
        return Stethoscope
      case "patient":
        return User
    }
  }

  const RoleIcon = getRoleIcon()

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Black Theme */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-900 dark:border-gray-950 bg-black dark:bg-slate-950 text-white transition-all duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "lg:w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-900 dark:border-gray-950 px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold whitespace-nowrap">MediPredict</span>
            )}
          </div>
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>



        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-gray-400 hover:bg-gray-900 hover:text-white",
                    sidebarCollapsed && "justify-center"
                  )}
                  title={sidebarCollapsed ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && <span>{item.title}</span>}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-800 p-3">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-gray-400 hover:bg-gray-800 hover:text-white",
              sidebarCollapsed && "justify-center px-0"
            )}
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("flex flex-1 flex-col transition-all duration-300", sidebarCollapsed ? "lg:ml-16" : "lg:ml-64")}>
        {/* Top Bar - White Theme */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border-2 border-gray-200">
                  <AvatarImage src={user.avatar} alt={user.firstName} />
                  <AvatarFallback className="bg-black text-white font-semibold text-sm">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${user.role}/profile`} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content - White Background */}
        <main className="flex-1 overflow-auto bg-white">
          <div className="container mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
