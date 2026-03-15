"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts"

interface BalanceRadarChartProps {
  data: Array<{
    subject: string
    value: number
    fullMark: number
  }>
}

export function BalanceRadarChart({ data }: BalanceRadarChartProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Balance por área</CardTitle>
        <p className="text-sm text-muted-foreground">Calculado de tus datos reales</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#1e3a5f" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
              />
              <Radar
                name="Balance"
                dataKey="value"
                stroke="#00d4aa"
                fill="#00d4aa"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
