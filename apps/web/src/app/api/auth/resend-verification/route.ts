import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { message: 'Email wajib diisi' },
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

    const response = await fetch(`${authServiceUrl}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return NextResponse.json({
        message: data?.message || 'Email verifikasi telah dikirim ulang'
      })
    }

    return NextResponse.json(
      { message: data?.message || 'Gagal mengirim email verifikasi' },
      { status: response.status || 500 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengirim email verifikasi' },
      { status: 500 }
    )
  }
}
