'use client'

import { FC, useState } from 'react'
import { Home as HomeIcon, ShoppingBag, Car as CarIcon, WalletIcon } from 'lucide-react'

const Dashboard: FC = () => {
  const [activeBottomTab, setActiveBottomTab] = useState('home')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Content */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">Setara Dashboard</h1>
        
        {activeBottomTab === 'home' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Home</h2>
            <p className="text-gray-600">Welcome to Setara Dashboard</p>
          </div>
        )}

        {activeBottomTab === 'market' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Market</h2>
            <p className="text-gray-600">Marketplace coming soon</p>
          </div>
        )}

        {activeBottomTab === 'driver' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Driver</h2>
            <p className="text-gray-600">Driver services coming soon</p>
          </div>
        )}

        {activeBottomTab === 'wallet' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Wallet</h2>
            <p className="text-gray-600">Wallet features working!</p>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Rp 2.450.000</div>
              <div className="text-sm text-green-600">Total Balance</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'home', icon: HomeIcon, label: 'Home' },
            { id: 'market', icon: ShoppingBag, label: 'Market' },
            { id: 'driver', icon: CarIcon, label: 'Driver' },
            { id: 'wallet', icon: WalletIcon, label: 'Wallet' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveBottomTab(tab.id)}
              className={`flex flex-col items-center py-1 px-2 transition-colors ${
                activeBottomTab === tab.id ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

