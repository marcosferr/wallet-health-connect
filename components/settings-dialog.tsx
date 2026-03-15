"use client"

import { useState } from "react"
import { Settings, X, Link2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ApiConfig {
  healthConnectUrl: string
  healthConnectToken: string
  walletApiToken: string
}

interface SettingsDialogProps {
  config: ApiConfig
  onConfigChange: (config: ApiConfig) => void
}

export function SettingsDialog({ config, onConfigChange }: SettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [localConfig, setLocalConfig] = useState(config)
  const [testResults, setTestResults] = useState<{
    health?: "success" | "error" | "testing"
    wallet?: "success" | "error" | "testing"
  }>({})

  const handleSave = () => {
    onConfigChange(localConfig)
    setOpen(false)
  }

  const testHealthConnect = async () => {
    if (!localConfig.healthConnectUrl || !localConfig.healthConnectToken) return
    setTestResults((prev) => ({ ...prev, health: "testing" }))
    try {
      const response = await fetch(`${localConfig.healthConnectUrl}/api/v2/fetch/steps`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localConfig.healthConnectToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
      setTestResults((prev) => ({ ...prev, health: response.ok ? "success" : "error" }))
    } catch {
      setTestResults((prev) => ({ ...prev, health: "error" }))
    }
  }

  const testWalletApi = async () => {
    if (!localConfig.walletApiToken) return
    setTestResults((prev) => ({ ...prev, wallet: "testing" }))
    try {
      const response = await fetch("https://rest.budgetbakers.com/wallet/accounts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localConfig.walletApiToken}`,
          "Content-Type": "application/json",
        },
      })
      setTestResults((prev) => ({ ...prev, wallet: response.ok ? "success" : "error" }))
    } catch (error) {
      setTestResults((prev) => ({ ...prev, wallet: "error" }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="border-border bg-card hover:bg-secondary">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Configuración</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Configuración de APIs</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Conecta tus APIs para obtener datos reales. Sin configuración, se mostrarán datos de ejemplo.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="health" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="health">Health Connect</TabsTrigger>
            <TabsTrigger value="wallet">Wallet API</TabsTrigger>
          </TabsList>
          <TabsContent value="health" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="hc-url" className="text-foreground">
                URL del servidor
              </Label>
              <Input
                id="hc-url"
                placeholder="https://tu-servidor-hcgateway.com"
                value={localConfig.healthConnectUrl}
                onChange={(e) => setLocalConfig({ ...localConfig, healthConnectUrl: e.target.value })}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                La URL base de tu instancia de HCGateway
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hc-token" className="text-foreground">
                Token de autenticación
              </Label>
              <Input
                id="hc-token"
                type="password"
                placeholder="Tu token de Health Connect"
                value={localConfig.healthConnectToken}
                onChange={(e) => setLocalConfig({ ...localConfig, healthConnectToken: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testHealthConnect}
                disabled={!localConfig.healthConnectUrl || !localConfig.healthConnectToken}
                className="border-border"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Probar conexión
              </Button>
              {testResults.health === "success" && (
                <span className="flex items-center text-sm text-primary">
                  <Check className="h-4 w-4 mr-1" /> Conectado
                </span>
              )}
              {testResults.health === "error" && (
                <span className="flex items-center text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mr-1" /> Error
                </span>
              )}
              {testResults.health === "testing" && (
                <span className="text-sm text-muted-foreground">Probando...</span>
              )}
            </div>
          </TabsContent>
          <TabsContent value="wallet" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-token" className="text-foreground">
                Token de API
              </Label>
              <Input
                id="wallet-token"
                type="password"
                placeholder="Tu token de Budget Bakers Wallet"
                value={localConfig.walletApiToken}
                onChange={(e) => setLocalConfig({ ...localConfig, walletApiToken: e.target.value })}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Obtén tu token desde la app web de Wallet (requiere plan Premium)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testWalletApi}
                disabled={!localConfig.walletApiToken}
                className="border-border"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Probar conexión
              </Button>
              {testResults.wallet === "success" && (
                <span className="flex items-center text-sm text-primary">
                  <Check className="h-4 w-4 mr-1" /> Conectado
                </span>
              )}
              {testResults.wallet === "error" && (
                <span className="flex items-center text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mr-1" /> Error
                </span>
              )}
              {testResults.wallet === "testing" && (
                <span className="text-sm text-muted-foreground">Probando...</span>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)} className="border-border">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
