"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { Save, Plus, X, Camera, Shield } from "lucide-react"
import { getInitials } from "@/lib/formatters"
import type { User } from "@/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminProfilePage() {
  const { user } = useAuth()
  const admin = user as User | null

  const [permissions, setPermissions] = useState<string[]>([
    "Manage Users",
    "Manage Doctors",
    "Manage Patients",
    "View Reports",
    "Manage AI Models",
  ])

  if (!admin) return null

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="container max-w-4xl py-8">
        <div className="mb-6 border-l-4 border-emerald-600 pl-4">
          <h1 className="text-2xl font-bold text-slate-900">Admin Profile</h1>
          <p className="text-slate-600 text-sm mt-2">Manage your administrative account and permissions</p>
        </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-2xl bg-emerald-600 text-white">
                    {getInitials(admin.firstName, admin.lastName)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline">
                  <Camera className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Recommended: Square image, at least 400x400px. Max file size: 2MB.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={admin.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={admin.lastName} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value="System Administrator" disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select defaultValue="it">
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">IT & Systems</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">About</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your role..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How we can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={admin.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="office">Office Location</Label>
                <Input id="office" placeholder="Building, Floor, Room number" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="account" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Admin Permissions
                </div>
              </CardTitle>
              <CardDescription>Your current system permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {permissions.map((permission, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Shield className="h-3 w-3 mr-1" />
                      {permission}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Contact a super administrator to modify permissions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Level</CardTitle>
              <CardDescription>Your system access configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Full System Access</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        You have unrestricted access to all system features
                      </p>
                    </div>
                    <Badge className="bg-emerald-600">Active</Badge>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border">
                    <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                    <p className="text-lg font-semibold mt-1">January 15, 2024</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                    <p className="text-lg font-semibold mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    label: "System alerts",
                    description: "Critical system issues and errors",
                  },
                  {
                    label: "New user registrations",
                    description: "Get notified when new users register",
                  },
                  {
                    label: "AI model updates",
                    description: "Notifications about model training and updates",
                  },
                  {
                    label: "Security alerts",
                    description: "Security-related notifications and warnings",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg">
              <Save className="mr-2 h-4 w-4" />
              Save Account Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <p className="text-sm text-muted-foreground">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="font-medium">Authenticator App</h4>
                    <p className="text-sm text-muted-foreground">Use an app to generate codes</p>
                  </div>
                  <Badge variant="outline">Not Enabled</Badge>
                </div>
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage your active login sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="font-medium">Windows - Chrome</h4>
                    <p className="text-sm text-muted-foreground">
                      192.168.1.1 • New York, USA • Active now
                    </p>
                  </div>
                  <Badge className="bg-emerald-600">Current</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="font-medium">Android - Chrome Mobile</h4>
                    <p className="text-sm text-muted-foreground">
                      192.168.1.105 • New York, USA • 2 days ago
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    Revoke
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg">
              <Save className="mr-2 h-4 w-4" />
              Update Security Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  )
}
