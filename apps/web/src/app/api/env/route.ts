import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const enableWeb3 = process.env.NEXT_PUBLIC_ENABLE_WEB3
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
  const treasury = process.env.NEXT_PUBLIC_TREASURY_ADDRESS
  const rawAuth = process.env.NEXT_PUBLIC_AUTH_API_URL as string | undefined
  const base = rawAuth ? rawAuth.replace(/\/+$/, '') : null
  const authBase = base ? (base.endsWith('/api/v1') ? base : `${base}/api/v1`) : null

  return NextResponse.json({
    NEXT_PUBLIC_ENABLE_WEB3: enableWeb3 ?? null,
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID: clientId ?? null,
    NEXT_PUBLIC_TREASURY_ADDRESS: treasury ?? null,
    NEXT_PUBLIC_AUTH_API_URL: rawAuth ?? null,
    NORMALIZED_AUTH_BASE: authBase,
  })
}


