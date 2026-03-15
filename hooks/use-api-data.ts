import { useEffect, useState } from "react"
import type { ApiConfig, ChartDataPoint, DashboardDataPayload, ExpenseByCategory, HealthChartData, ProviderStatus } from "@/lib/types"
import {
  mockCaloriesHistory,
  mockHealthMetrics,
  mockFinanceMetrics,
  mockHeartRateHistory,
  mockRecentTransactions,
  mockAccounts,
  mockIncomeHistory,
  mockExpenseHistory,
  mockExpensesByCategory,
  mockDailySpending,
  mockSleepHistory,
  mockStepsHistory,
  mockWeightHistory,
} from "@/lib/mock-data"
import type { WalletRecord, WalletAccount } from "@/lib/types"

interface UseApiDataResult {
  healthMetrics: typeof mockHealthMetrics
  healthCharts: HealthChartData
  financeMetrics: typeof mockFinanceMetrics
  financeCurrency: string
  accounts: WalletAccount[]
  recentTransactions: WalletRecord[]
  incomeHistory: ChartDataPoint[]
  expenseHistory: ChartDataPoint[]
  expensesByCategory: ExpenseByCategory[]
  dailySpending: ChartDataPoint[]
  healthStatus: ProviderStatus
  walletStatus: ProviderStatus
  isUsingMockData: boolean
  isLoading: boolean
  error: string | null
}

export function useApiData(config: ApiConfig): UseApiDataResult {
  const [healthMetrics, setHealthMetrics] = useState(mockHealthMetrics)
  const [healthCharts, setHealthCharts] = useState<HealthChartData>({
    steps: mockStepsHistory,
    calories: mockCaloriesHistory,
    heartRate: mockHeartRateHistory,
    sleep: mockSleepHistory,
    weight: mockWeightHistory,
  })
  const [financeMetrics, setFinanceMetrics] = useState(mockFinanceMetrics)
  const [financeCurrency, setFinanceCurrency] = useState("EUR")
  const [accounts, setAccounts] = useState<WalletAccount[]>(mockAccounts)
  const [recentTransactions, setRecentTransactions] = useState<WalletRecord[]>(mockRecentTransactions)
  const [incomeHistory, setIncomeHistory] = useState<ChartDataPoint[]>(mockIncomeHistory)
  const [expenseHistory, setExpenseHistory] = useState<ChartDataPoint[]>(mockExpenseHistory)
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>(mockExpensesByCategory)
  const [dailySpending, setDailySpending] = useState<ChartDataPoint[]>(mockDailySpending)
  const [healthStatus, setHealthStatus] = useState<ProviderStatus>({
    configured: false,
    isLive: false,
    resolvedFrom: "none",
    message: "Sin credenciales: usando mock de salud.",
  })
  const [walletStatus, setWalletStatus] = useState<ProviderStatus>({
    configured: false,
    isLive: false,
    resolvedFrom: "none",
    message: "Sin token de Wallet: usando mock financiero.",
  })
  const [isUsingMockData, setIsUsingMockData] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/dashboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ config }),
        })

        if (!response.ok) {
          throw new Error(`Dashboard API error: ${response.status}`)
        }

        const payload = (await response.json()) as DashboardDataPayload

        setHealthMetrics(payload.healthMetrics)
        setHealthCharts(payload.healthCharts)
        setFinanceMetrics(payload.financeMetrics)
        setFinanceCurrency(payload.financeCurrency)
        setAccounts(payload.accounts)
        setRecentTransactions(payload.recentTransactions)
        setIncomeHistory(payload.incomeHistory)
        setExpenseHistory(payload.expenseHistory)
        setExpensesByCategory(payload.expensesByCategory)
        setDailySpending(payload.dailySpending)
        setHealthStatus(payload.meta.health)
        setWalletStatus(payload.meta.wallet)
        setIsUsingMockData(payload.meta.usingMockData)
        setError(payload.meta.errors[0] ?? null)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error fetching API data"
        setError(errorMsg)
        console.error("[v0] useApiData error:", errorMsg)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [config.healthConnectUrl, config.healthConnectToken, config.walletApiToken])

  return {
    healthMetrics,
    healthCharts,
    financeMetrics,
    financeCurrency,
    accounts,
    recentTransactions,
    incomeHistory,
    expenseHistory,
    expensesByCategory,
    dailySpending,
    healthStatus,
    walletStatus,
    isUsingMockData,
    isLoading,
    error,
  }
}
