'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'input'>('input')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const urlToken = searchParams.get('token')

  useEffect(() => {
    if (urlToken) {
      setToken(urlToken)
      verifyEmail(urlToken)
    }
  }, [urlToken])

  const verifyEmail = async (verificationToken: string) => {
    if (!verificationToken.trim()) {
      setStatus('error')
      setMessage('Token verifikasi wajib diisi')
      return
    }

    setIsVerifying(true)
    setStatus('loading')
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Email berhasil diverifikasi! Anda sekarang bisa login.')
      } else {
        setStatus('error')
        setMessage(data.message || 'Token verifikasi tidak valid')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Terjadi kesalahan saat verifikasi email')
    } finally {
      setIsVerifying(false)
    }
  }

  const resendVerification = async () => {
    if (!email) {
      alert('Masukkan email terlebih dahulu')
      return
    }

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Email verifikasi telah dikirim ulang! Silakan cek email Anda.')
      } else {
        alert(data.message || 'Gagal mengirim email verifikasi')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengirim email verifikasi')
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyEmail(token)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Setara DApps</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Verifikasi Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masukkan token verifikasi yang dikirim ke email Anda
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memverifikasi email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Email Terverifikasi!</h3>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Login Sekarang
                </button>
              </div>
            </div>
          )}

          {(status === 'error' || status === 'input') && (
            <div className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                  Token Verifikasi
                </label>
                <div className="mt-1">
                  <input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Masukkan token dari email"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Token dikirim ke email Anda saat registrasi
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isVerifying || !token.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Memverifikasi...' : 'Verifikasi Email'}
              </button>

              {status === 'error' && (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                    <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="mt-2 text-sm text-red-600">{message}</p>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Atau</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email untuk kirim ulang verifikasi
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <button
                  onClick={resendVerification}
                  disabled={isResending || !email.trim()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Mengirim...' : 'Kirim Ulang Verifikasi'}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => router.push('/login')}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  Kembali ke Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
