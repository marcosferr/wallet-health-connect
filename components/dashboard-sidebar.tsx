"use client"

import { useState } from "react"
import {
  Activity,
  Wallet,
  LayoutDashboard,
  Settings,
  Heart,
  TrendingUp,
  Moon,
  Footprints,
  Flame,
  BedDouble,
  Scale,
  PiggyBank,
  CreditCard,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DashboardSidebarProps {
  activeSection: "overview" | "health" | "finance"
  onSectionChange: (section: "overview" | "health" | "finance") => void
  onSettingsClick: () => void
}

const mainNavItems = [
  {
    id: "overview" as const,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "health" as const,
    label: "Salud",
    icon: Activity,
  },
  {
    id: "finance" as const,
    label: "Finanzas",
    icon: Wallet,
  },
]

const healthMetrics = [
  { label: "Pasos",    icon: Footprints, color: "#00d4ff" },
  { label: "Calorías", icon: Flame,      color: "#f97316" },
  { label: "Corazón",  icon: Heart,      color: "#ef4444" },
  { label: "Sueño",    icon: BedDouble,  color: "#a78bfa" },
  { label: "Peso",     icon: Scale,      color: "#34d399" },
]

const financeMetrics = [
  { label: "Balance",      icon: PiggyBank,  color: "#00d4ff" },
  { label: "Gastos",       icon: CreditCard, color: "#ef4444" },
  { label: "Ahorro",       icon: TrendingUp, color: "#22c55e" },
  { label: "Presupuesto",  icon: Target,     color: "#f59e0b" },
]

export function DashboardSidebar({
  activeSection,
  onSectionChange,
  onSettingsClick,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">LifeStatus</span>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          <div className={cn("mb-4", !collapsed && "px-2")}>
            {!collapsed && (
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Principal
              </span>
            )}
          </div>

          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return collapsed ? (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      "flex w-full items-center justify-center rounded-lg p-3 transition-colors",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}

          {/* Health Metrics Section */}
          {(activeSection === "overview" || activeSection === "health") && (
            <>
              <div className={cn("mt-6 mb-2", !collapsed && "px-2")}>
                {!collapsed && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Salud
                  </span>
                )}
              </div>
              {healthMetrics.map((metric) => {
                const Icon = metric.icon
                return collapsed ? (
                  <Tooltip key={metric.label}>
                    <TooltipTrigger asChild>
                      <div className="flex w-full items-center justify-center rounded-lg p-2">
                        <Icon className="h-4 w-4" style={{ color: metric.color }} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {metric.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div
                    key={metric.label}
                    className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-muted-foreground/80"
                  >
                    <Icon className="h-4 w-4" style={{ color: metric.color }} />
                    <span>{metric.label}</span>
                  </div>
                )
              })}
            </>
          )}

          {/* Finance Metrics Section */}
          {(activeSection === "overview" || activeSection === "finance") && (
            <>
              <div className={cn("mt-6 mb-2", !collapsed && "px-2")}>
                {!collapsed && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Finanzas
                  </span>
                )}
              </div>
              {financeMetrics.map((metric) => {
                const Icon = metric.icon
                return collapsed ? (
                  <Tooltip key={metric.label}>
                    <TooltipTrigger asChild>
                      <div className="flex w-full items-center justify-center rounded-lg p-2">
                        <Icon className="h-4 w-4" style={{ color: metric.color }} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {metric.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div
                    key={metric.label}
                    className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-muted-foreground/80"
                  >
                    <Icon className="h-4 w-4" style={{ color: metric.color }} />
                    <span>{metric.label}</span>
                  </div>
                )
              })}
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onSettingsClick}
                  className="flex w-full items-center justify-center rounded-lg p-3 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Configuración
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={onSettingsClick}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Configuración</span>
            </button>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex w-full items-center rounded-lg p-2.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors",
              collapsed ? "justify-center" : "gap-3 px-3"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="font-medium">Colapsar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
