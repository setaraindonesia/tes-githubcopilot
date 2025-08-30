import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Proxy to Railway Auth Service
    const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_API_URL as string
    if (!authServiceUrl) {
      return NextResponse.json(
        { message: 'Auth service URL tidak dikonfigurasi' },
        { status: 500 }
      )
    }

    const response = await fetch(`${authServiceUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: username, password })
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return NextResponse.json({
        message: data?.message || 'Login berhasil',
        token: data?.token,
        user: data?.user
      })
    }

    return NextResponse.json(
      { message: data?.message || 'Username atau password salah' },
      { status: response.status || 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}
