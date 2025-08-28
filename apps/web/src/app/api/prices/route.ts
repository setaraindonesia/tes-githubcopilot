import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Cache in-memory (per server instance)
let cache: { data: any; ts: number } | null = null
const CACHE_MS = Number(process.env.PRICE_CACHE_MS || 300_000) // default 5m

async function withTimeout<T>(p: Promise<T>, ms = 1500): Promise<T> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    // @ts-ignore
    const res = await p
    return res
  } catch (e) {
    throw e
  } finally {
    clearTimeout(t)
  }
}

function buildIds() {
  const baseIds = ['ethereum', 'usd-coin', 'tether']
  const goldProxy = process.env.GOLD_PROXY_ID || 'pax-gold' // e.g., 'pax-gold' (PAXG) or 'tether-gold'
  if (goldProxy) baseIds.push(goldProxy)
  return { ids: baseIds, goldProxy }
}

async function fetchCoinGecko(idStr: string, apiKey?: string) {
  const base = apiKey ? 'https://pro-api.coingecko.com' : 'https://api.coingecko.com'
  const url = `${base}/api/v3/simple/price?ids=${encodeURIComponent(idStr)}&vs_currencies=idr&include_24hr_change=true`
  const res = await fetch(url, {
    headers: apiKey ? { 'x-cg-pro-api-key': apiKey } : {},
    // avoid Next caching
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('coingecko_failed')
  return res.json()
}

async function fetchGoldIdr() {
  // Simple free source fallback via metals-api compatible demo (user should replace with real key)
  const key = process.env.METALS_API_KEY
  if (!key) return null
  const url = `https://api.metals.dev/v1/latest?api_key=${key}&base=XAU&symbols=IDR,USD`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null
  const json = await res.json()
  // Expect rates like { rates: { IDR: x, USD: y } }
  const idrPerTroyOunce = json?.rates?.IDR
  if (!idrPerTroyOunce) return null
  // 1 troy ounce = 31.1035 grams
  const idrPerGram = idrPerTroyOunce / 31.1035
  return { idrPerGram }
}

async function fetchPagxStr() {
  // Fetch STR price from PAGX API (placeholder - replace with actual PAGX endpoint)
  const pagxApiKey = process.env.PAGX_API_KEY
  if (!pagxApiKey) return null
  
  try {
    // Replace with actual PAGX API endpoint
    const url = `https://api.pagx.io/v1/price/STR?api_key=${pagxApiKey}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    
    // Adjust based on actual PAGX API response format
    return {
      idr: json?.price?.idr ?? 1, // fallback to 1 IDR
      change24h: json?.change_24h ?? 0
    }
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const now = Date.now()
    if (cache && now - cache.ts < CACHE_MS) {
      return NextResponse.json(cache.data, { headers: { 'Cache-Control': 'public, max-age=30' } })
    }

    const cgKey = process.env.COINGECKO_API_KEY
    const { ids, goldProxy } = buildIds()
    const [cg, gold, pagxStr] = await Promise.all([
      fetchCoinGecko(ids.join(','), cgKey).catch(() => null),
      fetchGoldIdr().catch(() => null),
      fetchPagxStr().catch(() => null),
    ])

    // Compute STR from gold source
    const paxgIdr = goldProxy && cg?.[goldProxy]?.idr
    const paxgChange = goldProxy && cg?.[goldProxy]?.idr_24h_change
    // 1 PAXG/XAUT ~ 1 troy ounce. Convert to per gram when pegging to mg.
    const pegMode = (process.env.STR_PEG_MODE || 'mg').toLowerCase() // 'mg' | 'idr'
    const pegMg = Number(process.env.STR_PEG_MG || 1) // 1 mg default
    const strFromGoldMg = paxgIdr ? (paxgIdr / 31.1035) * (pegMg / 1000) : null
    const strFromGoldIdr = 1 // 1 STR = Rp1

    const goldPerGramIdr = (gold && gold.idrPerGram) || (paxgIdr ? paxgIdr / 31.1035 : null)

    const data = {
      prices: {
        eth: {
          idr: cg?.ethereum?.idr ?? null,
          change24h: cg?.ethereum?.idr_24h_change ?? null,
        },
        usdc: {
          idr: cg?.['usd-coin']?.idr ?? null,
          change24h: cg?.['usd-coin']?.idr_24h_change ?? null,
        },
        usdt: {
          idr: cg?.tether?.idr ?? null,
          change24h: cg?.tether?.idr_24h_change ?? null,
        },
        str: {
          // Priority: PAGX API > gold peg > fallback 1 IDR
          idr: pagxStr?.idr ?? (pegMode === 'idr'
            ? strFromGoldIdr
            : (gold ? gold.idrPerGram * (pegMg / 1000) : null) ?? strFromGoldMg) ?? 1,
          change24h: pagxStr?.change24h ?? paxgChange ?? 0,
        },
      },
      goldPerGramIdr,
      goldProxyId: goldProxy,
      goldProxyIdr: paxgIdr ?? null,
      updatedAt: new Date().toISOString(),
    }

    cache = { data, ts: now }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'public, max-age=30' } })
  } catch (e) {
    return NextResponse.json({ error: 'failed_to_fetch_prices' }, { status: 500 })
  }
}


