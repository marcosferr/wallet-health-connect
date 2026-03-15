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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "./stat-card"
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

const COLORS = ["#00d4ff", "#00a8cc", "#0088a8", "#66e5ff", "#00b8d9", "#005f7a"]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value)

const getAccountIcon = (type: string) => {
  switch (type) {
    case "bank":
      return Building2
    case "savings":
      return PiggyBank
    case "cash":
      return Banknote
    default:
      return CreditCard
  }
}

export function FinanceSection({
  metrics,
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
        <StatCard
          title="Balance Total"
          value={formatCurrency(metrics.totalBalance)}
          icon={Wallet}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Ingresos Mensuales"
          value={formatCurrency(metrics.monthlyIncome)}
          icon={TrendingUp}
          iconColor="text-success"
        />
        <StatCard
          title="Gastos Mensuales"
          value={formatCurrency(metrics.monthlyExpenses)}
          icon={TrendingDown}
          iconColor="text-destructive"
        />
        <StatCard
          title="Ahorro Mensual"
          value={formatCurrency(metrics.savings)}
          icon={PiggyBank}
          subtitle={`${savingsRate}% de tus ingresos`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Income vs Expenses Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Ingresos vs Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a8cc" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00a8cc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "income" ? "Ingresos" : "Gastos",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#00a8cc"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#00d4ff]" />
                <span className="text-xs text-muted-foreground">Ingresos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#00a8cc]" />
                <span className="text-xs text-muted-foreground">Gastos</span>
              </div>
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
              <span className="text-lg font-bold text-primary">
                {formatCurrency(metrics.monthlyExpenses)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-[180px] w-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.expenses}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {chartData.expenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#252b3d",
                        border: "1px solid #3d4559",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Gasto"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {chartData.expenses.slice(0, 5).map((cat, index) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{cat.category}</span>
                    </div>
                    <span className="font-medium text-foreground">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Rings Section */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Indicadores Financieros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-around gap-6 py-4">
            <ScoreRing
              value={savingsRate}
              label="Tasa Ahorro"
              size={90}
              strokeWidth={6}
            />
            <ScoreRing
              value={budgetUsedPercent}
              label="Presupuesto"
              size={90}
              strokeWidth={6}
            />
            <ScoreRing
              value={85}
              label="Salud Fin."
              size={90}
              strokeWidth={6}
            />
            <ScoreRing
              value={92}
              label="Metas"
              size={90}
              strokeWidth={6}
            />
            <ScoreRing
              value={78}
              label="Eficiencia"
              size={90}
              strokeWidth={6}
            />
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
              {accounts.map((account) => {
                const Icon = getAccountIcon(account.type)
                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{account.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(account.balance)}
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
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        tx.type === "income"
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.payee}</p>
                      <p className="text-xs text-muted-foreground">{tx.note}</p>
                    </div>
                  </div>
                  <span
                    className={`font-bold ${
                      tx.type === "income" ? "text-success" : "text-foreground"
                    }`}
                  >
                    {tx.type === "income" ? "+" : ""}
                    {formatCurrency(tx.amount)}
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
