"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  secondaryValue?: string
  icon: LucideIcon
  iconColor?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  secondaryValue,
  icon: Icon,
  iconColor = "text-primary",
}: StatCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="mt-3">
          <span className="text-3xl font-bold text-foreground">{value}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        {secondaryValue && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="text-foreground">— {secondaryValue}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
