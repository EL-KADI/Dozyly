"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Clock, Star } from "lucide-react"
import { Toast } from "@/components/toast"

interface SleepEntry {
  id: string
  sleepTime: string
  wakeTime: string
  duration: number
  quality: "Good" | "Bad" | "Interrupted"
  date: string
}

export default function HomePage() {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [sleepTime, setSleepTime] = useState("")
  const [wakeTime, setWakeTime] = useState("")
  const [quality, setQuality] = useState<"Good" | "Bad" | "Interrupted">("Good")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [errors, setErrors] = useState<{ sleepTime?: string; wakeTime?: string }>({})

  useEffect(() => {
    const stored = localStorage.getItem("dozyly-sleep-entries")
    if (stored) {
      setSleepEntries(JSON.parse(stored))
    }
  }, [])

  const saveToStorage = (entries: SleepEntry[]) => {
    localStorage.setItem("dozyly-sleep-entries", JSON.stringify(entries))
    localStorage.setItem("dozyly-last-updated", new Date().toISOString())
  }

  const calculateDuration = (sleep: string, wake: string): number => {
    const sleepDate = new Date(`2000-01-01T${sleep}:00`)
    let wakeDate = new Date(`2000-01-01T${wake}:00`)

    if (wakeDate <= sleepDate) {
      wakeDate = new Date(`2000-01-02T${wake}:00`)
    }

    return (wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60 * 60)
  }

  const validateForm = (): boolean => {
    const newErrors: { sleepTime?: string; wakeTime?: string } = {}

    if (!sleepTime) newErrors.sleepTime = "Sleep time cannot be empty"
    if (!wakeTime) newErrors.wakeTime = "Please enter wake time"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addSleepEntry = () => {
    if (!validateForm()) return

    const duration = calculateDuration(sleepTime, wakeTime)
    const newEntry: SleepEntry = {
      id: Date.now().toString(),
      sleepTime,
      wakeTime,
      duration: Math.round(duration * 100) / 100,
      quality,
      date: new Date().toLocaleDateString(),
    }

    const updatedEntries = [newEntry, ...sleepEntries]
    setSleepEntries(updatedEntries)
    saveToStorage(updatedEntries)

    setSleepTime("")
    setWakeTime("")
    setQuality("Good")
    setErrors({})
    setToast({ message: "Sleep entry added successfully!", type: "success" })
  }

  const deleteEntry = (id: string) => {
    const updatedEntries = sleepEntries.filter((entry) => entry.id !== id)
    setSleepEntries(updatedEntries)
    saveToStorage(updatedEntries)
    setToast({ message: "Sleep entry deleted", type: "success" })
  }

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case "Good":
        return <Star className="w-4 h-4 text-green-500" />
      case "Bad":
        return <Star className="w-4 h-4 text-red-500" />
      case "Interrupted":
        return <Star className="w-4 h-4 text-yellow-500" />
      default:
        return <Star className="w-4 h-4 text-gray-500" />
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Good":
        return "border-l-green-500"
      case "Bad":
        return "border-l-red-500"
      case "Interrupted":
        return "border-l-yellow-500"
      default:
        return "border-l-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dozyly</h1>
          <p className="text-gray-600">Track and improve your sleep habits</p>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Log Your Sleep
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sleep-time">Sleep Time</Label>
                <Input
                  id="sleep-time"
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className={errors.sleepTime ? "border-red-500" : ""}
                  aria-describedby={errors.sleepTime ? "sleep-time-error" : undefined}
                />
                {errors.sleepTime && (
                  <p id="sleep-time-error" className="text-red-500 text-sm animate-fade-in">
                    {errors.sleepTime}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="wake-time">Wake Time</Label>
                <Input
                  id="wake-time"
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className={errors.wakeTime ? "border-red-500" : ""}
                  aria-describedby={errors.wakeTime ? "wake-time-error" : undefined}
                />
                {errors.wakeTime && (
                  <p id="wake-time-error" className="text-red-500 text-sm animate-fade-in">
                    {errors.wakeTime}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality">Sleep Quality</Label>
              <Select value={quality} onValueChange={(value: "Good" | "Bad" | "Interrupted") => setQuality(value)}>
                <SelectTrigger id="quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Bad">Bad</SelectItem>
                  <SelectItem value="Interrupted">Interrupted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addSleepEntry} className="w-full">
              Add Sleep Entry
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Recent Sleep Entries</h2>
          {sleepEntries.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <p className="text-gray-500">No sleep entries yet. Add your first entry above!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sleepEntries.map((entry, index) => (
                <Card
                  key={entry.id}
                  className={`border-l-4 ${getQualityColor(entry.quality)} animate-slide-in shadow-md hover:shadow-lg transition-shadow`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  aria-label={`Sleep entry: ${entry.date}, ${entry.duration} hours, ${entry.quality}`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-800">{entry.date}</span>
                          {getQualityIcon(entry.quality)}
                          <span className="text-sm text-gray-600">{entry.quality}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            Sleep: {entry.sleepTime} - Wake: {entry.wakeTime}
                          </p>
                          <p className="font-medium">Duration: {entry.duration} hours</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={`Delete sleep entry from ${entry.date}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
