'use client'

import { FC, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const MobilePreview: FC = () => {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('auth')
      if (isAuth !== 'true') {
        router.push('/')
        return
      }
    }
  }, [router])



  const features = [
    { title: 'Marketplace', icon: '🛍️', desc: 'Buy & sell products' },
    { title: 'Wallet', icon: '💳', desc: 'Crypto & fiat payments' },
    { title: 'AI Assistant', icon: '🤖', desc: 'Smart recommendations' },
    { title: 'IoT Control', icon: '📱', desc: 'Device management' },
    { title: 'Chat', icon: '💬', desc: 'Real-time messaging' },
    { title: 'Analytics', icon: '📊', desc: 'Business insights' },
  ];

  const stats = [
    { label: 'Total Sales', value: '$234.5K', change: '+12%' },
    { label: 'Active Users', value: '12.8K', change: '+8%' },
    { label: 'Orders', value: '1,234', change: '+15%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      {/* Mobile Frame */}
      <div className="w-[375px] h-[812px] bg-white rounded-[40px] border-8 border-gray-800 overflow-hidden shadow-2xl relative">
        {/* Status Bar */}
        <div className="h-6 bg-black"></div>
        
        {/* Mobile Content */}
        <div className="h-full overflow-y-auto bg-gray-50">
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-5 bg-white">
            <div>
              <div className="text-sm text-gray-500 mb-1">Good Morning! 👋</div>
              <div className="text-xl font-bold text-gray-900">Setaradapps Dashboard</div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                onClick={() => {
                  console.log('Mobile logout clicked!')
                  localStorage.removeItem('auth')
                  console.log('Auth cleared!')
                }}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 transition-colors cursor-pointer"
              >
                Logout
              </a>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-3 px-5 py-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                <div className="text-lg font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                <div className="text-xs text-green-600 font-semibold">{stat.change}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="px-5 py-4">
            <div className="text-base font-bold text-gray-900 mb-4">Quick Actions</div>
            <div className="flex gap-3">
              <button className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg text-sm font-semibold">
                💰 New Payment
              </button>
              <button className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-lg text-sm font-semibold">
                📊 View Analytics
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="px-5 py-4">
            <div className="text-base font-bold text-gray-900 mb-4">Platform Features</div>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm text-center">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-sm font-bold text-gray-900 mb-1">{feature.title}</div>
                  <div className="text-xs text-gray-500">{feature.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="px-5 py-4">
            <div className="text-base font-bold text-gray-900 mb-4">Recent Activity</div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">Payment Received</div>
                  <div className="text-sm text-gray-500">$299.99 from John Doe</div>
                  <div className="text-xs text-gray-400">2 min ago</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">New Order</div>
                  <div className="text-sm text-gray-500">Order #12345 placed</div>
                  <div className="text-xs text-gray-400">15 min ago</div>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">AI Recommendation</div>
                  <div className="text-sm text-gray-500">Smart insights available</div>
                  <div className="text-xs text-gray-400">1 hour ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobilePreview
