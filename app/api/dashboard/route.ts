import { NextResponse } from "next/server"
import { buildDashboardData } from "@/lib/server/dashboard-data"
import type { ApiConfig } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { config?: ApiConfig }
    const result = await buildDashboardData(body.config)
    return NextResponse.json(result.payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load dashboard data"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}