"use client"

import { Activity, Heart, Moon, Flame, Scale, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "./metric-card"
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Salud y Fitness</h2>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Pasos"
          value={metrics.steps.toLocaleString()}
          icon={<Activity className="h-4 w-4" />}
          progress={{ current: metrics.steps, max: metrics.stepsGoal }}
          accentColor="primary"
        />
        <MetricCard
          title="Calorías"
          value={metrics.calories.toLocaleString()}
          subtitle="kcal"
          icon={<Flame className="h-4 w-4" />}
          progress={{ current: metrics.calories, max: metrics.caloriesGoal }}
          accentColor="var(--accent)"
        />
        <MetricCard
          title="Frecuencia cardíaca"
          value={metrics.heartRate}
          subtitle="bpm"
          icon={<Heart className="h-4 w-4" />}
          trend={{ value: -2, label: "vs ayer" }}
        />
        <MetricCard
          title="Sueño"
          value={metrics.sleep.toFixed(1)}
          subtitle="horas"
          icon={<Moon className="h-4 w-4" />}
          progress={{ current: metrics.sleep, max: metrics.sleepGoal }}
          accentColor="var(--chart-3)"
        />
        <MetricCard
          title="Distancia"
          value={metrics.distance.toFixed(1)}
          subtitle="km"
          icon={<MapPin className="h-4 w-4" />}
          trend={{ value: 12, label: "vs ayer" }}
        />
        <MetricCard
          title="Peso"
          value={metrics.weight.toFixed(1)}
          subtitle="kg"
          icon={<Scale className="h-4 w-4" />}
          trend={{ value: -0.5, label: "esta semana" }}
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Steps Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Pasos - Últimos 7 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData.steps}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  formatter={(value: number) => [value.toLocaleString(), "Pasos"]}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Heart Rate Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" />
              Frecuencia cardíaca - Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData.heartRate}>
                <defs>
                  <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  interval={5}
                />
                <YAxis hide domain={[50, 120]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  formatter={(value: number) => [value, "bpm"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--destructive)"
                  strokeWidth={2}
                  fill="url(#heartGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sleep Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Moon className="h-4 w-4 text-info" />
              Sueño - Últimos 7 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData.sleep}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <YAxis hide domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  formatter={(value: number) => [`${value} h`, "Sueño"]}
                />
                <Bar dataKey="value" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weight Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scale className="h-4 w-4 text-warning" />
              Peso - Último mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData.weight}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  interval={6}
                />
                <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  formatter={(value: number) => [`${value} kg`, "Peso"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
