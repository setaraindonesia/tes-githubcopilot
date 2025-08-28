import { NextRequest, NextResponse } from 'next/server'

// Mock users untuk development testing
const mockUsers: any[] = [
  {
    id: 'user1',
    username: 'user1',
    email: 'user1@setaradapps.com',
    password: 'test123',
    emailVerified: true,
    role: 'USER',
    isActive: true
  },
  {
    id: 'user2',
    username: 'user2',
    email: 'user2@setaradapps.com',
    password: 'test123',
    emailVerified: true,
    role: 'USER',
    isActive: true
  }
]

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

    // Find user
    const user = mockUsers.find(u => u.username === username)
    if (!user) {
      return NextResponse.json(
        { message: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Check password (mock - in real app, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { message: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Akun Anda telah dinonaktifkan' },
        { status: 401 }
      )
    }

    // Generate mock JWT token
    const token = `mock_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    return NextResponse.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}
