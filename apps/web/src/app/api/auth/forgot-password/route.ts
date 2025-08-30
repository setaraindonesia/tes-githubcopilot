import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body || {}

    if (!email) {
      return NextResponse.json(
        { message: 'Email wajib diisi' },
        { status: 400 }
      )
    }

    const raw = process.env.NEXT_PUBLIC_AUTH_API_URL as string
    if (!raw) {
      return NextResponse.json(
        { message: 'Auth service URL tidak dikonfigurasi' },
        { status: 500 }
      )
    }

    const base = raw.replace(/\/+$/, '')
    const authBase = base.endsWith('/api/v1') ? base : `${base}/api/v1`
    const targetUrl = `${authBase}/auth/forgot-password`

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    const text = await response.text().catch(() => '')
    let data: any = {}
    try { data = text ? JSON.parse(text) : {} } catch { data = { raw: text } }

    if (response.ok) {
      return NextResponse.json({ message: data?.message || 'Jika email terdaftar, instruksi reset telah dikirim.' })
    }

    return NextResponse.json({
      message: data?.message || 'Gagal meminta reset password',
      upstreamStatus: response.status,
      target: targetUrl,
      raw: data?.raw
    }, { status: response.status || 400 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat meminta reset password' },
      { status: 500 }
    )
  }
}


