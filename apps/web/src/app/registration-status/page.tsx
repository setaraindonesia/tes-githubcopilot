'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegistrationStatus() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const resendVerification = async () => {
    if (!email) {
      setResendMessage('Email tidak ditemukan')
      return
    }

    setIsResending(true)
    setResendMessage('')
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage('✅ Email verifikasi telah dikirim ulang! Silakan cek email Anda.')
      } else {
        setResendMessage(`❌ ${data.message || 'Gagal mengirim email verifikasi'}`)
      }
    } catch (error) {
      setResendMessage('❌ Terjadi kesalahan saat mengirim email verifikasi')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Setara DApps</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Registrasi Berhasil!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Langkah terakhir: verifikasi email Anda
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900">Cek Email Anda</h3>
              <p className="mt-2 text-sm text-gray-600">
                Kami telah mengirim kode verifikasi 6 digit ke:
              </p>
              <p className="mt-1 text-sm font-medium text-indigo-600">
                {email}
              </p>
            </div>

            {/* Steps */}
            <div className="text-left bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Langkah selanjutnya:</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Buka email dari Setaradapps</li>
                <li>2. Salin kode verifikasi 6 digit</li>
                <li>3. Masukkan kode di halaman verifikasi</li>
                <li>4. Login dengan akun Anda</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Link
                href="/verify-email"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Masukkan Kode Verifikasi
              </Link>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Tidak menerima email?</span>
                </div>
              </div>

              <button
                onClick={resendVerification}
                disabled={isResending}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Mengirim...' : 'Kirim Ulang Kode'}
              </button>

              {resendMessage && (
                <div className={`text-sm p-3 rounded-md ${
                  resendMessage.startsWith('✅') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {resendMessage}
                </div>
              )}
            </div>

            {/* Back to Login */}
            <div className="text-center pt-4">
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Sudah punya akun? Login di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
