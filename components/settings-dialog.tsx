"use client"

import { useEffect, useState } from "react"
import { Settings, Link2, Check, AlertCircle, RotateCcw } from "lucide-react"
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
import type { ApiConfig, ProviderStatus } from "@/lib/types"

interface SettingsDialogProps {
  config: ApiConfig
  onConfigChange: (config: ApiConfig) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
}

export function SettingsDialog({ config, onConfigChange, open, onOpenChange, showTrigger = true }: SettingsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [localConfig, setLocalConfig] = useState(config)
  const [testResults, setTestResults] = useState<{
    health?: ProviderStatus & { state: "success" | "error" | "testing" }
    wallet?: ProviderStatus & { state: "success" | "error" | "testing" }
  }>({})

  const dialogOpen = open ?? internalOpen
  const setDialogOpen = (nextOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(nextOpen)
      return
    }

    setInternalOpen(nextOpen)
  }

  useEffect(() => {
    setLocalConfig(config)
  }, [config, dialogOpen])

  const handleSave = () => {
    onConfigChange(localConfig)
    setDialogOpen(false)
  }

  const resetOverrides = () => {
    const clearedConfig = {
      healthConnectUrl: "",
      healthConnectToken: "",
      walletApiToken: "",
    }
    setLocalConfig(clearedConfig)
    onConfigChange(clearedConfig)
  }

  const testProvider = async (provider: "health" | "wallet") => {
    setTestResults((prev) => ({
      ...prev,
      [provider]: {
        configured: false,
        isLive: false,
        resolvedFrom: "none",
        state: "testing",
      },
    }))

    try {
      const response = await fetch("/api/integrations/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          config: localConfig,
        }),
      })

      const result = (await response.json()) as ProviderStatus | { error?: string }

      if (!response.ok && "error" in result && result.error) {
        setTestResults((prev) => ({
          ...prev,
          [provider]: {
            configured: false,
            isLive: false,
            resolvedFrom: "none",
            message: result.error,
            state: "error",
          },
        }))
        return
      }

      const status = result as ProviderStatus
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          ...status,
          state: status.isLive ? "success" : "error",
        },
      }))
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          configured: false,
          isLive: false,
          resolvedFrom: "none",
          message: "No se pudo probar la conexión.",
          state: "error",
        },
      }))
    }
  }

  const healthTest = testResults.health
  const walletTest = testResults.wallet

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="border-border bg-card hover:bg-secondary">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Configuración</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Configuración de APIs</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Usa valores guardados en este navegador o deja los campos vacíos para que el servidor use variables de entorno.
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
                Para tu despliegue hospedado: https://health.tereredev.com
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
                onClick={() => testProvider("health")}
                className="border-border"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Probar conexión
              </Button>
              {healthTest?.state === "success" && (
                <span className="flex items-center text-sm text-primary">
                  <Check className="h-4 w-4 mr-1" /> Conectado
                </span>
              )}
              {healthTest?.state === "error" && (
                <span className="flex items-center text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mr-1" /> Error
                </span>
              )}
              {healthTest?.state === "testing" && (
                <span className="text-sm text-muted-foreground">Probando...</span>
              )}
            </div>
            {healthTest?.message && (
              <p className="text-xs text-muted-foreground">{healthTest.message}</p>
            )}
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
                onClick={() => testProvider("wallet")}
                className="border-border"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Probar conexión
              </Button>
              {walletTest?.state === "success" && (
                <span className="flex items-center text-sm text-primary">
                  <Check className="h-4 w-4 mr-1" /> Conectado
                </span>
              )}
              {walletTest?.state === "error" && (
                <span className="flex items-center text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mr-1" /> Error
                </span>
              )}
              {walletTest?.state === "testing" && (
                <span className="text-sm text-muted-foreground">Probando...</span>
              )}
            </div>
            {walletTest?.message && (
              <p className="text-xs text-muted-foreground">{walletTest.message}</p>
            )}
          </TabsContent>
        </Tabs>
        <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          Prioridad de configuración: localStorage del navegador → variables de entorno del servidor → mock data.
        </div>
        <div className="flex justify-between gap-2 mt-6">
          <Button variant="ghost" onClick={resetOverrides} className="text-muted-foreground">
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpiar overrides
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border">
            Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
