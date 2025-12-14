"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Plus, Trash2, Save } from "lucide-react"

const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
]

const initialSchedule = {
  monday: {
    enabled: true,
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" },
    ],
  },
  tuesday: {
    enabled: true,
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" },
    ],
  },
  wednesday: { enabled: true, slots: [{ start: "09:00", end: "12:00" }] },
  thursday: {
    enabled: true,
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" },
    ],
  },
  friday: {
    enabled: true,
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "16:00" },
    ],
  },
  saturday: { enabled: false, slots: [] },
  sunday: { enabled: false, slots: [] },
}

export default function DoctorSchedulePage() {
  const [schedule, setSchedule] = useState(initialSchedule)
  const [appointmentDuration, setAppointmentDuration] = useState("30")
  const [bufferTime, setBufferTime] = useState("10")

  const toggleDay = (dayId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId as keyof typeof prev],
        enabled: !prev[dayId as keyof typeof prev].enabled,
      },
    }))
  }

  const addSlot = (dayId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId as keyof typeof prev],
        slots: [...prev[dayId as keyof typeof prev].slots, { start: "09:00", end: "17:00" }],
      },
    }))
  }

  const removeSlot = (dayId: string, slotIndex: number) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId as keyof typeof prev],
        slots: prev[dayId as keyof typeof prev].slots.filter((_, idx) => idx !== slotIndex),
      },
    }))
  }

  const updateSlot = (dayId: string, slotIndex: number, field: "start" | "end", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId as keyof typeof prev],
        slots: prev[dayId as keyof typeof prev].slots.map((slot, idx) =>
          idx === slotIndex ? { ...slot, [field]: value } : slot,
        ),
      },
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground">Configure your availability for patient appointments</p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Settings</CardTitle>
          <CardDescription>Configure default appointment duration and buffer time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Default Appointment Duration</Label>
              <Select value={appointmentDuration} onValueChange={setAppointmentDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Buffer Time Between Appointments</Label>
              <Select value={bufferTime} onValueChange={setBufferTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
          <CardDescription>Set your available hours for each day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {daysOfWeek.map((day) => {
              const daySchedule = schedule[day.id as keyof typeof schedule]
              return (
                <div key={day.id} className="flex items-start gap-4 pb-6 border-b last:border-0 last:pb-0">
                  <div className="w-32 flex items-center gap-3">
                    <Switch checked={daySchedule.enabled} onCheckedChange={() => toggleDay(day.id)} />
                    <span className={daySchedule.enabled ? "font-medium" : "text-muted-foreground"}>{day.label}</span>
                  </div>
                  <div className="flex-1">
                    {daySchedule.enabled ? (
                      <div className="space-y-3">
                        {daySchedule.slots.map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <Input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateSlot(day.id, idx, "start", e.target.value)}
                                className="w-32"
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateSlot(day.id, idx, "end", e.target.value)}
                                className="w-32"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => removeSlot(day.id, idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addSlot(day.id)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Time Slot
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">Not available</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Time Off */}
      <Card>
        <CardHeader>
          <CardTitle>Time Off & Exceptions</CardTitle>
          <CardDescription>Block specific dates when you're unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="gap-2">
              Jan 20, 2024
              <button className="hover:text-destructive">×</button>
            </Badge>
            <Badge variant="secondary" className="gap-2">
              Jan 25-27, 2024
              <button className="hover:text-destructive">×</button>
            </Badge>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Time Off
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
