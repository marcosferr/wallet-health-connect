"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"

interface FinanceOverviewProps {
  monthlyData: Array<{
    month: string
    ingresos: number
    gastos: number
  }>
  expenseCategories: Array<{
    name: string
    value: number
    color: string
  }>
  summary: {
    balance: number
    income: number
    expenses: number
    savings: number
  }
}

export function FinanceOverview({ monthlyData, expenseCategories, summary }: FinanceOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Finance Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Balance Total
              </p>
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{formatCurrency(summary.balance)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Todas las cuentas</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ingresos
              </p>
              <TrendingUp className="h-5 w-5 text-chart-3" />
            </div>
            <p className="mt-3 text-2xl font-bold text-chart-3">{formatCurrency(summary.income)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Gastos
              </p>
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <p className="mt-3 text-2xl font-bold text-destructive">{formatCurrency(summary.expenses)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ahorro
              </p>
              <PiggyBank className="h-5 w-5 text-warning" />
            </div>
            <p className="mt-3 text-2xl font-bold text-warning">{formatCurrency(summary.savings)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Income vs Expenses Chart */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Ingresos vs Gastos
            </CardTitle>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #1e3a5f",
                      borderRadius: "8px",
                      color: "#f0f4f8",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    labelStyle={{ color: "#f0f4f8" }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingBottom: "20px" }}
                    formatter={(value) => (
                      <span style={{ color: "#f0f4f8", fontSize: "12px", marginLeft: "4px" }}>
                        {value}
                      </span>
                    )}
                  />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Distribución de gastos
            </CardTitle>
            <p className="text-sm text-muted-foreground">Por categoría</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #1e3a5f",
                      borderRadius: "8px",
                      color: "#f0f4f8",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {expenseCategories.slice(0, 4).map((category) => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-muted-foreground">{category.name}</span>
                  </div>
                  <span className="text-foreground">{formatCurrency(category.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
