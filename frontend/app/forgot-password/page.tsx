"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validators"
import { TopNav } from "@/components/layout/top-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, Loader2, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Password reset requested for:", data.email)
    setSubmitted(true)
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
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Reset your password</h1>
            <p className="text-lg text-slate-600">
              {submitted
                ? "Check your email for reset instructions"
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          <Card className="border-2 border-slate-200 shadow-xl">
            <CardContent className="p-8">
              {submitted ? (
                <div className="space-y-5">
                  <Alert className="border-emerald-200 bg-emerald-50">
                    <CheckCircle className="h-5 w-5 text-emerald-700" />
                    <AlertDescription className="text-emerald-800 font-medium">
                      If an account with that email exists, you will receive password reset instructions shortly.
                    </AlertDescription>
                  </Alert>
                  <Button asChild variant="outline" className="w-full h-11 border-2 border-slate-300 hover:bg-slate-50 font-semibold">
                    <Link href="/login">
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back to Sign In
                    </Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                  <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/30" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>

                  <Button asChild variant="ghost" className="w-full h-11 hover:bg-slate-50 font-semibold">
                    <Link href="/login">
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back to Sign In
                    </Link>
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
