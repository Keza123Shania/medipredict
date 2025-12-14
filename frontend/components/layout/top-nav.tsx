"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Activity, LogOut, Settings, User, Menu } from "lucide-react"
import { getInitials } from "@/lib/formatters"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface TopNavProps {
  showAuthButtons?: boolean
}

export function TopNav({ showAuthButtons = true }: TopNavProps) {
  const { user, isAuthenticated, signOut } = useAuth()

  const getDashboardPath = () => {
    if (!user) return "/login"
    switch (user.role) {
      case "patient":
        return "/patient/dashboard"
      case "doctor":
        return "/doctor/dashboard"
      case "admin":
        return "/admin/dashboard"
      default:
        return "/"
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold">MediPredict</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="/doctors"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Find Doctors
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {showAuthButtons && !isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" asChild className="px-4">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 shadow-sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardPath()}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${user.role}/profile`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/#features" className="text-lg font-medium">
                  Features
                </Link>
                <Link href="/#how-it-works" className="text-lg font-medium">
                  How it Works
                </Link>
                <Link href="/doctors" className="text-lg font-medium">
                  Find Doctors
                </Link>
                {!isAuthenticated && (
                  <>
                    <hr className="my-2" />
                    <Link href="/login" className="text-lg font-medium">
                      Sign In
                    </Link>
                    <Button asChild className="mt-2">
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
