import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { message: 'Token verifikasi wajib diisi' },
        { status: 400 }
      )
    }

    // Proxy ke Auth Service di Railway
    const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_API_URL as string
    if (!authServiceUrl) {
      return NextResponse.json(
        { message: 'Auth service URL tidak dikonfigurasi' },
        { status: 500 }
      )
    }

    const response = await fetch(`${authServiceUrl}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return NextResponse.json({
        message: data?.message || 'Email berhasil diverifikasi!'
      })
    }

    return NextResponse.json(
      { message: data?.message || 'Token verifikasi tidak valid' },
      { status: response.status || 500 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat verifikasi email' },
      { status: 500 }
    )
  }
}
