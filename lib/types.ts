// Health Connect Gateway Types
export interface HealthConnectToken {
  token: string
  refresh: string
  expiry: string
}

export interface HealthDataPoint {
  _id: string
  data: Record<string, unknown>
  id: string
  start: string
  end?: string
  app: string
}

export interface StepsData {
  count: number
}

export interface HeartRateData {
  bpm: number
}

export interface SleepSessionData {
  stages: Array<{
    stage: string
    startTime: string
    endTime: string
  }>
}

export interface CaloriesData {
  energy: {
    inKilocalories: number
  }
}

export interface WeightData {
  weight: {
    inKilograms: number
  }
}

export interface DistanceData {
  distance: {
    inKilometers: number
  }
}

// Wallet API Types
export interface WalletRecord {
  id: string
  amount: number
  currency: string
  categoryId: string
  accountId: string
  recordDate: string
  note?: string
  payee?: string
  type: 'expense' | 'income' | 'transfer'
}

export interface WalletAccount {
  id: string
  name: string
  currency: string
  balance: number
  type: string
}

export interface WalletCategory {
  id: string
  name: string
  color: string
  icon?: string
  type: 'expense' | 'income'
}

export interface WalletBudget {
  id: string
  name: string
  amount: number
  spent: number
  categoryId: string
  period: 'monthly' | 'weekly' | 'yearly'
}

// Dashboard Types
export interface HealthMetrics {
  steps: number
  stepsGoal: number
  calories: number
  caloriesGoal: number
  heartRate: number
  sleep: number
  sleepGoal: number
  distance: number
  weight: number
  activeMinutes: number
}

export interface FinanceMetrics {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savings: number
  budgetUsed: number
  budgetTotal: number
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface ExpenseByCategory {
  category: string
  amount: number
  color: string
  percentage: number
}

export interface ApiConfig {
  healthConnectUrl?: string
  healthConnectToken?: string
  walletApiToken?: string
}
