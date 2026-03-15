import {
  mockAccounts,
  mockCaloriesHistory,
  mockDailySpending,
  mockExpenseHistory,
  mockExpensesByCategory,
  mockFinanceMetrics,
  mockHealthMetrics,
  mockHeartRateHistory,
  mockIncomeHistory,
  mockRecentTransactions,
  mockSleepHistory,
  mockStepsHistory,
  mockWeightHistory,
} from "@/lib/mock-data"
import type {
  ApiConfig,
  ChartDataPoint,
  DashboardDataPayload,
  ExpenseByCategory,
  HealthDataPoint,
  ProviderStatus,
  WalletAccount,
  WalletCategory,
  WalletRecord,
} from "@/lib/types"

const WALLET_BASE_URL = "https://rest.budgetbakers.com/wallet/v1/api"
const MAX_WALLET_RECORDS = 1000
const WALLET_PAGE_SIZE = 200

interface PaginatedResponse<T> {
  limit?: number
  nextOffset?: number
  offset?: number
  accounts?: T[]
  records?: T[]
  categories?: T[]
}

interface WalletAccountResponse {
  id: string
  name: string
  accountType?: string
  initialBalance?: {
    currencyCode?: string
    value?: number
  }
  initialBaseBalance?: {
    currencyCode?: string
    value?: number
  }
}

interface WalletCategoryResponse {
  id: string
  name: string
  color?: string
  iconName?: string
}

interface WalletRecordResponse {
  id: string
  accountId: string
  note?: string
  payee?: string
  payer?: string
  recordDate: string
  recordType: "income" | "expense"
  amount?: {
    currencyCode?: string
    value?: number
  }
  baseAmount?: {
    currencyCode?: string
    value?: number
  }
  category?: {
    id: string
    name: string
  } | null
}

type ProviderSource = ProviderStatus["resolvedFrom"]

interface ResolvedConfig {
  healthConnectUrl: string
  healthConnectToken: string
  walletApiToken: string
  sources: {
    health: ProviderSource
    wallet: ProviderSource
  }
}

interface DashboardProviderResult {
  payload: DashboardDataPayload
}

function cleanValue(value?: string | null): string {
  return value?.trim() ?? ""
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "")
}

function resolveValue(localValue: string, envValue: string): { value: string; source: ProviderSource } {
  if (localValue) {
    return { value: localValue, source: "localStorage" }
  }

  if (envValue) {
    return { value: envValue, source: "env" }
  }

  return { value: "", source: "none" }
}

function resolveConfig(config?: ApiConfig): ResolvedConfig {
  const healthUrl = resolveValue(
    cleanValue(config?.healthConnectUrl),
    cleanValue(process.env.HCGATEWAY_BASE_URL || process.env.NEXT_PUBLIC_HCGATEWAY_BASE_URL)
  )
  const healthToken = resolveValue(cleanValue(config?.healthConnectToken), cleanValue(process.env.HCGATEWAY_TOKEN))
  const walletToken = resolveValue(cleanValue(config?.walletApiToken), cleanValue(process.env.WALLET_API_TOKEN))

  return {
    healthConnectUrl: healthUrl.value ? stripTrailingSlash(healthUrl.value) : "",
    healthConnectToken: healthToken.value,
    walletApiToken: walletToken.value,
    sources: {
      health:
        healthUrl.source === "localStorage" || healthToken.source === "localStorage"
          ? "localStorage"
          : healthUrl.source === "env" || healthToken.source === "env"
            ? "env"
            : "none",
      wallet: walletToken.source,
    },
  }
}

function createProviderStatus(
  resolvedFrom: ProviderSource,
  configured: boolean,
  isLive: boolean,
  message?: string,
  baseUrl?: string
): ProviderStatus {
  return {
    configured,
    isLive,
    resolvedFrom,
    message,
    baseUrl,
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>
}

async function fetchHealthData(
  baseUrl: string,
  token: string,
  method: string,
  queries?: Record<string, unknown>
): Promise<HealthDataPoint[]> {
  const response = await fetch(`${baseUrl}/api/v2/fetch/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(queries ? { queries } : { queries: {} }),
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Health Connect ${method} failed (${response.status}): ${body || response.statusText}`)
  }

  return parseJsonResponse<HealthDataPoint[]>(response)
}

async function fetchWallet<T>(token: string, endpoint: string, params?: URLSearchParams): Promise<T> {
  const url = new URL(`${WALLET_BASE_URL}${endpoint}`)
  if (params) {
    url.search = params.toString()
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Wallet ${endpoint} failed (${response.status}): ${body || response.statusText}`)
  }

  return parseJsonResponse<T>(response)
}

function mapAccountType(accountType?: string): string {
  switch (accountType) {
    case "CurrentAccount":
      return "bank"
    case "SavingAccount":
      return "savings"
    case "Cash":
      return "cash"
    case "CreditCard":
      return "credit"
    default:
      return accountType?.toLowerCase() || "account"
  }
}

function mapWalletAccount(account: WalletAccountResponse): WalletAccount {
  const dynamicAccount = account as WalletAccountResponse & {
    balance?: { currencyCode?: string; value?: number } | number
    currentBalance?: { currencyCode?: string; value?: number }
  }
  const dynamicBalance =
    typeof dynamicAccount.balance === "number"
      ? dynamicAccount.balance
      : dynamicAccount.balance?.value
  const dynamicCurrency =
    typeof dynamicAccount.balance === "number"
      ? undefined
      : dynamicAccount.balance?.currencyCode

  return {
    id: account.id,
    name: account.name,
    currency:
      dynamicAccount.currentBalance?.currencyCode ??
      dynamicCurrency ??
      account.initialBaseBalance?.currencyCode ??
      account.initialBalance?.currencyCode ??
      "EUR",
    balance:
      dynamicAccount.currentBalance?.value ??
      dynamicBalance ??
      account.initialBaseBalance?.value ??
      account.initialBalance?.value ??
      0,
    type: mapAccountType(account.accountType),
  }
}

function mapWalletCategory(category: WalletCategoryResponse): WalletCategory {
  return {
    id: category.id,
    name: category.name,
    color: category.color || "#00d4ff",
    icon: category.iconName,
    type: "expense",
  }
}

function mapWalletRecord(record: WalletRecordResponse): WalletRecord {
  const normalizedAmount = record.baseAmount?.value ?? record.amount?.value ?? 0

  return {
    id: record.id,
    amount: record.recordType === "expense" ? -Math.abs(normalizedAmount) : Math.abs(normalizedAmount),
    currency: record.baseAmount?.currencyCode ?? record.amount?.currencyCode ?? "EUR",
    categoryId: record.category?.id ?? "otros",
    accountId: record.accountId,
    recordDate: record.recordDate,
    note: record.note,
    payee: record.payee ?? record.payer,
    type: record.recordType,
  }
}

function formatShortDay(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric" })
    .format(date)
    .replace(".", "")
    .replace(/(^\w)/, (char) => char.toUpperCase())
}

function formatShortMonth(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", { month: "short", day: "numeric" })
    .format(date)
    .replace(".", "")
    .replace(/(^\w)/, (char) => char.toUpperCase())
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", { month: "short" })
    .format(date)
    .replace(".", "")
    .replace(/(^\w)/, (char) => char.toUpperCase())
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function createLastDays(days: number): Date[] {
  const today = startOfDay(new Date())
  return Array.from({ length: days }, (_, index) => addDays(today, index - (days - 1)))
}

function getIsoDateKey(value?: string): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString().split("T")[0]
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function getNestedNumber(source: unknown, paths: string[][]): number | null {
  for (const path of paths) {
    let current: unknown = source
    for (const key of path) {
      if (!current || typeof current !== "object" || !(key in current)) {
        current = null
        break
      }
      current = (current as Record<string, unknown>)[key]
    }
    const value = readNumber(current)
    if (value !== null) {
      return value
    }
  }

  return null
}

function getStepCount(item: HealthDataPoint): number {
  return (
    getNestedNumber(item.data, [["count"], ["steps"], ["value"], ["stepCount"], ["countTotal"]]) ?? 0
  )
}

function getCalories(item: HealthDataPoint): number {
  return (
    getNestedNumber(item.data, [["energy", "inKilocalories"], ["energy", "kilocalories"], ["kcal"], ["value"]]) ?? 0
  )
}

function getHeartRateValue(item: HealthDataPoint): number {
  const direct = getNestedNumber(item.data, [["bpm"], ["beatsPerMinute"], ["value"]])
  if (direct !== null) {
    return direct
  }

  const samples = (item.data as { samples?: Array<{ beatsPerMinute?: number; bpm?: number }> }).samples
  if (!Array.isArray(samples) || samples.length === 0) {
    return 0
  }

  const values = samples
    .map((sample) => readNumber(sample.beatsPerMinute ?? sample.bpm))
    .filter((value): value is number => value !== null)

  if (!values.length) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function getWeightValue(item: HealthDataPoint): number {
  const kilograms = getNestedNumber(item.data, [["weight", "inKilograms"], ["weightKg"], ["value"]])
  if (kilograms !== null) {
    return kilograms
  }

  const grams = getNestedNumber(item.data, [["weight", "inGrams"], ["grams"]])
  return grams !== null ? grams / 1000 : 0
}

function getDistanceValue(item: HealthDataPoint): number {
  const kilometers = getNestedNumber(item.data, [["distance", "inKilometers"], ["distanceKm"], ["kilometers"]])
  if (kilometers !== null) {
    return kilometers
  }

  const meters = getNestedNumber(item.data, [["distance", "inMeters"], ["meters"]])
  return meters !== null ? meters / 1000 : 0
}

function getSleepDuration(item: HealthDataPoint): number {
  if (!item.start || !item.end) {
    return 0
  }

  const start = new Date(item.start)
  const end = new Date(item.end)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0
  }

  return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

function buildDailyChart(
  days: Date[],
  records: HealthDataPoint[],
  extractor: (item: HealthDataPoint) => number,
  label: string,
  reducer: "sum" | "avg" = "sum"
): ChartDataPoint[] {
  const grouped = new Map<string, number[]>()

  for (const record of records) {
    const key = getIsoDateKey(record.start || record.end)
    if (!key) {
      continue
    }

    const value = extractor(record)
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }

    grouped.get(key)?.push(value)
  }

  return days.map((day) => {
    const key = day.toISOString().split("T")[0]
    const values = grouped.get(key) ?? []
    const value =
      reducer === "avg"
        ? values.length
          ? values.reduce((sum, current) => sum + current, 0) / values.length
          : 0
        : values.reduce((sum, current) => sum + current, 0)

    return {
      date: formatShortDay(day),
      value: Math.round(value * 10) / 10,
      label,
    }
  })
}

function buildHeartRate24h(records: HealthDataPoint[]): ChartDataPoint[] {
  const now = new Date()
  const buckets = new Map<string, number[]>()

  for (let index = 23; index >= 0; index -= 1) {
    const bucket = new Date(now.getTime() - index * 60 * 60 * 1000)
    const key = `${bucket.getUTCFullYear()}-${bucket.getUTCMonth()}-${bucket.getUTCDate()}-${bucket.getUTCHours()}`
    buckets.set(key, [])
  }

  for (const record of records) {
    const date = new Date(record.start || record.end || "")
    if (Number.isNaN(date.getTime())) {
      continue
    }

    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}`
    if (!buckets.has(key)) {
      continue
    }

    buckets.get(key)?.push(getHeartRateValue(record))
  }

  return Array.from(buckets.entries()).map(([key, values]) => {
    const [, , , hours] = key.split("-").map(Number)
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
    return {
      date: `${hours.toString().padStart(2, "0")}:00`,
      value: Math.round(average),
      label: "bpm",
    }
  })
}

function buildWeightHistory(records: HealthDataPoint[]): ChartDataPoint[] {
  const sorted = [...records]
    .sort((left, right) => new Date(left.start).getTime() - new Date(right.start).getTime())
    .slice(-5)

  if (!sorted.length) {
    return mockWeightHistory
  }

  return sorted.map((item) => ({
    date: formatShortMonth(new Date(item.start)),
    value: Math.round(getWeightValue(item) * 10) / 10,
    label: "kg",
  }))
}

async function getHealthPayload(baseUrl: string, token: string): Promise<Pick<DashboardDataPayload, "healthMetrics" | "healthCharts">> {
  const today = startOfDay(new Date())
  const days7Start = addDays(today, -6)
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const healthQuery = { start: { $gte: days7Start.toISOString() } }

  const [stepsRecords, caloriesRecords, heartRateRecords, sleepRecords, weightRecords, distanceRecords] = await Promise.all([
    fetchHealthData(baseUrl, token, "steps", healthQuery),
    fetchHealthData(baseUrl, token, "totalCaloriesBurned", healthQuery),
    fetchHealthData(baseUrl, token, "heartRate", { start: { $gte: last24Hours.toISOString() } }),
    fetchHealthData(baseUrl, token, "sleepSession", healthQuery),
    fetchHealthData(baseUrl, token, "weight", { start: { $gte: addDays(today, -60).toISOString() } }),
    fetchHealthData(baseUrl, token, "distance", healthQuery),
  ])

  const days = createLastDays(7)
  const stepsChart = buildDailyChart(days, stepsRecords, getStepCount, "pasos")
  const caloriesChart = buildDailyChart(days, caloriesRecords, getCalories, "kcal")
  const sleepChart = buildDailyChart(days, sleepRecords, getSleepDuration, "horas")
  const heartRateChart = buildHeartRate24h(heartRateRecords)
  const weightChart = buildWeightHistory(weightRecords)

  const latestHeartRate = [...heartRateRecords]
    .sort((left, right) => new Date(right.start || right.end || "").getTime() - new Date(left.start || left.end || "").getTime())
    .map((item) => getHeartRateValue(item))
    .find((value) => value > 0) ?? mockHealthMetrics.heartRate

  const latestSleep = [...sleepRecords]
    .sort((left, right) => new Date(right.end || right.start || "").getTime() - new Date(left.end || left.start || "").getTime())
    .map((item) => getSleepDuration(item))
    .find((value) => value > 0) ?? mockHealthMetrics.sleep

  const latestWeight = [...weightRecords]
    .sort((left, right) => new Date(right.start || "").getTime() - new Date(left.start || "").getTime())
    .map((item) => getWeightValue(item))
    .find((value) => value > 0) ?? mockHealthMetrics.weight

  const todayKey = today.toISOString().split("T")[0]
  const stepsToday = stepsChart.find((item) => {
    const date = days[days.length - 1]
    return item.date === formatShortDay(date)
  })?.value ?? mockHealthMetrics.steps
  const caloriesToday = caloriesChart.find((item) => item.date === formatShortDay(days[days.length - 1]))?.value ?? mockHealthMetrics.calories
  const distanceToday = distanceRecords
    .filter((item) => getIsoDateKey(item.start || item.end) === todayKey)
    .reduce((sum, item) => sum + getDistanceValue(item), 0)

  return {
    healthMetrics: {
      steps: Math.round(stepsToday),
      stepsGoal: mockHealthMetrics.stepsGoal,
      calories: Math.round(caloriesToday),
      caloriesGoal: mockHealthMetrics.caloriesGoal,
      heartRate: Math.round(latestHeartRate),
      sleep: Math.round(latestSleep * 10) / 10,
      sleepGoal: mockHealthMetrics.sleepGoal,
      distance: Math.round(distanceToday * 10) / 10,
      weight: Math.round(latestWeight * 10) / 10,
      activeMinutes: mockHealthMetrics.activeMinutes,
    },
    healthCharts: {
      steps: stepsChart.some((item) => item.value > 0) ? stepsChart : mockStepsHistory,
      calories: caloriesChart.some((item) => item.value > 0) ? caloriesChart : mockCaloriesHistory,
      heartRate: heartRateChart.some((item) => item.value > 0) ? heartRateChart : mockHeartRateHistory,
      sleep: sleepChart.some((item) => item.value > 0) ? sleepChart : mockSleepHistory,
      weight: weightChart,
    },
  }
}

async function getWalletRecords(token: string): Promise<WalletRecord[]> {
  const records: WalletRecord[] = []
  let offset = 0
  const rangeStart = addDays(startOfDay(new Date()), -365).toISOString().split("T")[0]
  const rangeEnd = addDays(startOfDay(new Date()), 1).toISOString().split("T")[0]

  while (records.length < MAX_WALLET_RECORDS) {
    const params = new URLSearchParams()
    params.set("limit", WALLET_PAGE_SIZE.toString())
    params.set("offset", offset.toString())
    params.append("recordDate", `gte.${rangeStart}`)
    params.append("recordDate", `lt.${rangeEnd}`)

    const page = await fetchWallet<PaginatedResponse<WalletRecordResponse>>(token, "/records", params)
    const pageItems = (page.records ?? []).map(mapWalletRecord)

    records.push(...pageItems)

    const nextOffset = typeof page.nextOffset === "number" ? page.nextOffset : undefined

    if (nextOffset === undefined || pageItems.length === 0) {
      break
    }

    offset = nextOffset
  }

  return records.slice(0, MAX_WALLET_RECORDS)
}

function buildMonthlyHistory(records: WalletRecord[], type: WalletRecord["type"]): ChartDataPoint[] {
  const months = new Map<string, number>()
  const order: string[] = []
  const now = new Date()

  for (let index = 5; index >= 0; index -= 1) {
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1))
    const key = `${month.getUTCFullYear()}-${month.getUTCMonth()}`
    months.set(key, 0)
    order.push(key)
  }

  for (const record of records) {
    if (record.type !== type) {
      continue
    }

    const date = new Date(record.recordDate)
    if (Number.isNaN(date.getTime())) {
      continue
    }

    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`
    if (!months.has(key)) {
      continue
    }

    months.set(key, (months.get(key) ?? 0) + Math.abs(record.amount))
  }

  return order.map((key) => {
    const [year, month] = key.split("-").map(Number)
    const date = new Date(Date.UTC(year, month, 1))
    return {
      date: formatMonthLabel(date),
      value: Math.round(months.get(key) ?? 0),
      label: "€",
    }
  })
}

function buildDailySpending(records: WalletRecord[]): ChartDataPoint[] {
  const days = createLastDays(7)
  const totals = new Map<string, number>()

  for (const day of days) {
    totals.set(day.toISOString().split("T")[0], 0)
  }

  for (const record of records) {
    if (record.type !== "expense") {
      continue
    }

    const key = getIsoDateKey(record.recordDate)
    if (!key || !totals.has(key)) {
      continue
    }

    totals.set(key, (totals.get(key) ?? 0) + Math.abs(record.amount))
  }

  return days.map((day) => {
    const key = day.toISOString().split("T")[0]
    return {
      date: formatShortDay(day),
      value: Math.round(totals.get(key) ?? 0),
      label: "€",
    }
  })
}

function buildExpensesByCategory(records: WalletRecord[], categories: WalletCategory[]): ExpenseByCategory[] {
  const names = new Map(categories.map((category) => [category.id, category.name]))
  const totals = new Map<string, number>()
  let overall = 0

  for (const record of records) {
    if (record.type !== "expense") {
      continue
    }

    const key = record.categoryId || "Otros"
    const amount = Math.abs(record.amount)
    totals.set(key, (totals.get(key) ?? 0) + amount)
    overall += amount
  }

  if (!overall) {
    return mockExpensesByCategory
  }

  return Array.from(totals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([categoryId, amount]) => ({
      category: names.get(categoryId) ?? categoryId,
      amount: Math.round(amount * 100) / 100,
      color: "var(--chart-1)",
      percentage: Math.round((amount / overall) * 1000) / 10,
    }))
}

async function getWalletPayload(token: string): Promise<Pick<DashboardDataPayload, "financeMetrics" | "financeCurrency" | "accounts" | "recentTransactions" | "incomeHistory" | "expenseHistory" | "expensesByCategory" | "dailySpending">> {
  const [accountsResponse, records, categories] = await Promise.all([
    fetchWallet<PaginatedResponse<WalletAccountResponse>>(token, "/accounts", new URLSearchParams({ limit: "200" })),
    getWalletRecords(token),
    fetchWallet<PaginatedResponse<WalletCategoryResponse>>(token, "/categories", new URLSearchParams({ limit: "200" }))
      .then((response) => (response.categories ?? []).map(mapWalletCategory))
      .catch(() => []),
  ])
  const accounts = (accountsResponse.accounts ?? []).map(mapWalletAccount)
  const financeCurrency = accounts[0]?.currency ?? records[0]?.currency ?? "EUR"

  const now = new Date()
  const monthlyIncome = records
    .filter((record) => {
      const date = new Date(record.recordDate)
      return record.type === "income" && date.getUTCMonth() === now.getUTCMonth() && date.getUTCFullYear() === now.getUTCFullYear()
    })
    .reduce((sum, record) => sum + Math.abs(record.amount), 0)

  const monthlyExpenses = records
    .filter((record) => {
      const date = new Date(record.recordDate)
      return record.type === "expense" && date.getUTCMonth() === now.getUTCMonth() && date.getUTCFullYear() === now.getUTCFullYear()
    })
    .reduce((sum, record) => sum + Math.abs(record.amount), 0)

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const recentTransactions = [...records]
    .sort((left, right) => new Date(right.recordDate).getTime() - new Date(left.recordDate).getTime())
    .slice(0, 20)

  return {
    financeMetrics: {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savings: monthlyIncome - monthlyExpenses,
      budgetUsed: monthlyExpenses,
      budgetTotal: mockFinanceMetrics.budgetTotal,
    },
    financeCurrency,
    accounts: accounts.length ? accounts : mockAccounts,
    recentTransactions: recentTransactions.length ? recentTransactions : mockRecentTransactions,
    incomeHistory: buildMonthlyHistory(records, "income"),
    expenseHistory: buildMonthlyHistory(records, "expense"),
    expensesByCategory: buildExpensesByCategory(records, categories),
    dailySpending: buildDailySpending(records),
  }
}

export async function buildDashboardData(config?: ApiConfig): Promise<DashboardProviderResult> {
  const resolved = resolveConfig(config)
  const errors: string[] = []

  let healthStatus = createProviderStatus(
    resolved.sources.health,
    Boolean(resolved.healthConnectUrl && resolved.healthConnectToken),
    false,
    resolved.sources.health === "none" ? "Sin credenciales: usando mock de salud." : undefined,
    resolved.healthConnectUrl || undefined
  )
  let walletStatus = createProviderStatus(
    resolved.sources.wallet,
    Boolean(resolved.walletApiToken),
    false,
    resolved.sources.wallet === "none" ? "Sin token de Wallet: usando mock financiero." : undefined
  )

  let healthPayload: Pick<DashboardDataPayload, "healthMetrics" | "healthCharts"> = {
    healthMetrics: mockHealthMetrics,
    healthCharts: {
      steps: mockStepsHistory,
      calories: mockCaloriesHistory,
      heartRate: mockHeartRateHistory,
      sleep: mockSleepHistory,
      weight: mockWeightHistory,
    },
  }

  let walletPayload: Pick<DashboardDataPayload, "financeMetrics" | "financeCurrency" | "accounts" | "recentTransactions" | "incomeHistory" | "expenseHistory" | "expensesByCategory" | "dailySpending"> = {
    financeMetrics: mockFinanceMetrics,
    financeCurrency: "EUR",
    accounts: mockAccounts,
    recentTransactions: mockRecentTransactions,
    incomeHistory: mockIncomeHistory,
    expenseHistory: mockExpenseHistory,
    expensesByCategory: mockExpensesByCategory,
    dailySpending: mockDailySpending,
  }

  if (resolved.healthConnectUrl && resolved.healthConnectToken) {
    try {
      healthPayload = await getHealthPayload(resolved.healthConnectUrl, resolved.healthConnectToken)
      healthStatus = createProviderStatus(
        resolved.sources.health,
        true,
        true,
        `Datos cargados desde ${resolved.sources.health === "env" ? ".env" : "localStorage"}.`,
        resolved.healthConnectUrl
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Health Connect unavailable"
      errors.push(message)
      healthStatus = createProviderStatus(resolved.sources.health, true, false, `${message} Usando mock de salud.`, resolved.healthConnectUrl)
    }
  }

  if (resolved.walletApiToken) {
    try {
      walletPayload = await getWalletPayload(resolved.walletApiToken)
      walletStatus = createProviderStatus(
        resolved.sources.wallet,
        true,
        true,
        `Datos cargados desde ${resolved.sources.wallet === "env" ? ".env" : "localStorage"}.`
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet API unavailable"
      errors.push(message)
      walletStatus = createProviderStatus(resolved.sources.wallet, true, false, `${message} Usando mock financiero.`)
    }
  }

  return {
    payload: {
      ...healthPayload,
      ...walletPayload,
      meta: {
        health: healthStatus,
        wallet: walletStatus,
        usingMockData: !healthStatus.isLive && !walletStatus.isLive,
        errors,
      },
    },
  }
}

export async function testProviderConnection(provider: "health" | "wallet", config?: ApiConfig): Promise<ProviderStatus> {
  const resolved = resolveConfig(config)

  if (provider === "health") {
    if (!resolved.healthConnectUrl || !resolved.healthConnectToken) {
      return createProviderStatus(resolved.sources.health, false, false, "Falta URL o token de Health Connect.", resolved.healthConnectUrl || undefined)
    }

    try {
      await fetchHealthData(resolved.healthConnectUrl, resolved.healthConnectToken, "steps", { start: { $gte: addDays(startOfDay(new Date()), -1).toISOString() } })
      return createProviderStatus(resolved.sources.health, true, true, "Conexión correcta con HealthConnectGateway.", resolved.healthConnectUrl)
    } catch (error) {
      return createProviderStatus(
        resolved.sources.health,
        true,
        false,
        error instanceof Error ? error.message : "No se pudo validar Health Connect.",
        resolved.healthConnectUrl
      )
    }
  }

  if (!resolved.walletApiToken) {
    return createProviderStatus(resolved.sources.wallet, false, false, "Falta el token de Wallet API.")
  }

  try {
    const params = new URLSearchParams()
    params.set("limit", "1")
    await fetchWallet<PaginatedResponse<WalletAccountResponse>>(resolved.walletApiToken, "/accounts", params)
    return createProviderStatus(resolved.sources.wallet, true, true, "Conexión correcta con Wallet API.")
  } catch (error) {
    return createProviderStatus(
      resolved.sources.wallet,
      true,
      false,
      error instanceof Error ? error.message : "No se pudo validar Wallet API."
    )
  }
}