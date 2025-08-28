'use client'

import { useState } from 'react'

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold" style={{ color: '#0066FF' }}>Setaradapps</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Features
              </a>
              <a href="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Login
              </a>
              <a href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Daftar
              </a>
              <a href="/test-auth" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Test Auth
              </a>
              <a href="/mobile-preview" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Mobile Preview
              </a>
              <a href="#marketplace" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Marketplace
              </a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contact
              </a>
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => {
                localStorage.setItem('auth', 'true');
                window.location.href = '/dashboard';
              }}
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              🔐 Sign In
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('auth', 'true');
                window.location.href = '/dashboard';
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              📝 Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2 rounded-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                Features
              </a>
              <a href="#marketplace" className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                Marketplace
              </a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                Contact
              </a>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <button 
                  onClick={() => {
                    localStorage.setItem('auth', 'true');
                    window.location.href = '/dashboard';
                  }}
                  className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left cursor-pointer"
                >
                  🔐 Sign In
                </button>
                <button 
                  onClick={() => {
                    localStorage.setItem('auth', 'true');
                    window.location.href = '/dashboard';
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left mt-2 cursor-pointer"
                >
                  📝 Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation

