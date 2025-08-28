import { NextRequest, NextResponse } from 'next/server'

// Mock user storage (in real app, this would be database)
const mockUsers: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // Validation
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

    // Check if username already exists
    const existingUserByUsername = mockUsers.find(user => user.username === username)
    if (existingUserByUsername) {
      return NextResponse.json(
        { message: 'Username sudah digunakan', field: 'username' },
        { status: 409 }
      )
    }

    // Check if email already exists
    const existingUserByEmail = mockUsers.find(user => user.email === email)
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'Email sudah digunakan', field: 'email' },
        { status: 409 }
      )
    }

    // Create user (mock)
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      email,
      emailVerified: false,
      emailVerificationToken: `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString()
    }

    mockUsers.push(newUser)

    // Log untuk debugging
    console.log('📧 Mock Email Verification:')
    console.log(`To: ${email}`)
    console.log(`Subject: Verifikasi Email Setara DApps`)
    console.log(`Verification Link: http://localhost:3000/verify-email?token=${newUser.emailVerificationToken}`)
    console.log('---')

    return NextResponse.json({
      message: 'Registrasi berhasil! Silakan cek email untuk verifikasi.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        emailVerified: newUser.emailVerified
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}
