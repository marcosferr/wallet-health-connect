"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { VitalScoreCard } from "@/components/vital-score-card"
import { StatCard } from "@/components/stat-card"
import { EvolutionChart } from "@/components/evolution-chart"
import { BalanceRadarChart } from "@/components/balance-radar-chart"
import { HealthOverview } from "@/components/health-overview"
import { FinanceOverview } from "@/components/finance-overview"
import { SettingsDialog } from "@/components/settings-dialog"
import { Button } from "@/components/ui/button"
import { Clock, CheckSquare, Target, Download, AlertCircle, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApiConfig {
  healthConnectUrl: string
  healthConnectToken: string
  walletApiToken: string
}

// Mock data for the dashboard
const mockEvolutionData = [
  { day: "Lun", foco: 65, energia: 45, sistema: 70 },
  { day: "Mar", foco: 70, energia: 55, sistema: 65 },
  { day: "Mié", foco: 68, energia: 60, sistema: 55 },
  { day: "Jue", foco: 55, energia: 45, sistema: 50 },
  { day: "Vie", foco: 50, energia: 40, sistema: 45 },
  { day: "Sáb", foco: 60, energia: 55, sistema: 65 },
  { day: "Dom", foco: 72, energia: 65, sistema: 55 },
]

const mockBalanceData = [
  { subject: "Foco", value: 65, fullMark: 100 },
  { subject: "Salud", value: 78, fullMark: 100 },
  { subject: "Disciplina", value: 55, fullMark: 100 },
  { subject: "Metas", value: 70, fullMark: 100 },
  { subject: "Bienestar", value: 60, fullMark: 100 },
]

const mockHealthSummary = {
  steps: 8432,
  stepsGoal: 10000,
  calories: 1850,
  caloriesGoal: 2200,
  heartRate: 72,
  sleep: 7.2,
  sleepGoal: 8,
  weight: 75.5,
}

const mockWeeklySteps = [
  { day: "Lun", steps: 9200 },
  { day: "Mar", steps: 7800 },
  { day: "Mié", steps: 10500 },
  { day: "Jue", steps: 6400 },
  { day: "Vie", steps: 8900 },
  { day: "Sáb", steps: 12000 },
  { day: "Dom", steps: 8432 },
]

const mockSleepData = [
  { day: "Lun", hours: 7.5 },
  { day: "Mar", hours: 6.8 },
  { day: "Mié", hours: 8.2 },
  { day: "Jue", hours: 6.0 },
  { day: "Vie", hours: 7.0 },
  { day: "Sáb", hours: 8.5 },
  { day: "Dom", hours: 7.2 },
]

const mockHeartRateData = [
  { time: "6am", bpm: 62 },
  { time: "9am", bpm: 75 },
  { time: "12pm", bpm: 85 },
  { time: "3pm", bpm: 78 },
  { time: "6pm", bpm: 90 },
  { time: "9pm", bpm: 68 },
]

const mockFinanceSummary = {
  balance: 125000,
  income: 45000,
  expenses: 32000,
  savings: 13000,
}

const mockMonthlyFinance = [
  { month: "Oct", ingresos: 42000, gastos: 28000 },
  { month: "Nov", ingresos: 44000, gastos: 31000 },
  { month: "Dic", ingresos: 52000, gastos: 38000 },
  { month: "Ene", ingresos: 43000, gastos: 29000 },
  { month: "Feb", ingresos: 45000, gastos: 30000 },
  { month: "Mar", ingresos: 45000, gastos: 32000 },
]

const mockExpenseCategories = [
  { name: "Vivienda", value: 12000, color: "#00d4aa" },
  { name: "Alimentación", value: 6500, color: "#8b5cf6" },
  { name: "Transporte", value: 4500, color: "#22c55e" },
  { name: "Entretenimiento", value: 3500, color: "#f59e0b" },
  { name: "Otros", value: 5500, color: "#ec4899" },
]

type TimePeriod = "today" | "week" | "month"

export default function LifeOSDashboard() {
  const [activeSection, setActiveSection] = useState("resumen")
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [config, setConfig] = useState<ApiConfig>({
    healthConnectUrl: "",
    healthConnectToken: "",
    walletApiToken: "",
  })
  const [greeting, setGreeting] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  const isUsingMockData = !config.healthConnectUrl && !config.walletApiToken

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Buenos dias")
    else if (hour < 18) setGreeting("Buenas tardes")
    else setGreeting("Buenas noches")

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
    const date = new Date().toLocaleDateString("es-ES", options)
    setCurrentDate(date.charAt(0).toUpperCase() + date.slice(1))
  }, [])

  const getVitalScore = () => {
    const stepsScore = Math.min((mockHealthSummary.steps / mockHealthSummary.stepsGoal) * 30, 30)
    const sleepScore = Math.min((mockHealthSummary.sleep / mockHealthSummary.sleepGoal) * 30, 30)
    const activityScore = 20
    const financeScore = Math.min((mockFinanceSummary.savings / mockFinanceSummary.income) * 20 * 5, 20)
    return Math.round(stepsScore + sleepScore + activityScore + financeScore)
  }

  const vitalScore = getVitalScore()
  const vitalStatus = vitalScore >= 70 ? "good" : vitalScore >= 50 ? "attention" : "critical"

  const handleConfigSave = (newConfig: ApiConfig) => {
    setConfig(newConfig)
    setSettingsOpen(false)
  }

  const renderContent = () => {
    switch (activeSection) {
      case "salud":
        return (
          <HealthOverview
            weeklySteps={mockWeeklySteps}
            sleepData={mockSleepData}
            heartRateData={mockHeartRateData}
            summary={mockHealthSummary}
          />
        )
      case "finanzas":
        return (
          <FinanceOverview
            monthlyData={mockMonthlyFinance}
            expenseCategories={mockExpenseCategories}
            summary={mockFinanceSummary}
          />
        )
      default:
        return (
          <div className="space-y-6">
            {/* Top Row - Vital Score + Stats */}
            <div className="grid gap-4 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <VitalScoreCard
                  score={vitalScore}
                  status={vitalStatus}
                  message="Empieza marcando tus habitos y abriendo una sesion de foco."
                />
              </div>
              <StatCard
                title="Foco esta semana"
                value="8.6h"
                subtitle="- Faltan 19.4h"
                icon={Clock}
                iconColor="text-primary"
              />
              <StatCard
                title="Habitos esta semana"
                value="30/56"
                subtitle="- Tasa: 54%"
                icon={CheckSquare}
                iconColor="text-accent"
              />
            </div>

            {/* Second Stats Row */}
            <div className="grid gap-4 lg:grid-cols-4">
              <div className="lg:col-span-2" />
              <StatCard
                title="Progreso metas"
                value="55%"
                subtitle="- 4 activas"
                icon={Target}
                iconColor="text-chart-3"
              />
              <StatCard
                title="Balance financiero"
                value="$125k"
                subtitle="+$13k este mes"
                icon={LayoutGrid}
                iconColor="text-warning"
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <EvolutionChart data={mockEvolutionData} />
              </div>
              <BalanceRadarChart data={mockBalanceData} />
            </div>

            {/* Quick Health & Finance Overview */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Resumen de Salud</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Pasos hoy</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                      {mockHealthSummary.steps.toLocaleString()}
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min((mockHealthSummary.steps / mockHealthSummary.stepsGoal) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Sueno anoche</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{mockHealthSummary.sleep}h</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{
                          width: `${Math.min((mockHealthSummary.sleep / mockHealthSummary.sleepGoal) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Resumen Financiero</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Ingresos del mes</p>
                    <p className="mt-1 text-2xl font-bold text-chart-3">
                      ${mockFinanceSummary.income.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Gastos del mes</p>
                    <p className="mt-1 text-2xl font-bold text-destructive">
                      ${mockFinanceSummary.expenses.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <LayoutGrid className="h-5 w-5 text-muted-foreground" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {greeting}, Carlos
                </h1>
                <p className="text-sm text-muted-foreground">{currentDate}</p>
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
                        ? "bg-secondary text-foreground"
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
                Mostrando datos de demostracion. Configura tus APIs para ver datos reales.
              </p>
            </div>
          )}

          {renderContent()}
        </div>
      </main>

      {/* Settings Modal when opened from sidebar */}
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
                  <h3 className="text-sm font-medium text-primary">Health Connect Gateway</h3>
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
                  <h3 className="text-sm font-medium text-accent">Wallet API (Budget Bakers)</h3>
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
                <Button onClick={() => handleConfigSave(config)} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
