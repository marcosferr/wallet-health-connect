"use client"

import { Activity, Heart, Moon, Flame, Scale, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "./stat-card"
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

export function HealthSection({ metrics, chartData, isLoading }: HealthSectionProps) {
  const stepsPercent = Math.round((metrics.steps / metrics.stepsGoal) * 100)
  const caloriesPercent = Math.round((metrics.calories / metrics.caloriesGoal) * 100)
  const sleepPercent = Math.round((metrics.sleep / metrics.sleepGoal) * 100)

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Pasos"
          value={metrics.steps.toLocaleString()}
          subtitle={`Meta: ${metrics.stepsGoal.toLocaleString()}`}
          icon={Activity}
        />
        <StatCard
          title="Calorias"
          value={metrics.calories.toLocaleString()}
          subtitle={`Meta: ${metrics.caloriesGoal.toLocaleString()} kcal`}
          icon={Flame}
        />
        <StatCard
          title="Ritmo Cardiaco"
          value={`${metrics.heartRate}`}
          subtitle="BPM promedio"
          icon={Heart}
          iconColor="text-destructive"
        />
        <StatCard
          title="Horas de Sueno"
          value={metrics.sleep.toFixed(1)}
          subtitle={`Meta: ${metrics.sleepGoal}h`}
          icon={Moon}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Steps Bar Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Pasos Semanales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.steps} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d4559" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#8892a6", fontSize: 11 }}
                    axisLine={{ stroke: "#3d4559" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#8892a6", fontSize: 11 }}
                    axisLine={{ stroke: "#3d4559" }}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#252b3d",
                      border: "1px solid #3d4559",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), "Pasos"]}
                  />
                  <Bar dataKey="value" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Heart Rate Area Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Ritmo Cardiaco (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.heartRate}>
                  <defs>
                    <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d4559" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#8892a6", fontSize: 11 }}
                    axisLine={{ stroke: "#3d4559" }}
                    tickLine={false}
                    interval={3}
                  />
                  <YAxis
                    tick={{ fill: "#8892a6", fontSize: 11 }}
                    axisLine={{ stroke: "#3d4559" }}
                    tickLine={false}
                    domain={[50, 110]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#252b3d",
                      border: "1px solid #3d4559",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [`${value} BPM`, "Ritmo"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    fill="url(#heartGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Rings Row */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Progreso Diario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-around gap-6 py-4">
            <ScoreRing
              value={stepsPercent}
              label="Pasos"
              size={90}
              strokeWidth={6}
            />
            <ScoreRing
              value={caloriesPercent}
              label="Calorias"
              size={90}
              strokeWidth={6}
            />
            <ScoreRing
              value={sleepPercent}
              label="Sueno"
              size={90}
              strokeWidth={6}
            />
            <ScoreRing
              value={metrics.activeMinutes}
              maxValue={60}
              label="Activo"
              size={90}
              strokeWidth={6}
            />
            <ScoreRing
              value={Math.round(metrics.distance * 10)}
              maxValue={100}
              label="Distancia"
              size={90}
              strokeWidth={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sleep and Weight Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sleep Bar Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Historial de Sueno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.sleep} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d4559" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#8892a6", fontSize: 11 }}
                    axisLine={{ stroke: "#3d4559" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#8892a6", fontSize: 11 }}
                    axisLine={{ stroke: "#3d4559" }}
                    tickLine={false}
                    domain={[0, 10]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#252b3d",
                      border: "1px solid #3d4559",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [`${value}h`, "Sueno"]}
                  />
                  <Bar dataKey="value" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weight Line Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Evolucion del Peso
              </CardTitle>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold text-primary">{metrics.weight} kg</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.weight}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d4559" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#8892a6", fontSize: 11 }}
                    axisLine={{ stroke: "#3d4559" }}
                    tickLine={false}
                    interval={6}
                  />
                  <YAxis
                    tick={{ fill: "#8892a6", fontSize: 11 }}
                    axisLine={{ stroke: "#3d4559" }}
                    tickLine={false}
                    domain={["dataMin - 1", "dataMax + 1"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#252b3d",
                      border: "1px solid #3d4559",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [`${value} kg`, "Peso"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
