import type {
  HealthMetrics,
  FinanceMetrics,
  ChartDataPoint,
  ExpenseByCategory,
  WalletRecord,
  WalletAccount,
} from "./types"

// Static last-7-days labels (no Date() at module level to avoid hydration mismatch)
const last7Days = ["Lun 9", "Mar 10", "Mié 11", "Jue 12", "Vie 13", "Sáb 14", "Dom 15"]

// Mock Health Data
export const mockHealthMetrics: HealthMetrics = {
  steps: 8432,
  stepsGoal: 10000,
  calories: 2150,
  caloriesGoal: 2500,
  heartRate: 72,
  sleep: 7.2,
  sleepGoal: 8,
  distance: 5.8,
  weight: 72.5,
  activeMinutes: 45,
}

export const mockStepsHistory: ChartDataPoint[] = [
  { date: "Lun 9",  value: 9120, label: "pasos" },
  { date: "Mar 10", value: 7340, label: "pasos" },
  { date: "Mié 11", value: 11200, label: "pasos" },
  { date: "Jue 12", value: 6890, label: "pasos" },
  { date: "Vie 13", value: 8432, label: "pasos" },
  { date: "Sáb 14", value: 10500, label: "pasos" },
  { date: "Dom 15", value: 7800, label: "pasos" },
]

export const mockCaloriesHistory: ChartDataPoint[] = [
  { date: "Lun 9",  value: 2100, label: "kcal" },
  { date: "Mar 10", value: 1950, label: "kcal" },
  { date: "Mié 11", value: 2350, label: "kcal" },
  { date: "Jue 12", value: 1870, label: "kcal" },
  { date: "Vie 13", value: 2150, label: "kcal" },
  { date: "Sáb 14", value: 2480, label: "kcal" },
  { date: "Dom 15", value: 2020, label: "kcal" },
]

export const mockHeartRateHistory: ChartDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
  date: `${i.toString().padStart(2, "0")}:00`,
  value: [62,60,58,57,58,60,65,72,75,78,76,74,73,75,77,76,74,72,70,69,68,67,65,64][i],
  label: "bpm",
}))

export const mockSleepHistory: ChartDataPoint[] = [
  { date: "Lun 9",  value: 7.5, label: "horas" },
  { date: "Mar 10", value: 6.8, label: "horas" },
  { date: "Mié 11", value: 8.1, label: "horas" },
  { date: "Jue 12", value: 6.5, label: "horas" },
  { date: "Vie 13", value: 7.2, label: "horas" },
  { date: "Sáb 14", value: 8.5, label: "horas" },
  { date: "Dom 15", value: 7.9, label: "horas" },
]

export const mockWeightHistory: ChartDataPoint[] = [
  { date: "14 Feb", value: 73.5, label: "kg" },
  { date: "21 Feb", value: 73.2, label: "kg" },
  { date: "28 Feb", value: 73.0, label: "kg" },
  { date: "7 Mar",  value: 72.8, label: "kg" },
  { date: "14 Mar", value: 72.5, label: "kg" },
]

// Mock Finance Data
export const mockFinanceMetrics: FinanceMetrics = {
  totalBalance: 12458.32,
  monthlyIncome: 4500.0,
  monthlyExpenses: 2847.65,
  savings: 1652.35,
  budgetUsed: 2847.65,
  budgetTotal: 3500.0,
}

export const mockExpensesByCategory: ExpenseByCategory[] = [
  { category: "Alimentación", amount: 650, color: "var(--chart-1)", percentage: 22.8 },
  { category: "Transporte", amount: 320, color: "var(--chart-2)", percentage: 11.2 },
  { category: "Entretenimiento", amount: 280, color: "var(--chart-3)", percentage: 9.8 },
  { category: "Servicios", amount: 450, color: "var(--chart-4)", percentage: 15.8 },
  { category: "Compras", amount: 520, color: "var(--chart-5)", percentage: 18.3 },
  { category: "Otros", amount: 627.65, color: "var(--muted-foreground)", percentage: 22.1 },
]

export const mockIncomeHistory: ChartDataPoint[] = [
  { date: "Ene", value: 4200, label: "€" },
  { date: "Feb", value: 4350, label: "€" },
  { date: "Mar", value: 4500, label: "€" },
  { date: "Abr", value: 4500, label: "€" },
  { date: "May", value: 4800, label: "€" },
  { date: "Jun", value: 4500, label: "€" },
]

export const mockExpenseHistory: ChartDataPoint[] = [
  { date: "Ene", value: 2800, label: "€" },
  { date: "Feb", value: 3100, label: "€" },
  { date: "Mar", value: 2650, label: "€" },
  { date: "Abr", value: 2900, label: "€" },
  { date: "May", value: 3200, label: "€" },
  { date: "Jun", value: 2847, label: "€" },
]

export const mockAccounts: WalletAccount[] = [
  { id: "1", name: "Cuenta Principal", currency: "EUR", balance: 8234.56, type: "bank" },
  { id: "2", name: "Ahorros", currency: "EUR", balance: 3500.0, type: "savings" },
  { id: "3", name: "Efectivo", currency: "EUR", balance: 723.76, type: "cash" },
]

export const mockRecentTransactions: WalletRecord[] = [
  {
    id: "1",
    amount: -45.99,
    currency: "EUR",
    categoryId: "food",
    accountId: "1",
    recordDate: "2026-03-15T10:30:00.000Z",
    note: "Compras supermercado",
    payee: "Mercadona",
    type: "expense",
  },
  {
    id: "2",
    amount: -32.0,
    currency: "EUR",
    categoryId: "transport",
    accountId: "1",
    recordDate: "2026-03-14T09:15:00.000Z",
    note: "Gasolina",
    payee: "Repsol",
    type: "expense",
  },
  {
    id: "3",
    amount: 4500.0,
    currency: "EUR",
    categoryId: "salary",
    accountId: "1",
    recordDate: "2026-03-13T08:00:00.000Z",
    note: "Nómina Marzo",
    payee: "Empresa ABC",
    type: "income",
  },
  {
    id: "4",
    amount: -89.0,
    currency: "EUR",
    categoryId: "services",
    accountId: "1",
    recordDate: "2026-03-12T11:00:00.000Z",
    note: "Factura electricidad",
    payee: "Iberdrola",
    type: "expense",
  },
  {
    id: "5",
    amount: -28.5,
    currency: "EUR",
    categoryId: "entertainment",
    accountId: "1",
    recordDate: "2026-03-11T20:00:00.000Z",
    note: "Netflix + Spotify",
    payee: "Suscripciones",
    type: "expense",
  },
]

export const mockDailySpending: ChartDataPoint[] = [
  { date: "Lun 9",  value: 45,  label: "€" },
  { date: "Mar 10", value: 120, label: "€" },
  { date: "Mié 11", value: 38,  label: "€" },
  { date: "Jue 12", value: 95,  label: "€" },
  { date: "Vie 13", value: 67,  label: "€" },
  { date: "Sáb 14", value: 142, label: "€" },
  { date: "Dom 15", value: 55,  label: "€" },
]
