"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    label: string
  }
  progress?: {
    current: number
    max: number
  }
  className?: string
  accentColor?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  progress,
  className,
  accentColor = "primary",
}: MetricCardProps) {
  const progressPercent = progress ? Math.min((progress.current / progress.max) * 100, 100) : 0

  return (
    <Card className={cn("bg-card border-border overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
        </div>
        {trend && (
          <p
            className={cn(
              "text-xs mt-1",
              trend.value > 0 ? "text-primary" : trend.value < 0 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </p>
        )}
        {progress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>
                {progress.current.toLocaleString()} / {progress.max.toLocaleString()}
              </span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", `bg-${accentColor}`)}
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor:
                    accentColor === "primary"
                      ? "var(--primary)"
                      : accentColor === "accent"
                        ? "var(--accent)"
                        : accentColor,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
