import type { HealthDataPoint, HealthMetrics, FinanceMetrics, WalletRecord, WalletAccount } from "./types"
import {
  mockHealthMetrics,
  mockFinanceMetrics,
  mockRecentTransactions,
  mockAccounts,
  mockStepsHistory,
  mockCaloriesHistory,
  mockHeartRateHistory,
  mockSleepHistory,
  mockWeightHistory,
  mockExpensesByCategory,
  mockIncomeHistory,
  mockExpenseHistory,
  mockDailySpending,
} from "./mock-data"

// Health Connect Gateway API Service
export class HealthConnectService {
  private baseUrl: string
  private token: string | null

  constructor(baseUrl?: string, token?: string) {
    this.baseUrl = baseUrl || ""
    this.token = token || null
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.token)
  }

  async fetchData<T>(method: string, queries?: Record<string, unknown>): Promise<HealthDataPoint[]> {
    if (!this.isConfigured()) {
      throw new Error("Health Connect not configured")
    }

    const response = await fetch(`${this.baseUrl}/api/v2/fetch/${method}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ queries }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${method}`)
    }

    return response.json()
  }

  async getSteps(startDate?: Date, endDate?: Date): Promise<number> {
    try {
      const data = await this.fetchData("steps", {
        start: startDate ? { $gte: startDate.toISOString() } : undefined,
        end: endDate ? { $lte: endDate.toISOString() } : undefined,
      })
      return data.reduce((total, item) => {
        const stepData = item.data as { count?: number }
        return total + (stepData.count || 0)
      }, 0)
    } catch {
      return mockHealthMetrics.steps
    }
  }

  async getHeartRate(): Promise<number> {
    try {
      const data = await this.fetchData("heartRate")
      if (data.length > 0) {
        const hrData = data[data.length - 1].data as { bpm?: number }
        return hrData.bpm || mockHealthMetrics.heartRate
      }
      return mockHealthMetrics.heartRate
    } catch {
      return mockHealthMetrics.heartRate
    }
  }

  async getSleep(): Promise<number> {
    try {
      const data = await this.fetchData("sleepSession")
      if (data.length > 0) {
        const lastSleep = data[data.length - 1]
        if (lastSleep.end) {
          const start = new Date(lastSleep.start)
          const end = new Date(lastSleep.end)
          return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        }
      }
      return mockHealthMetrics.sleep
    } catch {
      return mockHealthMetrics.sleep
    }
  }

  async getCalories(): Promise<number> {
    try {
      const data = await this.fetchData("totalCaloriesBurned")
      return data.reduce((total, item) => {
        const calData = item.data as { energy?: { inKilocalories?: number } }
        return total + (calData.energy?.inKilocalories || 0)
      }, 0)
    } catch {
      return mockHealthMetrics.calories
    }
  }

  async getWeight(): Promise<number> {
    try {
      const data = await this.fetchData("weight")
      if (data.length > 0) {
        const weightData = data[data.length - 1].data as { weight?: { inKilograms?: number } }
        return weightData.weight?.inKilograms || mockHealthMetrics.weight
      }
      return mockHealthMetrics.weight
    } catch {
      return mockHealthMetrics.weight
    }
  }

  async getDistance(): Promise<number> {
    try {
      const data = await this.fetchData("distance")
      return data.reduce((total, item) => {
        const distData = item.data as { distance?: { inKilometers?: number } }
        return total + (distData.distance?.inKilometers || 0)
      }, 0)
    } catch {
      return mockHealthMetrics.distance
    }
  }

  async getAllMetrics(): Promise<HealthMetrics> {
    if (!this.isConfigured()) {
      return mockHealthMetrics
    }

    const [steps, heartRate, sleep, calories, weight, distance] = await Promise.all([
      this.getSteps(),
      this.getHeartRate(),
      this.getSleep(),
      this.getCalories(),
      this.getWeight(),
      this.getDistance(),
    ])

    return {
      steps,
      stepsGoal: 10000,
      calories,
      caloriesGoal: 2500,
      heartRate,
      sleep,
      sleepGoal: 8,
      distance,
      weight,
      activeMinutes: mockHealthMetrics.activeMinutes,
    }
  }
}

// Wallet API Service
export class WalletService {
  private baseUrl = "https://rest.budgetbakers.com/wallet"
  private token: string | null

  constructor(token?: string) {
    this.token = token || null
  }

  isConfigured(): boolean {
    return Boolean(this.token)
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error("Wallet API not configured")
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Wallet API error: ${response.status}`)
    }

    return response.json()
  }

  async getAccounts(): Promise<WalletAccount[]> {
    try {
      return await this.fetch<WalletAccount[]>("/accounts")
    } catch {
      return mockAccounts
    }
  }

  async getRecords(filters?: {
    startDate?: string
    endDate?: string
    type?: string
    limit?: number
  }): Promise<WalletRecord[]> {
    try {
      const params: Record<string, string> = {}
      if (filters?.startDate) params.recordDate = `gte.${filters.startDate}`
      if (filters?.endDate) params.recordDate = `lte.${filters.endDate}`
      if (filters?.type) params.type = filters.type
      if (filters?.limit) params.limit = filters.limit.toString()

      return await this.fetch<WalletRecord[]>("/records", params)
    } catch {
      return mockRecentTransactions
    }
  }

  async getFinanceMetrics(): Promise<FinanceMetrics> {
    if (!this.isConfigured()) {
      return mockFinanceMetrics
    }

    try {
      const [accounts, records] = await Promise.all([this.getAccounts(), this.getRecords({ limit: 200 })])

      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
      const monthlyIncome = records
        .filter((r) => r.type === "income")
        .reduce((sum, r) => sum + Math.abs(r.amount), 0)
      const monthlyExpenses = records
        .filter((r) => r.type === "expense")
        .reduce((sum, r) => sum + Math.abs(r.amount), 0)

      return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savings: monthlyIncome - monthlyExpenses,
        budgetUsed: monthlyExpenses,
        budgetTotal: 3500,
      }
    } catch {
      return mockFinanceMetrics
    }
  }
}

// Export mock data for charts
export const getHealthChartData = () => ({
  steps: mockStepsHistory,
  calories: mockCaloriesHistory,
  heartRate: mockHeartRateHistory,
  sleep: mockSleepHistory,
  weight: mockWeightHistory,
})

export const getFinanceChartData = () => ({
  expenses: mockExpensesByCategory,
  income: mockIncomeHistory,
  expenseHistory: mockExpenseHistory,
  dailySpending: mockDailySpending,
})
