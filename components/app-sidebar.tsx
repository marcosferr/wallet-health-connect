"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Target,
  Heart,
  CheckSquare,
  Trophy,
  BarChart3,
  Wallet,
  Settings,
  Zap,
} from "lucide-react"

interface NavItem {
  icon: React.ElementType
  label: string
  id: string
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Resumen", id: "resumen" },
  { icon: Target, label: "Foco", id: "foco" },
  { icon: Heart, label: "Salud", id: "salud" },
  { icon: CheckSquare, label: "Hábitos", id: "habitos" },
  { icon: Trophy, label: "Metas", id: "metas" },
  { icon: Wallet, label: "Finanzas", id: "finanzas" },
  { icon: BarChart3, label: "Análisis", id: "analisis" },
]

interface AppSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  onSettingsClick: () => void
}

export function AppSidebar({ activeSection, onSectionChange, onSettingsClick }: AppSidebarProps) {
  const [level] = useState(9)
  const [xp] = useState(5210)
  const [currentXp] = useState(1210)
  const [maxXp] = useState(1500)

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <span className="text-sm font-bold text-primary-foreground">L</span>
        </div>
        <span className="text-xl font-semibold text-foreground">LifeOS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Settings Button */}
      <div className="px-3 pb-2">
        <button
          onClick={onSettingsClick}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
          Configuración
        </button>
      </div>

      {/* Level Progress */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">Nv. {level}</span>
          <span className="text-muted-foreground">· Leyenda</span>
          <span className="ml-auto text-muted-foreground">{xp} XP</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${(currentXp / maxXp) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {currentXp} / {maxXp} XP
        </p>
      </div>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <span className="text-sm font-semibold text-primary-foreground">CH</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">Carlos Hernández</p>
            <p className="truncate text-xs text-muted-foreground">carlos@lifeos.app</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
