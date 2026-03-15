"use client"

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "./metric-card"
import type { FinanceMetrics, ChartDataPoint, ExpenseByCategory, WalletRecord, WalletAccount } from "@/lib/types"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value)

export function FinanceSection({
  metrics,
  chartData,
  accounts,
  recentTransactions,
  isLoading,
}: FinanceSectionProps) {
  const combinedData = chartData.income.map((inc, i) => ({
    date: inc.date,
    income: inc.value,
    expenses: chartData.expenseHistory[i]?.value || 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">Finanzas Personales</h2>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Balance total"
          value={formatCurrency(metrics.totalBalance)}
          icon={<Wallet className="h-4 w-4" />}
          trend={{ value: 5.2, label: "vs mes anterior" }}
        />
        <MetricCard
          title="Ingresos"
          value={formatCurrency(metrics.monthlyIncome)}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: 3.5, label: "vs mes anterior" }}
        />
        <MetricCard
          title="Gastos"
          value={formatCurrency(metrics.monthlyExpenses)}
          icon={<TrendingDown className="h-4 w-4" />}
          trend={{ value: -8, label: "vs mes anterior" }}
        />
        <MetricCard
          title="Ahorro"
          value={formatCurrency(metrics.savings)}
          icon={<PiggyBank className="h-4 w-4" />}
          trend={{ value: 15, label: "vs mes anterior" }}
        />
        <MetricCard
          title="Presupuesto"
          value={formatCurrency(metrics.budgetUsed)}
          icon={<CreditCard className="h-4 w-4" />}
          progress={{ current: metrics.budgetUsed, max: metrics.budgetTotal }}
          accentColor="var(--accent)"
        />
        <MetricCard
          title="Tasa de ahorro"
          value={`${((metrics.savings / metrics.monthlyIncome) * 100).toFixed(1)}%`}
          icon={<PiggyBank className="h-4 w-4" />}
          trend={{ value: 2, label: "vs mes anterior" }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Income vs Expenses Chart */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos vs Gastos - Últimos 6 meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={combinedData}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "income" ? "Ingresos" : "Gastos",
                  ]}
                />
                <Bar dataKey="income" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-xs text-muted-foreground">Ingresos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-accent" />
                <span className="text-xs text-muted-foreground">Gastos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={chartData.expenses}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                >
                  {chartData.expenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Gasto"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {chartData.expenses.slice(0, 4).map((exp) => (
                <div key={exp.category} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: exp.color }} />
                  <span className="text-xs text-muted-foreground truncate">{exp.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts and Transactions */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Accounts */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Mis Cuentas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{account.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(account.balance)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Transacciones recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      transaction.type === "income" ? "bg-primary/20" : "bg-accent/20"
                    )}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{transaction.payee}</p>
                    <p className="text-xs text-muted-foreground">{transaction.note}</p>
                  </div>
                </div>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    transaction.type === "income" ? "text-primary" : "text-foreground"
                  )}
                >
                  {transaction.type === "income" ? "+" : ""}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
