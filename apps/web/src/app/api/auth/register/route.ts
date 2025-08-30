import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // Validation (tetap di sisi Next.js agar UX cepat)
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Username, email, dan password wajib diisi' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { message: 'Username minimal 3 karakter', field: 'username' },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { message: 'Username hanya boleh huruf, angka, dan underscore', field: 'username' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Format email tidak valid', field: 'email' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password minimal 6 karakter', field: 'password' },
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

    const response = await fetch(`${authServiceUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return NextResponse.json({
        message: data?.message || 'Registrasi berhasil! Silakan cek email untuk verifikasi.',
        user: data?.user
      })
    }

    // Map beberapa error umum agar inline di form
    if (typeof data?.message === 'string') {
      if (data.message.includes('Username sudah digunakan')) {
        return NextResponse.json(
          { message: 'Username sudah digunakan', field: 'username' },
          { status: 409 }
        )
      }
      if (data.message.includes('Email sudah digunakan')) {
        return NextResponse.json(
          { message: 'Email sudah digunakan', field: 'email' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { message: data?.message || 'Terjadi kesalahan saat registrasi' },
      { status: response.status || 500 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}
