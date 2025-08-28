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
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json(
        { message: 'Username wajib diisi' },
        { status: 400 }
      )
    }

    // Check if username exists
    const existingUser = mockUsers.find(user => user.username === username)

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? 'Username sudah digunakan' : 'Username tersedia'
    })

  } catch (error) {
    console.error('Check username error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengecek username' },
      { status: 500 }
    )
  }
}
