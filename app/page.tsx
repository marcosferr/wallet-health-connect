"use client"

import { useState, useEffect } from "react"
import { Activity, Wallet, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SettingsDialog } from "@/components/settings-dialog"
import { HealthSection } from "@/components/health-section"
import { FinanceSection } from "@/components/finance-section"
import {
  HealthConnectService,
  WalletService,
  getHealthChartData,
  getFinanceChartData,
} from "@/lib/api-services"
import {
  mockHealthMetrics,
  mockFinanceMetrics,
  mockAccounts,
  mockRecentTransactions,
} from "@/lib/mock-data"
import type { HealthMetrics, FinanceMetrics, WalletAccount, WalletRecord } from "@/lib/types"

export default function Dashboard() {
  const [apiConfig, setApiConfig] = useState({
    healthConnectUrl: "",
    healthConnectToken: "",
    walletApiToken: "",
  })

  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>(mockHealthMetrics)
  const [financeMetrics, setFinanceMetrics] = useState<FinanceMetrics>(mockFinanceMetrics)
  const [accounts, setAccounts] = useState<WalletAccount[]>(mockAccounts)
  const [transactions, setTransactions] = useState<WalletRecord[]>(mockRecentTransactions)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [usingMockData, setUsingMockData] = useState({ health: true, finance: true })

  const healthChartData = getHealthChartData()
  const financeChartData = getFinanceChartData()

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("lifesync-api-config")
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setApiConfig(parsed)
      } catch {
        // Invalid config, ignore
      }
    }
  }, [])

  // Save config to localStorage when changed
  const handleConfigChange = (newConfig: typeof apiConfig) => {
    setApiConfig(newConfig)
    localStorage.setItem("lifesync-api-config", JSON.stringify(newConfig))
    fetchData(newConfig)
  }

  const fetchData = async (config = apiConfig) => {
    setIsLoading(true)

    const healthService = new HealthConnectService(config.healthConnectUrl, config.healthConnectToken)
    const walletService = new WalletService(config.walletApiToken)

    try {
      // Fetch health data
      if (healthService.isConfigured()) {
        const metrics = await healthService.getAllMetrics()
        setHealthMetrics(metrics)
        setUsingMockData((prev) => ({ ...prev, health: false }))
      } else {
        setHealthMetrics(mockHealthMetrics)
        setUsingMockData((prev) => ({ ...prev, health: true }))
      }

      // Fetch finance data
      if (walletService.isConfigured()) {
        const [metrics, accs, txns] = await Promise.all([
          walletService.getFinanceMetrics(),
          walletService.getAccounts(),
          walletService.getRecords({ limit: 10 }),
        ])
        setFinanceMetrics(metrics)
        setAccounts(accs)
        setTransactions(txns)
        setUsingMockData((prev) => ({ ...prev, finance: false }))
      } else {
        setFinanceMetrics(mockFinanceMetrics)
        setAccounts(mockAccounts)
        setTransactions(mockRecentTransactions)
        setUsingMockData((prev) => ({ ...prev, finance: true }))
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">LifeSync</h1>
                <p className="text-xs text-muted-foreground">Tu vida, en un vistazo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(usingMockData.health || usingMockData.finance) && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-xs text-warning">Datos de ejemplo</span>
                </div>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchData()}
                disabled={isLoading}
                className="border-border bg-card hover:bg-secondary"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="sr-only">Actualizar</span>
              </Button>
              <SettingsDialog config={apiConfig} onConfigChange={handleConfigChange} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Status Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${usingMockData.health ? "bg-warning" : "bg-primary"}`}
              />
              <span className="text-xs text-muted-foreground">
                Health Connect: {usingMockData.health ? "Demo" : "Conectado"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${usingMockData.finance ? "bg-warning" : "bg-primary"}`}
              />
              <span className="text-xs text-muted-foreground">
                Wallet API: {usingMockData.finance ? "Demo" : "Conectado"}
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            Actualizado: {lastUpdated.toLocaleTimeString("es-ES")}
          </span>
        </div>

        {/* Tabs for Mobile */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex bg-secondary">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Salud</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Finanzas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <HealthSection metrics={healthMetrics} chartData={healthChartData} isLoading={isLoading} />
            <FinanceSection
              metrics={financeMetrics}
              chartData={financeChartData}
              accounts={accounts}
              recentTransactions={transactions}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="health">
            <HealthSection metrics={healthMetrics} chartData={healthChartData} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="finance">
            <FinanceSection
              metrics={financeMetrics}
              chartData={financeChartData}
              accounts={accounts}
              recentTransactions={transactions}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              LifeSync Dashboard - Conecta tus APIs para datos reales
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a
                href="https://rest.budgetbakers.com/wallet/reference"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Wallet API Docs
              </a>
              <a
                href="https://github.com/ShuchirJ/HCGateway"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                HCGateway Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
