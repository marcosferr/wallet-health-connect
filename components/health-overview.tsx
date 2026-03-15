"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Activity, Moon, Footprints, Flame, Heart, Scale } from "lucide-react"

interface HealthOverviewProps {
  weeklySteps: Array<{ day: string; steps: number }>
  sleepData: Array<{ day: string; hours: number }>
  heartRateData: Array<{ time: string; bpm: number }>
  summary: {
    steps: number
    stepsGoal: number
    calories: number
    caloriesGoal: number
    heartRate: number
    sleep: number
    sleepGoal: number
    weight: number
  }
}

export function HealthOverview({ weeklySteps, sleepData, heartRateData, summary }: HealthOverviewProps) {
  const stepsProgress = (summary.steps / summary.stepsGoal) * 100
  const caloriesProgress = (summary.calories / summary.caloriesGoal) * 100
  const sleepProgress = (summary.sleep / summary.sleepGoal) * 100

  return (
    <div className="space-y-6">
      {/* Health Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <Footprints className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">{Math.round(stepsProgress)}%</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {summary.steps.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Pasos hoy</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(stepsProgress, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <Flame className="h-5 w-5 text-warning" />
              <span className="text-xs text-muted-foreground">{Math.round(caloriesProgress)}%</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {summary.calories.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Calorías</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-warning transition-all"
                style={{ width: `${Math.min(caloriesProgress, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <Heart className="h-5 w-5 text-destructive" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{summary.heartRate}</p>
            <p className="text-xs text-muted-foreground">BPM promedio</p>
            <p className="mt-2 text-xs text-chart-3">Normal</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <Moon className="h-5 w-5 text-accent" />
              <span className="text-xs text-muted-foreground">{Math.round(sleepProgress)}%</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{summary.sleep}h</p>
            <p className="text-xs text-muted-foreground">Sueño</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${Math.min(sleepProgress, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <Activity className="h-5 w-5 text-chart-3" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">5.2 km</p>
            <p className="text-xs text-muted-foreground">Distancia</p>
            <p className="mt-2 text-xs text-primary">+12% vs ayer</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <Scale className="h-5 w-5 text-info" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{summary.weight} kg</p>
            <p className="text-xs text-muted-foreground">Peso</p>
            <p className="mt-2 text-xs text-primary">-0.5 kg esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Steps */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Pasos semanales
            </CardTitle>
            <p className="text-sm text-muted-foreground">Últimos 7 días</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySteps} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #1e3a5f",
                      borderRadius: "8px",
                      color: "#f0f4f8",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), "Pasos"]}
                  />
                  <Bar dataKey="steps" fill="#00d4aa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Heart Rate */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Frecuencia cardíaca
            </CardTitle>
            <p className="text-sm text-muted-foreground">Hoy</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={heartRateData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    domain={[50, 120]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #1e3a5f",
                      borderRadius: "8px",
                      color: "#f0f4f8",
                    }}
                    formatter={(value: number) => [value, "BPM"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="bpm"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#heartGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sleep Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            Historial de sueño
          </CardTitle>
          <p className="text-sm text-muted-foreground">Últimos 7 días</p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sleepData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #1e3a5f",
                    borderRadius: "8px",
                    color: "#f0f4f8",
                  }}
                  formatter={(value: number) => [`${value}h`, "Sueño"]}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#sleepGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
