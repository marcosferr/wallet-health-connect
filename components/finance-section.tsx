"use client"

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Banknote,
  CreditCard,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Zap,
  Heart,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreRing } from "./score-ring"
import type { FinanceMetrics, ChartDataPoint, ExpenseByCategory, WalletRecord, WalletAccount } from "@/lib/types"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

interface FinanceSectionProps {
  metrics: FinanceMetrics
  currency?: string
  chartData: {
    expenses: ExpenseByCategory[]
    income: ChartDataPoint[]
    expenseHistory: ChartDataPoint[]
    dailySpending: ChartDataPoint[]
  }
  accounts: WalletAccount[]
  recentTransactions: WalletRecord[]
  isLoading?: boolean
}

// Vibrant, distinct colors per expense category
const CATEGORY_COLORS = [
  "#f97316", // orange  — Alimentación
  "#ef4444", // red     — Vivienda
  "#a78bfa", // purple  — Transporte
  "#22c55e", // green   — Entretenimiento
  "#00d4ff", // cyan    — Salud
  "#f59e0b", // amber   — Servicios
  "#ec4899", // pink    — Ropa
  "#34d399", // teal    — Otros
]

const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase()
  if (lower.includes("aliment") || lower.includes("comida") || lower.includes("restaur")) return Utensils
  if (lower.includes("vivien") || lower.includes("alquil") || lower.includes("casa")) return Home
  if (lower.includes("transp") || lower.includes("coche") || lower.includes("gasolina")) return Car
  if (lower.includes("salud") || lower.includes("médic") || lower.includes("farmac")) return Heart
  if (lower.includes("luz") || lower.includes("gas") || lower.includes("servic")) return Zap
  return ShoppingCart
}

const getAccountIcon = (type: string) => {
  switch (type) {
    case "bank": return Building2
    case "savings": return PiggyBank
    case "cash": return Banknote
    default: return CreditCard
  }
}

const formatCurrency = (value: number, currency = "EUR") => {
  const normalizedCurrency = currency.toUpperCase()
  const locale = normalizedCurrency === "PYG" ? "es-PY" : "es-ES"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: normalizedCurrency,
    currencyDisplay: normalizedCurrency === "PYG" ? "narrowSymbol" : "symbol",
    minimumFractionDigits: normalizedCurrency === "PYG" ? 0 : 2,
    maximumFractionDigits: normalizedCurrency === "PYG" ? 0 : 2,
  }).format(value)
}

// Custom tooltip for the area chart
const FinanceTooltip = ({ active, payload, label, currency = "EUR" }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-medium" style={{ color: p.color }}>
          {p.dataKey === "income" ? "Ingresos" : "Gastos"}: {formatCurrency(p.value, currency)}
        </p>
      ))}
    </div>
  )
}

export function FinanceSection({
  metrics,
  currency = "EUR",
  chartData,
  accounts,
  recentTransactions,
  isLoading,
}: FinanceSectionProps) {
  const savingsRate = Math.round((metrics.savings / metrics.monthlyIncome) * 100)
  const budgetUsedPercent = Math.round((metrics.budgetUsed / metrics.budgetTotal) * 100)

  const combinedData = chartData.income.map((inc, i) => ({
    date: inc.date,
    income: inc.value,
    expenses: chartData.expenseHistory[i]?.value || 0,
  }))

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Balance */}
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Balance Total</p>
              <Wallet className="h-5 w-5" style={{ color: "#00d4ff" }} />
            </div>
            <p className="mt-3 text-3xl font-bold" style={{ color: "#00d4ff" }}>
              {formatCurrency(metrics.totalBalance, currency)}
            </p>
            <p className="mt-1 text-sm text-income">+12% este mes</p>
          </CardContent>
        </Card>

        {/* Ingresos — green */}
        <Card className="border-border bg-card" style={{ borderLeftWidth: 3, borderLeftColor: "#22c55e" }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ingresos</p>
              <TrendingUp className="h-5 w-5 text-income" />
            </div>
            <p className="mt-3 text-3xl font-bold text-income">
              {formatCurrency(metrics.monthlyIncome, currency)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        {/* Gastos — red */}
        <Card className="border-border bg-card" style={{ borderLeftWidth: 3, borderLeftColor: "#ef4444" }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Gastos</p>
              <TrendingDown className="h-5 w-5 text-expense" />
            </div>
            <p className="mt-3 text-3xl font-bold text-expense">
              {formatCurrency(metrics.monthlyExpenses, currency)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        {/* Ahorro */}
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ahorro</p>
              <PiggyBank className="h-5 w-5 text-income" />
            </div>
            <p className="mt-3 text-3xl font-bold text-income">
              {formatCurrency(metrics.savings, currency)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{savingsRate}% de ingresos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Income vs Expenses Chart — green vs red */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Ingresos vs Gastos
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-income" />
                  <span className="text-xs text-income font-medium">Ingresos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-expense" />
                  <span className="text-xs text-expense font-medium">Gastos</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                  <defs>
                    <linearGradient id="incomeGradFin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradFin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<FinanceTooltip currency={currency} />} />
                  <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2.5} fill="url(#incomeGradFin)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} fill="url(#expenseGradFin)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category Pie Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Gastos por Categoria
              </CardTitle>
              <span className="text-lg font-bold text-expense">
                {formatCurrency(metrics.monthlyExpenses, currency)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-[190px] w-[190px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.expenses} cx="50%" cy="50%" innerRadius={52} outerRadius={85} paddingAngle={3} dataKey="amount">
                      {chartData.expenses.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--foreground)" }}
                      formatter={(value: number) => [formatCurrency(value, currency), "Gasto"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {chartData.expenses.slice(0, 6).map((cat, index) => {
                  const CatIcon = getCategoryIcon(cat.category)
                  const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                  return (
                    <div key={cat.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: color + "25" }}>
                          <CatIcon className="h-3.5 w-3.5" style={{ color }} />
                        </div>
                        <span className="text-muted-foreground">{cat.category}</span>
                      </div>
                      <span className="font-bold" style={{ color }}>{formatCurrency(cat.amount, currency)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Rings — each with a distinct color */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Indicadores Financieros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-around gap-6 py-4">
            <ScoreRing value={savingsRate} label="Tasa Ahorro" size={90} strokeWidth={6} color="#22c55e" />
            <ScoreRing value={budgetUsedPercent} label="Presupuesto" size={90} strokeWidth={6} color="#ef4444" />
            <ScoreRing value={85} label="Salud Fin." size={90} strokeWidth={6} color="#00d4ff" />
            <ScoreRing value={92} label="Metas" size={90} strokeWidth={6} color="#f59e0b" />
            <ScoreRing value={78} label="Eficiencia" size={90} strokeWidth={6} color="#a78bfa" />
          </div>
        </CardContent>
      </Card>

      {/* Accounts and Transactions */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Accounts */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Cuentas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accounts.map((account, index) => {
                const Icon = getAccountIcon(account.type)
                const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                return (
                  <div key={account.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: color + "25" }}>
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{account.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold" style={{ color: "#00d4ff" }}>
                      {formatCurrency(account.balance, account.currency)}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Transacciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: tx.type === "income" ? "#22c55e25" : "#ef444425",
                      }}
                    >
                      {tx.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 text-income" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-expense" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.payee}</p>
                      <p className="text-xs text-muted-foreground">{tx.note}</p>
                    </div>
                  </div>
                  <span
                    className="font-bold"
                    style={{ color: tx.type === "income" ? "#22c55e" : "#ef4444" }}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(Math.abs(tx.amount), tx.currency)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
