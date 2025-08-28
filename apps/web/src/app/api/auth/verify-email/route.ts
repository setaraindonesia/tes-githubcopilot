import { NextRequest, NextResponse } from 'next/server'

// Mock users storage (in real app, this would be database)
const mockUsers: any[] = []

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

    // Find user by token (mock)
    const userIndex = mockUsers.findIndex(user => user.emailVerificationToken === token)
    if (userIndex === -1) {
      return NextResponse.json(
        { message: 'Token verifikasi tidak valid atau sudah digunakan' },
        { status: 404 }
      )
    }

    // Update user email verification status
    mockUsers[userIndex].emailVerified = true
    mockUsers[userIndex].emailVerificationToken = null

    console.log('✅ Email verified for:', mockUsers[userIndex].email)

    return NextResponse.json({
      message: 'Email berhasil diverifikasi!'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat verifikasi email' },
      { status: 500 }
    )
  }
}
