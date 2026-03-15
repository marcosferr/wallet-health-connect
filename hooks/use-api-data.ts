import { useEffect, useState } from "react"
import { HealthConnectService, WalletService } from "@/lib/api-services"
import type { ApiConfig } from "@/lib/types"
import {
  mockHealthMetrics,
  mockFinanceMetrics,
} from "@/lib/mock-data"

interface UseApiDataResult {
  healthMetrics: typeof mockHealthMetrics
  financeMetrics: typeof mockFinanceMetrics
  isLoading: boolean
  error: string | null
}

export function useApiData(config: ApiConfig): UseApiDataResult {
  const [healthMetrics, setHealthMetrics] = useState(mockHealthMetrics)
  const [financeMetrics, setFinanceMetrics] = useState(mockFinanceMetrics)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!config.healthConnectUrl && !config.walletApiToken) {
        // Using mock data
        setHealthMetrics(mockHealthMetrics)
        setFinanceMetrics(mockFinanceMetrics)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Fetch health data if configured
        if (config.healthConnectUrl && config.healthConnectToken) {
          const healthService = new HealthConnectService(
            config.healthConnectUrl,
            config.healthConnectToken
          )
          const health = await healthService.getAllMetrics()
          setHealthMetrics(health)
        }

        // Fetch finance data if configured
        if (config.walletApiToken) {
          const walletService = new WalletService(config.walletApiToken)
          const finance = await walletService.getFinanceMetrics()
          setFinanceMetrics(finance)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error fetching API data"
        setError(errorMsg)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [config.healthConnectUrl, config.healthConnectToken, config.walletApiToken])

  return {
    healthMetrics,
    financeMetrics,
    isLoading,
    error,
  }
}
