"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp } from "lucide-react"

interface VitalScoreCardProps {
  score: number
  status: "excellent" | "good" | "attention" | "critical"
  message: string
}

export function VitalScoreCard({ score, status, message }: VitalScoreCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "excellent":
        return "text-primary"
      case "good":
        return "text-chart-3"
      case "attention":
        return "text-warning"
      case "critical":
        return "text-destructive"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "excellent":
        return "Excelente"
      case "good":
        return "Bien"
      case "attention":
        return "Necesita atención"
      case "critical":
        return "Crítico"
    }
  }

  const getStatusIcon = () => {
    if (status === "excellent" || status === "good") {
      return <ArrowUp className="h-3 w-3" />
    }
    return <ArrowDown className="h-3 w-3" />
  }

  // Calculate the circumference and offset for the progress ring
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center gap-6 p-6">
        {/* Circular Progress */}
        <div className="relative flex h-32 w-32 flex-shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-secondary"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4aa" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground">{score}</span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Puntos</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">Puntuación vital</h3>
          <div className={`mt-1 flex items-center gap-1 text-sm ${getStatusColor()}`}>
            {getStatusIcon()}
            {getStatusText()}
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}
