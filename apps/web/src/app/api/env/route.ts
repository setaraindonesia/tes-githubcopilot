import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const enableWeb3 = process.env.NEXT_PUBLIC_ENABLE_WEB3
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
  const treasury = process.env.NEXT_PUBLIC_TREASURY_ADDRESS

  return NextResponse.json({
    NEXT_PUBLIC_ENABLE_WEB3: enableWeb3 ?? null,
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID: clientId ?? null,
    NEXT_PUBLIC_TREASURY_ADDRESS: treasury ?? null,
  })
}


