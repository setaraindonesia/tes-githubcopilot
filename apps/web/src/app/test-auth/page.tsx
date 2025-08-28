'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TestAuth() {
  const [testResults, setTestResults] = useState<{[key: string]: string}>({})

  const runTest = async (testName: string, endpoint: string, method: string = 'GET', body?: any) => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      })
      
      const data = await response.json()
      
      setTestResults(prev => ({
        ...prev,
        [testName]: response.ok ? '✅ Success' : `❌ Error: ${data.message}`
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: `❌ Error: ${error}`
      }))
    }
  }

  const testRegistration = () => {
    runTest('Registration', '/api/auth/register', 'POST', {
      username: 'test_user_' + Date.now(),
      email: 'test@example.com',
      password: 'password123'
    })
  }

  const testLogin = () => {
    runTest('Login', '/api/auth/login', 'POST', {
      username: 'test_user',
      password: 'password123'
    })
  }

  const testUsernameCheck = () => {
    runTest('Username Check', '/api/auth/check-username/test_user')
  }

  const testEmailCheck = () => {
    runTest('Email Check', '/api/auth/check-email/test@setaradapps.com')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Setara DApps</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Authentication System Test
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Test the mock authentication system without Docker
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Test Panel */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">API Tests</h3>
            
            <div className="space-y-4">
              <button
                onClick={testRegistration}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Test Registration
              </button>
              
              <button
                onClick={testLogin}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Test Login
              </button>
              
              <button
                onClick={testUsernameCheck}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Test Username Check
              </button>
              
              <button
                onClick={testEmailCheck}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
              >
                Test Email Check
              </button>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Test Results:</h4>
              <div className="space-y-2">
                {Object.entries(testResults).map(([test, result]) => (
                  <div key={test} className="text-sm">
                    <span className="font-medium">{test}:</span> {result}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions Panel */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Testing Instructions</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900">1. Registration Test</h4>
                <p className="text-gray-600">Test user registration with email validation</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">2. Login Test</h4>
                <p className="text-gray-600">Test login with pre-created test user</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">3. Username Check</h4>
                <p className="text-gray-600">Test username availability check</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">4. Email Check</h4>
                <p className="text-gray-600">Test email availability check</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Manual Testing:</h4>
              <div className="space-y-2 text-sm">
                <Link href="/register" className="block text-blue-600 hover:text-blue-800">
                  → Test Registration Page
                </Link>
                <Link href="/login" className="block text-blue-600 hover:text-blue-800">
                  → Test Login Page
                </Link>
                <Link href="/verify-email" className="block text-blue-600 hover:text-blue-800">
                  → Test Email Verification
                </Link>
                <Link href="/dashboard" className="block text-blue-600 hover:text-blue-800">
                  → Test Dashboard (requires login)
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Console Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Console Testing</h3>
          <p className="text-sm text-yellow-700">
            For email verification testing, open browser console (F12) and look for mock email logs when registering.
            The verification link will be displayed in the console.
          </p>
        </div>

        {/* Test Credentials */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Test Credentials</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Username:</strong> test_user</p>
            <p><strong>Password:</strong> password123</p>
            <p><strong>Email:</strong> test@setaradapps.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
