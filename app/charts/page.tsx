"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp } from "lucide-react"

interface SleepEntry {
  id: string
  sleepTime: string
  wakeTime: string
  duration: number
  quality: "Good" | "Bad" | "Interrupted"
  date: string
}

export default function ChartsPage() {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [timeRange, setTimeRange] = useState("7")
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("dozyly-sleep-entries")
    if (stored) {
      setSleepEntries(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && chartRef.current) {
      import("chart.js/auto").then((Chart) => {
        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        const ctx = chartRef.current?.getContext("2d")
        if (!ctx) return

        const filteredEntries = getFilteredEntries()
        const chartData = prepareChartData(filteredEntries)

        chartInstance.current = new Chart.default(ctx, {
          type: "bar",
          data: {
            labels: chartData.labels,
            datasets: [
              {
                label: "Sleep Duration (hours)",
                data: chartData.durations,
                backgroundColor: chartData.colors,
                borderColor: chartData.colors.map((color) => color.replace("0.6", "1")),
                borderWidth: 2,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1000,
              easing: "easeInOutQuart",
            },
            plugins: {
              legend: {
                display: true,
                position: "top" as const,
              },
              tooltip: {
                callbacks: {
                  afterLabel: (context) => {
                    const entry = filteredEntries[context.dataIndex]
                    return [`Quality: ${entry.quality}`, `Sleep: ${entry.sleepTime}`, `Wake: ${entry.wakeTime}`]
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Hours",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Date",
                },
              },
            },
          },
        })
      })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [sleepEntries, timeRange])

  const getFilteredEntries = () => {
    const days = Number.parseInt(timeRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return sleepEntries
      .filter((entry) => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-days)
  }

  const prepareChartData = (entries: SleepEntry[]) => {
    const labels = entries.map((entry) => {
      const date = new Date(entry.date)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    })

    const durations = entries.map((entry) => entry.duration)

    const colors = entries.map((entry) => {
      switch (entry.quality) {
        case "Good":
          return "rgba(34, 197, 94, 0.6)"
        case "Bad":
          return "rgba(239, 68, 68, 0.6)"
        case "Interrupted":
          return "rgba(234, 179, 8, 0.6)"
        default:
          return "rgba(107, 114, 128, 0.6)"
      }
    })

    return { labels, durations, colors }
  }

  const getAverageStats = () => {
    const filteredEntries = getFilteredEntries()
    if (filteredEntries.length === 0) return null

    const avgDuration = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0) / filteredEntries.length
    const qualityCounts = filteredEntries.reduce(
      (acc, entry) => {
        acc[entry.quality] = (acc[entry.quality] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const mostCommonQuality = Object.entries(qualityCounts).reduce((a, b) =>
      qualityCounts[a[0]] > qualityCounts[b[0]] ? a : b,
    )[0]

    return {
      avgDuration: Math.round(avgDuration * 100) / 100,
      totalEntries: filteredEntries.length,
      mostCommonQuality,
    }
  }

  const stats = getAverageStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sleep Analytics</h1>
          <p className="text-gray-600">Visualize your sleep patterns and trends</p>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Sleep Duration Chart
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="time-range" className="text-sm font-medium text-gray-700">
                Time Range:
              </label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger id="time-range" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="animate-fade-in">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.avgDuration}h</div>
                <div className="text-sm text-gray-600">Average Sleep</div>
              </CardContent>
            </Card>
            <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalEntries}</div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </CardContent>
            </Card>
            <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.mostCommonQuality}</div>
                <div className="text-sm text-gray-600">Most Common Quality</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="shadow-lg animate-zoom-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Sleep Duration Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sleepEntries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No sleep data available. Start logging your sleep to see charts!</p>
              </div>
            ) : (
              <div className="h-96">
                <canvas ref={chartRef} aria-label="Sleep duration chart showing daily sleep hours and quality"></canvas>
              </div>
            )}
          </CardContent>
        </Card>

        {sleepEntries.length > 0 && (
          <Card className="mt-8 animate-fade-in">
            <CardHeader>
              <CardTitle>Sleep Quality Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Good Sleep</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Interrupted Sleep</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Bad Sleep</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
