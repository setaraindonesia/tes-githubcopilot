import { NextRequest, NextResponse } from 'next/server'

// Mock users storage (in real app, this would be database)
const mockUsers: any[] = [
  {
    id: 'test_user_1',
    username: 'test_user',
    email: 'test@setaradapps.com',
    emailVerified: true
  },
  {
    id: 'alice_1',
    username: 'alice_setara',
    email: 'alice@setaradapps.com',
    emailVerified: true
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const { email } = params

    if (!email) {
      return NextResponse.json(
        { message: 'Email wajib diisi' },
        { status: 400 }
      )
    }

    // Check if email exists
    const existingUser = mockUsers.find(user => user.email === email)

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? 'Email sudah digunakan' : 'Email tersedia'
    })

  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengecek email' },
      { status: 500 }
    )
  }
}
