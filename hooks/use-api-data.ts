import { useEffect, useState } from "react"
import { HealthConnectService, WalletService } from "@/lib/api-services"
import type { ApiConfig, ChartDataPoint, ExpenseByCategory } from "@/lib/types"
import {
  mockHealthMetrics,
  mockFinanceMetrics,
  mockRecentTransactions,
  mockAccounts,
  mockIncomeHistory,
  mockExpenseHistory,
  mockExpensesByCategory,
  mockDailySpending,
} from "@/lib/mock-data"
import type { WalletRecord, WalletAccount } from "@/lib/types"

interface UseApiDataResult {
  healthMetrics: typeof mockHealthMetrics
  financeMetrics: typeof mockFinanceMetrics
  accounts: WalletAccount[]
  recentTransactions: WalletRecord[]
  incomeHistory: ChartDataPoint[]
  expenseHistory: ChartDataPoint[]
  expensesByCategory: ExpenseByCategory[]
  dailySpending: ChartDataPoint[]
  isLoading: boolean
  error: string | null
}

/** Aggregate wallet records into monthly income/expense chart data (last 6 months) */
function buildMonthlyHistory(
  records: WalletRecord[],
  type: "income" | "expense"
): ChartDataPoint[] {
  const months: Record<string, number> = {}
  const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  // Build last 6 months
  const now = new Date()
  const keys: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    keys.push(key)
    months[key] = 0
  }

  records
    .filter((r) => r.type === type)
    .forEach((r) => {
      const d = new Date(r.recordDate)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (key in months) {
        months[key] += Math.abs(r.amount)
      }
    })

  return keys.map((key) => {
    const [year, month] = key.split("-").map(Number)
    return {
      date: monthLabels[month],
      value: Math.round(months[key]),
      label: "€",
    }
  })
}

/** Aggregate wallet records into expense-by-category */
function buildExpensesByCategory(records: WalletRecord[]): ExpenseByCategory[] {
  const cats: Record<string, number> = {}
  const total = records
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => {
      cats[r.categoryId] = (cats[r.categoryId] || 0) + Math.abs(r.amount)
      return sum + Math.abs(r.amount)
    }, 0)

  if (total === 0) return mockExpensesByCategory

  return Object.entries(cats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
      color: "var(--chart-1)",
      percentage: Math.round((amount / total) * 100),
    }))
}

/** Build daily spending for last 7 days */
function buildDailySpending(records: WalletRecord[]): ChartDataPoint[] {
  const days: Record<string, number> = {}
  const dayLabels: string[] = []
  const dayKeys: string[] = []
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split("T")[0]
    const label = `${dayNames[d.getDay()]} ${d.getDate()}`
    dayKeys.push(key)
    dayLabels.push(label)
    days[key] = 0
  }

  records
    .filter((r) => r.type === "expense")
    .forEach((r) => {
      const key = r.recordDate.split("T")[0]
      if (key in days) {
        days[key] += Math.abs(r.amount)
      }
    })

  return dayKeys.map((key, i) => ({
    date: dayLabels[i],
    value: Math.round(days[key]),
    label: "€",
  }))
}

export function useApiData(config: ApiConfig): UseApiDataResult {
  const [healthMetrics, setHealthMetrics] = useState(mockHealthMetrics)
  const [financeMetrics, setFinanceMetrics] = useState(mockFinanceMetrics)
  const [accounts, setAccounts] = useState<WalletAccount[]>(mockAccounts)
  const [recentTransactions, setRecentTransactions] = useState<WalletRecord[]>(mockRecentTransactions)
  const [incomeHistory, setIncomeHistory] = useState<ChartDataPoint[]>(mockIncomeHistory)
  const [expenseHistory, setExpenseHistory] = useState<ChartDataPoint[]>(mockExpenseHistory)
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>(mockExpensesByCategory)
  const [dailySpending, setDailySpending] = useState<ChartDataPoint[]>(mockDailySpending)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!config.healthConnectUrl && !config.walletApiToken) {
        // Reset to mock data
        setHealthMetrics(mockHealthMetrics)
        setFinanceMetrics(mockFinanceMetrics)
        setAccounts(mockAccounts)
        setRecentTransactions(mockRecentTransactions)
        setIncomeHistory(mockIncomeHistory)
        setExpenseHistory(mockExpenseHistory)
        setExpensesByCategory(mockExpensesByCategory)
        setDailySpending(mockDailySpending)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Fetch health data if configured
        if (config.healthConnectUrl && config.healthConnectToken) {
          const healthService = new HealthConnectService(
            config.healthConnectUrl,
            config.healthConnectToken
          )
          const health = await healthService.getAllMetrics()
          setHealthMetrics(health)
        }

        // Fetch finance data if configured
        if (config.walletApiToken) {
          const walletService = new WalletService(config.walletApiToken)

          // Fetch accounts and all records in parallel
          const [accs, allRecords] = await Promise.all([
            walletService.getAccounts(),
            walletService.getRecords({ limit: 500 }),
          ])

          // Compute finance metrics from real records
          const totalBalance = accs.reduce((sum, a) => sum + a.balance, 0)
          const monthlyIncome = allRecords
            .filter((r) => {
              const d = new Date(r.recordDate)
              const now = new Date()
              return r.type === "income" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            })
            .reduce((sum, r) => sum + Math.abs(r.amount), 0)
          const monthlyExpenses = allRecords
            .filter((r) => {
              const d = new Date(r.recordDate)
              const now = new Date()
              return r.type === "expense" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            })
            .reduce((sum, r) => sum + Math.abs(r.amount), 0)

          setFinanceMetrics({
            totalBalance,
            monthlyIncome,
            monthlyExpenses,
            savings: monthlyIncome - monthlyExpenses,
            budgetUsed: monthlyExpenses,
            budgetTotal: mockFinanceMetrics.budgetTotal,
          })
          setAccounts(accs)
          // Most recent 20 transactions
          setRecentTransactions(
            [...allRecords]
              .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
              .slice(0, 20)
          )
          setIncomeHistory(buildMonthlyHistory(allRecords, "income"))
          setExpenseHistory(buildMonthlyHistory(allRecords, "expense"))
          setExpensesByCategory(buildExpensesByCategory(allRecords))
          setDailySpending(buildDailySpending(allRecords))
        }
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
    financeMetrics,
    accounts,
    recentTransactions,
    incomeHistory,
    expenseHistory,
    expensesByCategory,
    dailySpending,
    isLoading,
    error,
  }
}
