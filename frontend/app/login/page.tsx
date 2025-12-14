"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/hooks/use-auth"
import { loginSchema, type LoginFormData } from "@/lib/validators"
import { TopNav } from "@/components/layout/top-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    const result = await signIn(data)
    if (!result.success) {
      setError(result.error || "Login failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <TopNav showAuthButtons={false} />
      <main className="container flex items-center justify-center py-12 md:py-24">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 mb-6 shadow-lg shadow-emerald-600/30">
              <Activity className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Welcome back</h1>
            <p className="text-lg text-slate-600">Sign in to your MediPredict account</p>
          </div>

          <Card className="border-2 border-slate-200 shadow-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-900">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-11 border-2 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    {...register("email")}
                  />
                  {errors.email && <p className="text-sm text-red-600 font-medium">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-900">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-11 border-2 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                      {...register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-slate-100"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-slate-600" /> : <Eye className="h-4 w-4 text-slate-600" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-red-600 font-medium">{errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/30" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-slate-600">{"Don't have an account? "}</span>
                <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-bold">
                  Sign up
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-900 text-center mb-4">Mock Mode - Demo accounts:</p>
                <div className="grid gap-2 text-xs">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="font-medium text-slate-700">Patient: john.doe@email.com</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="font-medium text-slate-700">Doctor: dr.smith@email.com</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="font-medium text-slate-700">Admin: admin@medipredict.com</span>
                  </div>
                  <p className="text-center text-slate-600 mt-2 font-semibold">Password: <span className="text-emerald-600">password</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
