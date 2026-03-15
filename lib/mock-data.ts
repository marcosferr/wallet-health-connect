import type {
  HealthMetrics,
  FinanceMetrics,
  ChartDataPoint,
  ExpenseByCategory,
  WalletRecord,
  WalletAccount,
} from "./types"

// Generate dates for the last 7 days
const getLast7Days = () => {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }))
  }
  return days
}

const last7Days = getLast7Days()

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

export const mockStepsHistory: ChartDataPoint[] = last7Days.map((date, i) => ({
  date,
  value: Math.floor(6000 + Math.random() * 6000),
  label: "pasos",
}))

export const mockCaloriesHistory: ChartDataPoint[] = last7Days.map((date, i) => ({
  date,
  value: Math.floor(1800 + Math.random() * 900),
  label: "kcal",
}))

export const mockHeartRateHistory: ChartDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
  date: `${i.toString().padStart(2, "0")}:00`,
  value: Math.floor(60 + Math.random() * 40),
  label: "bpm",
}))

export const mockSleepHistory: ChartDataPoint[] = last7Days.map((date, i) => ({
  date,
  value: Number((5.5 + Math.random() * 3).toFixed(1)),
  label: "horas",
}))

export const mockWeightHistory: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  return {
    date: date.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
    value: Number((73 - i * 0.02 + Math.random() * 0.5).toFixed(1)),
    label: "kg",
  }
})

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
    recordDate: new Date().toISOString(),
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
    recordDate: new Date(Date.now() - 86400000).toISOString(),
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
    recordDate: new Date(Date.now() - 86400000 * 2).toISOString(),
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
    recordDate: new Date(Date.now() - 86400000 * 3).toISOString(),
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
    recordDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    note: "Netflix + Spotify",
    payee: "Suscripciones",
    type: "expense",
  },
]

export const mockDailySpending: ChartDataPoint[] = last7Days.map((date) => ({
  date,
  value: Math.floor(30 + Math.random() * 120),
  label: "€",
}))
