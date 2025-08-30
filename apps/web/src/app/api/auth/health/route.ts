import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const raw = process.env.NEXT_PUBLIC_AUTH_API_URL as string
    if (!raw) {
      return NextResponse.json({ message: 'Auth service URL tidak dikonfigurasi' }, { status: 500 })
    }
    const base = raw.replace(/\/+$/, '')
    const authBase = base.endsWith('/api/v1') ? base : `${base}/api/v1`
    const targetUrl = `${authBase}/health`

    const response = await fetch(targetUrl)
    const text = await response.text().catch(() => '')
    let data: any = {}
    try { data = text ? JSON.parse(text) : {} } catch { data = { raw: text } }

    return NextResponse.json({ ok: response.ok, status: response.status, target: targetUrl, data })
  } catch (error) {
    return NextResponse.json({ ok: false, message: 'Health check failed' }, { status: 500 })
  }
}


