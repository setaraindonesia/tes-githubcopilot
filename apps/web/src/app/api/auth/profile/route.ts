import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token autentikasi diperlukan' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const raw = process.env.NEXT_PUBLIC_AUTH_API_URL as string
    if (!raw) {
      return NextResponse.json(
        { message: 'Auth service URL tidak dikonfigurasi' },
        { status: 500 }
      )
    }

    const base = raw.replace(/\/+$/, '')
    const authBase = base.endsWith('/api/v1') ? base : `${base}/api/v1`
    const targetUrl = `${authBase}/auth/profile`

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return NextResponse.json(data)
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil profile' },
      { status: 500 }
    )
  }
}
