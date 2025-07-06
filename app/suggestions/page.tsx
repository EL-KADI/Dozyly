"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Clock, Moon, Sun, Coffee, Smartphone } from "lucide-react"

interface SleepEntry {
  id: string
  sleepTime: string
  wakeTime: string
  duration: number
  quality: "Good" | "Bad" | "Interrupted"
  date: string
}

interface Suggestion {
  id: string
  title: string
  description: string
  category: string
  icon: any
  triggers: string[]
}

const suggestions: Suggestion[] = [
  {
    id: "1",
    title: "Maintain a Consistent Sleep Schedule",
    description: "Go to bed and wake up at the same time every day, even on weekends.",
    category: "Schedule",
    icon: Clock,
    triggers: ["Bad", "Interrupted"],
  },
  {
    id: "2",
    title: "Create a Relaxing Bedtime Routine",
    description: "Develop a calming pre-sleep routine like reading, gentle stretching, or meditation.",
    category: "Routine",
    icon: Moon,
    triggers: ["Bad", "Interrupted"],
  },
  {
    id: "3",
    title: "Avoid Screens Before Bed",
    description: "Turn off phones, tablets, and TVs at least 1 hour before bedtime.",
    category: "Environment",
    icon: Smartphone,
    triggers: ["Bad", "Interrupted"],
  },
  {
    id: "4",
    title: "Limit Caffeine After 6 PM",
    description: "Avoid coffee, tea, and other caffeinated beverages in the evening.",
    category: "Diet",
    icon: Coffee,
    triggers: ["Bad", "Interrupted"],
  },
  {
    id: "5",
    title: "Try a White Noise Machine",
    description: "Use consistent background noise to mask disruptive sounds.",
    category: "Environment",
    icon: Moon,
    triggers: ["Interrupted"],
  },
  {
    id: "6",
    title: "Get Morning Sunlight",
    description: "Expose yourself to bright light in the morning to regulate your circadian rhythm.",
    category: "Light",
    icon: Sun,
    triggers: ["Bad"],
  },
  {
    id: "7",
    title: "Keep Your Bedroom Cool",
    description: "Maintain a temperature between 60-67°F (15-19°C) for optimal sleep.",
    category: "Environment",
    icon: Moon,
    triggers: ["Bad", "Interrupted"],
  },
  {
    id: "8",
    title: "Exercise Regularly",
    description: "Regular physical activity can improve sleep quality, but avoid intense exercise close to bedtime.",
    category: "Lifestyle",
    icon: Sun,
    triggers: ["Bad"],
  },
]

export default function SuggestionsPage() {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("dozyly-sleep-entries")
    if (stored) {
      setSleepEntries(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    const recentEntries = sleepEntries.slice(0, 7)
    const recentQualities = recentEntries.map((entry) => entry.quality)

    if (recentQualities.length === 0) {
      setFilteredSuggestions(suggestions.slice(0, 4))
      return
    }

    const relevantSuggestions = suggestions.filter((suggestion) =>
      suggestion.triggers.some((trigger) => recentQualities.includes(trigger as any)),
    )

    if (relevantSuggestions.length === 0) {
      setFilteredSuggestions(suggestions.slice(0, 4))
    } else {
      setFilteredSuggestions(relevantSuggestions)
    }
  }, [sleepEntries])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Schedule":
        return "bg-blue-100 text-blue-800"
      case "Routine":
        return "bg-purple-100 text-purple-800"
      case "Environment":
        return "bg-green-100 text-green-800"
      case "Diet":
        return "bg-orange-100 text-orange-800"
      case "Light":
        return "bg-yellow-100 text-yellow-800"
      case "Lifestyle":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRecentSleepQuality = () => {
    if (sleepEntries.length === 0) return null

    const recentEntries = sleepEntries.slice(0, 7)
    const qualityCounts = recentEntries.reduce(
      (acc, entry) => {
        acc[entry.quality] = (acc[entry.quality] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const totalEntries = recentEntries.length
    const badOrInterrupted = (qualityCounts["Bad"] || 0) + (qualityCounts["Interrupted"] || 0)

    return {
      total: totalEntries,
      good: qualityCounts["Good"] || 0,
      needsImprovement: badOrInterrupted,
      percentage: Math.round(((qualityCounts["Good"] || 0) / totalEntries) * 100),
    }
  }

  const recentQuality = getRecentSleepQuality()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sleep Suggestions</h1>
          <p className="text-gray-600">Personalized tips to improve your sleep quality</p>
        </div>

        {recentQuality && (
          <Card className="mb-8 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Your Recent Sleep Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{recentQuality.percentage}%</div>
                  <div className="text-sm text-gray-600">Good Sleep Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{recentQuality.good}</div>
                  <div className="text-sm text-gray-600">Good Nights</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{recentQuality.needsImprovement}</div>
                  <div className="text-sm text-gray-600">Needs Improvement</div>
                </div>
              </div>
              {recentQuality.needsImprovement > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Based on your recent sleep patterns, we've selected personalized suggestions to help improve your
                    sleep quality.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {recentQuality && recentQuality.needsImprovement > 0 ? "Recommended for You" : "General Sleep Tips"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSuggestions.map((suggestion, index) => {
              const IconComponent = suggestion.icon
              return (
                <Card
                  key={suggestion.id}
                  className="shadow-md hover:shadow-lg transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      </div>
                      <Badge className={getCategoryColor(suggestion.category)}>{suggestion.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{suggestion.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="mt-8 animate-fade-in">
          <CardHeader>
            <CardTitle>Additional Sleep Hygiene Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <ul className="space-y-2">
                <li>• Keep a sleep diary to track patterns</li>
                <li>• Avoid large meals before bedtime</li>
                <li>• Use comfortable bedding and pillows</li>
                <li>• Consider blackout curtains or eye masks</li>
              </ul>
              <ul className="space-y-2">
                <li>• Limit daytime naps to 20-30 minutes</li>
                <li>• Try relaxation techniques like deep breathing</li>
                <li>• Keep your bedroom for sleep only</li>
                <li>• Consult a doctor for persistent sleep issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
