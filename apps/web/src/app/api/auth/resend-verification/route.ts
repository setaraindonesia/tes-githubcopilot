import { NextRequest, NextResponse } from 'next/server'

// Mock users storage (in real app, this would be database)
const mockUsers: any[] = []

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

    // Find user by email
    const userIndex = mockUsers.findIndex(user => user.email === email)
    if (userIndex === -1) {
      return NextResponse.json(
        { message: 'Email tidak ditemukan' },
        { status: 404 }
      )
    }

    const user = mockUsers[userIndex]

    // Check if email already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email sudah diverifikasi' },
        { status: 409 }
      )
    }

    // Generate new verification token
    const newToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    mockUsers[userIndex].emailVerificationToken = newToken

    // Log untuk debugging
    console.log('📧 Mock Email Verification (Resend):')
    console.log(`To: ${email}`)
    console.log(`Subject: Verifikasi Email Setara DApps (Resend)`)
    console.log(`Verification Link: http://localhost:3000/verify-email?token=${newToken}`)
    console.log('---')

    return NextResponse.json({
      message: 'Email verifikasi telah dikirim ulang'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengirim email verifikasi' },
      { status: 500 }
    )
  }
}
