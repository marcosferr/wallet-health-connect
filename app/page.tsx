"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { StatCard } from "@/components/stat-card"
import { ScoreRing } from "@/components/score-ring"
import { HealthSection } from "@/components/health-section"
import { FinanceSection } from "@/components/finance-section"
import { SettingsDialog } from "@/components/settings-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  Wallet,
  Heart,
  Moon,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Download,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useApiData } from "@/hooks/use-api-data"
import {
  mockStepsHistory,
  mockCaloriesHistory,
  mockHeartRateHistory,
  mockSleepHistory,
  mockWeightHistory,
} from "@/lib/mock-data"
import type { ApiConfig } from "@/lib/types"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

type TimePeriod = "today" | "week" | "month"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<"overview" | "health" | "finance">("overview")
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [config, setConfig] = useState<ApiConfig>({
    healthConnectUrl: "",
    healthConnectToken: "",
    walletApiToken: "",
  })
  const [greeting, setGreeting] = useState("Buenos días")
  const [currentDate, setCurrentDate] = useState("Cargando...")
  const [isHydrated, setIsHydrated] = useState(false)

  // Fetch real data from APIs
  const { healthMetrics, financeMetrics, accounts, recentTransactions, incomeHistory, expenseHistory, expensesByCategory, dailySpending, isLoading, error } = useApiData(config)

  const isUsingMockData = !config.healthConnectUrl && !config.walletApiToken

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem("dashboardConfig")
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch {
        console.error("[v0] Failed to parse saved config")
      }
    }

    // Set greeting and date
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Buenos días")
    else if (hour < 18) setGreeting("Buenas tardes")
    else setGreeting("Buenas noches")

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
    const date = new Date().toLocaleDateString("es-ES", options)
    setCurrentDate(date.charAt(0).toUpperCase() + date.slice(1))
    setIsHydrated(true)
  }, [])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value)

  // Save config to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("dashboardConfig", JSON.stringify(config))
    }
  }, [config, isHydrated])

  // Calculate scores
  const stepsScore = Math.min((healthMetrics.steps / healthMetrics.stepsGoal) * 100, 100)
  const sleepScore = Math.min((healthMetrics.sleep / healthMetrics.sleepGoal) * 100, 100)
  const savingsScore = financeMetrics.monthlyIncome > 0 
    ? Math.min((financeMetrics.savings / financeMetrics.monthlyIncome) * 100 * 2, 100)
    : 0
  const healthScore = Math.round((stepsScore + sleepScore) / 2)
  const financeScore = Math.round(savingsScore)

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Pasos Hoy"
          value={healthMetrics.steps.toLocaleString()}
          subtitle={`Meta: ${healthMetrics.stepsGoal.toLocaleString()}`}
          icon={Activity}
          iconColor="text-health-steps"
          valueClassName="text-health-steps"
        />
        <StatCard
          title="Balance Total"
          value={formatCurrency(financeMetrics.totalBalance)}
          icon={Wallet}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Ritmo Cardiaco"
          value={`${healthMetrics.heartRate} BPM`}
          icon={Heart}
          iconColor="text-health-heart"
          valueClassName="text-health-heart"
        />
        <StatCard
          title="Ahorro Mensual"
          value={formatCurrency(financeMetrics.savings)}
          icon={TrendingUp}
          iconColor="text-income"
          valueClassName="text-income"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Steps Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Pasos Semanales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-3xl font-bold text-primary">
                {mockStepsHistory.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">Total semanal</span>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockStepsHistory} barSize={28}>
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

        {/* Finance Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Ingresos vs Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(financeMetrics.monthlyIncome - financeMetrics.monthlyExpenses)}
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                  <span className="text-xs font-medium text-income">Ingresos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                  <span className="text-xs font-medium text-expense">Gastos</span>
                </div>
              </div>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={incomeHistory.map((inc, i) => ({
                    date: inc.date,
                    income: inc.value,
                    expenses: expenseHistory[i]?.value || 0,
                  }))}
                >
                  <defs>
                    <linearGradient id="incomeGradOverview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradOverview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      color: "var(--foreground)",
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "income" ? "Ingresos" : "Gastos",
                    ]}
                  />
                  <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2.5} fill="url(#incomeGradOverview)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} fill="url(#expenseGradOverview)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Rings */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Indicadores Principales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-around gap-6 py-4">
            <ScoreRing value={healthScore}    label="Salud"       size={100} strokeWidth={8} color="#00d4ff" />
            <ScoreRing value={financeScore}   label="Finanzas"    size={100} strokeWidth={8} color="#22c55e" />
            <ScoreRing value={Math.round(stepsScore)}  label="Pasos"  size={100} strokeWidth={8} color="#00d4ff" />
            <ScoreRing value={Math.round(sleepScore)}  label="Sueno"  size={100} strokeWidth={8} color="#a78bfa" />
            <ScoreRing
              value={Math.round((financeMetrics.budgetUsed / financeMetrics.budgetTotal) * 100)}
              label="Presupuesto"
              size={100}
              strokeWidth={8}
              color="#ef4444"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Health Quick Stats */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-health-steps" />
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Resumen de Salud
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Calorias</p>
                <p className="mt-1 text-2xl font-bold text-health-calories">
                  {healthMetrics.calories.toLocaleString()}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((healthMetrics.calories / healthMetrics.caloriesGoal) * 100, 100)}%`,
                      backgroundColor: "#f97316",
                    }}
                  />
                </div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Sueno</p>
                <p className="mt-1 text-2xl font-bold text-health-sleep">{healthMetrics.sleep}h</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((healthMetrics.sleep / healthMetrics.sleepGoal) * 100, 100)}%`,
                      backgroundColor: "#a78bfa",
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finance Quick Stats */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" style={{ color: "#00d4ff" }} />
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Resumen Financiero
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Ingresos</p>
                <p className="mt-1 text-2xl font-bold text-success">
                  {formatCurrency(financeMetrics.monthlyIncome)}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-xs text-muted-foreground">Gastos</p>
                <p className="mt-1 text-2xl font-bold text-destructive">
                  {formatCurrency(financeMetrics.monthlyExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "health":
        return (
          <HealthSection
            metrics={healthMetrics}
            chartData={{
              steps: mockStepsHistory,
              calories: mockCaloriesHistory,
              heartRate: mockHeartRateHistory,
              sleep: mockSleepHistory,
              weight: mockWeightHistory,
            }}
          />
        )
      case "finance":
        return (
          <FinanceSection
            metrics={financeMetrics}
            chartData={{
              expenses: expensesByCategory,
              income: incomeHistory,
              expenseHistory: expenseHistory,
              dailySpending: dailySpending,
            }}
            accounts={accounts}
            recentTransactions={recentTransactions}
          />
        )
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="pl-56 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {activeSection === "overview" ? "Dashboard" : activeSection === "health" ? "Salud y Fitness" : "Finanzas"}
                </h1>
                <p className="text-sm text-muted-foreground">{isHydrated ? currentDate : "Cargando..."}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Period Selector */}
              <div className="flex items-center rounded-lg border border-border bg-card p-1">
                {(["today", "week", "month"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                      timePeriod === period
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {period === "today" ? "Hoy" : period === "week" ? "Semana" : "Mes"}
                  </button>
                ))}
              </div>

              <Button variant="outline" size="sm" className="border-border bg-card">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>

              <SettingsDialog config={config} onConfigChange={setConfig} />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Mock Data Warning */}
          {isUsingMockData && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="text-sm text-warning">
                Mostrando datos de demostracion. Configura tus APIs en ajustes para ver datos reales.
              </p>
            </div>
          )}

          {renderContent()}
        </div>
      </main>

      {/* Settings Modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg p-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-foreground mb-4">Configuracion de APIs</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Conecta tus APIs para obtener datos reales. Sin configuracion, se mostraran datos de ejemplo.
              </p>

              <div className="space-y-6">
                {/* Health Connect Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Health Connect Gateway
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">URL del servidor</label>
                      <input
                        type="text"
                        placeholder="https://tu-servidor-hcgateway.com"
                        value={config.healthConnectUrl}
                        onChange={(e) => setConfig({ ...config, healthConnectUrl: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Token de autenticacion</label>
                      <input
                        type="password"
                        placeholder="Tu token de Health Connect"
                        value={config.healthConnectToken}
                        onChange={(e) => setConfig({ ...config, healthConnectToken: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Wallet API Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Wallet API (Budget Bakers)
                  </h3>
                  <div>
                    <label className="text-sm text-muted-foreground">Token de API</label>
                    <input
                      type="password"
                      placeholder="Tu token de Budget Bakers Wallet"
                      value={config.walletApiToken}
                      onChange={(e) => setConfig({ ...config, walletApiToken: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Requiere plan Premium de Budget Bakers
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSettingsOpen(false)} className="border-border">
                  Cancelar
                </Button>
                <Button
                  onClick={() => setSettingsOpen(false)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
