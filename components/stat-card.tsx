"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  secondaryValue?: string
  icon?: LucideIcon
  iconColor?: string
  valueClassName?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({
  title,
  value,
  subtitle,
  secondaryValue,
  icon: Icon,
  iconColor = "text-primary",
  valueClassName,
  trend,
}: StatCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className={cn("text-3xl font-bold text-primary", valueClassName)}>
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "text-sm font-medium mb-1",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
        {secondaryValue && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="text-foreground">{secondaryValue}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
