"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface EvolutionChartProps {
  data: Array<{
    day: string
    foco: number
    energia: number
    sistema: number
  }>
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Evolución del sistema
        </CardTitle>
        <p className="text-sm text-muted-foreground">Evolución diaria</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #1e3a5f",
                  borderRadius: "8px",
                  color: "#f0f4f8",
                }}
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
              <Line
                type="monotone"
                dataKey="foco"
                name="Foco"
                stroke="#00d4aa"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#00d4aa" }}
              />
              <Line
                type="monotone"
                dataKey="energia"
                name="Energía"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#22c55e" }}
              />
              <Line
                type="monotone"
                dataKey="sistema"
                name="Sistema"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#8b5cf6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
