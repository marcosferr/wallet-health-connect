"use client"

import { Activity, Heart, Moon, Flame, Scale } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreRing } from "./score-ring"
import type { HealthMetrics, ChartDataPoint } from "@/lib/types"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

interface HealthSectionProps {
  metrics: HealthMetrics
  chartData: {
    steps: ChartDataPoint[]
    calories: ChartDataPoint[]
    heartRate: ChartDataPoint[]
    sleep: ChartDataPoint[]
    weight: ChartDataPoint[]
  }
  isLoading?: boolean
}

const COLORS = {
  steps:    "#00d4ff",
  calories: "#f97316",
  heart:    "#ef4444",
  sleep:    "#a78bfa",
  weight:   "#34d399",
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  color: "var(--foreground)",
}

export function HealthSection({ metrics, chartData, isLoading }: HealthSectionProps) {
  const stepsPercent    = Math.round((metrics.steps    / metrics.stepsGoal)    * 100)
  const caloriesPercent = Math.round((metrics.calories / metrics.caloriesGoal) * 100)
  const sleepPercent    = Math.round((metrics.sleep    / metrics.sleepGoal)    * 100)

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Steps — cyan */}
        <Card className="border-border bg-card" style={{ borderLeftWidth: 3, borderLeftColor: COLORS.steps }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pasos</p>
              <Activity className="h-5 w-5" style={{ color: COLORS.steps }} />
            </div>
            <p className="mt-3 text-3xl font-bold" style={{ color: COLORS.steps }}>
              {metrics.steps.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Meta: {metrics.stepsGoal.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Calories — orange */}
        <Card className="border-border bg-card" style={{ borderLeftWidth: 3, borderLeftColor: COLORS.calories }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Calorias</p>
              <Flame className="h-5 w-5" style={{ color: COLORS.calories }} />
            </div>
            <p className="mt-3 text-3xl font-bold" style={{ color: COLORS.calories }}>
              {metrics.calories.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Meta: {metrics.caloriesGoal.toLocaleString()} kcal</p>
          </CardContent>
        </Card>

        {/* Heart Rate — red */}
        <Card className="border-border bg-card" style={{ borderLeftWidth: 3, borderLeftColor: COLORS.heart }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ritmo Cardiaco</p>
              <Heart className="h-5 w-5" style={{ color: COLORS.heart }} />
            </div>
            <p className="mt-3 text-3xl font-bold" style={{ color: COLORS.heart }}>
              {metrics.heartRate}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">BPM promedio</p>
          </CardContent>
        </Card>

        {/* Sleep — purple */}
        <Card className="border-border bg-card" style={{ borderLeftWidth: 3, borderLeftColor: COLORS.sleep }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Horas de Sueno</p>
              <Moon className="h-5 w-5" style={{ color: COLORS.sleep }} />
            </div>
            <p className="mt-3 text-3xl font-bold" style={{ color: COLORS.sleep }}>
              {metrics.sleep.toFixed(1)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Meta: {metrics.sleepGoal}h</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Steps Bar Chart — cyan */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color: COLORS.steps }} />
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Pasos Semanales
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.steps} barSize={24}>
                  <defs>
                    <linearGradient id="stepsBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.steps} stopOpacity={1} />
                      <stop offset="100%" stopColor={COLORS.steps} stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value.toLocaleString(), "Pasos"]} />
                  <Bar dataKey="value" fill="url(#stepsBarGrad)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Heart Rate Area Chart — red */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" style={{ color: COLORS.heart }} />
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Ritmo Cardiaco (24h)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.heartRate}>
                  <defs>
                    <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.heart} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.heart} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 110]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} BPM`, "Ritmo"]} />
                  <Area type="monotone" dataKey="value" stroke={COLORS.heart} strokeWidth={2.5} fill="url(#heartGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Rings Row — each with its metric color */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Progreso Diario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-around gap-6 py-4">
            <ScoreRing value={stepsPercent}    label="Pasos"    size={90} strokeWidth={6} color={COLORS.steps} />
            <ScoreRing value={caloriesPercent} label="Calorias" size={90} strokeWidth={6} color={COLORS.calories} />
            <ScoreRing value={sleepPercent}    label="Sueno"    size={90} strokeWidth={6} color={COLORS.sleep} />
            <ScoreRing value={metrics.activeMinutes} maxValue={60} label="Activo" size={90} strokeWidth={6} color={COLORS.heart} />
            <ScoreRing value={Math.round(metrics.distance * 10)} maxValue={100} label="Distancia" size={90} strokeWidth={6} color={COLORS.weight} />
          </div>
        </CardContent>
      </Card>

      {/* Sleep and Weight Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sleep Bar Chart — purple */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" style={{ color: COLORS.sleep }} />
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Historial de Sueno
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.sleep} barSize={20}>
                  <defs>
                    <linearGradient id="sleepBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.sleep} stopOpacity={1} />
                      <stop offset="100%" stopColor={COLORS.sleep} stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 10]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}h`, "Sueno"]} />
                  <Bar dataKey="value" fill="url(#sleepBarGrad)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weight Line Chart — green */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4" style={{ color: COLORS.weight }} />
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Evolucion del Peso
                </CardTitle>
              </div>
              <span className="text-lg font-bold" style={{ color: COLORS.weight }}>
                {metrics.weight} kg
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.weight}>
                  <defs>
                    <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.weight} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={COLORS.weight} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} interval={6} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} kg`, "Peso"]} />
                  <Line type="monotone" dataKey="value" stroke={COLORS.weight} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
