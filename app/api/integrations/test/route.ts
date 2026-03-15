import { NextResponse } from "next/server"
import { testProviderConnection } from "@/lib/server/dashboard-data"
import type { ApiConfig } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      provider?: "health" | "wallet"
      config?: ApiConfig
    }

    if (body.provider !== "health" && body.provider !== "wallet") {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
    }

    const status = await testProviderConnection(body.provider, body.config)
    return NextResponse.json(status, { status: status.isLive ? 200 : 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to test integration"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}