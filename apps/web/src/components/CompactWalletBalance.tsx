'use client'

import React from 'react'
import { useAddress, useBalance } from "@thirdweb-dev/react";
import { Wallet as WalletIcon } from 'lucide-react'
import { USDCIcon, USDTIcon, ETHIcon, SetaraIcon } from '@/components/icons/CryptoIcons'

// Mock data for development (replace with real contract calls later)
const MOCK_BALANCES = {
  usdc: 1250.50,
  usdt: 890.25,
  eth: 0.0456,
  setara: 12500
}

const CompactWalletBalance: React.FC = () => {
  const address = useAddress();
  const { data: ethBalance, error: ethError } = useBalance();

  const formatBalance = (balance: any, error: any) => {
    if (error) return 'Error'
    if (!balance) return '0.000'
    try {
      const num = parseFloat(balance.displayValue)
      if (num < 0.001) return '< 0.001'
      return num.toFixed(3)
    } catch {
      return '0.000'
    }
  }

  const formatFiatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatSetaraPoints = (points: number) => {
    return new Intl.NumberFormat('en-US').format(points)
  }

  if (!address) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-gray-900">Wallet Balance</span>
          </div>
          <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
            Connect
          </button>
        </div>
        <div className="text-center py-4">
          <div className="text-2xl font-bold text-gray-400">$0</div>
          <div className="text-sm text-gray-500">Connect wallet to view balances</div>
        </div>
      </div>
    )
  }

  const totalValue = MOCK_BALANCES.usdc + MOCK_BALANCES.usdt + (MOCK_BALANCES.setara * 0.0115)

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-indigo-600" />
          <span className="font-medium text-gray-900">Wallet Balance</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{formatFiatBalance(totalValue)}</div>
          <div className="text-xs text-gray-500">Total Value</div>
        </div>
      </div>
      
      {/* Currency Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* USDC */}
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6">
              <USDCIcon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-green-700">USDC</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{formatFiatBalance(MOCK_BALANCES.usdc)}</div>
          <div className="text-xs text-green-600">Base Network</div>
        </div>

        {/* USDT */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6">
              <USDTIcon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-blue-700">USDT</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{formatFiatBalance(MOCK_BALANCES.usdt)}</div>
          <div className="text-xs text-blue-600">Base Network</div>
        </div>

        {/* ETH */}
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6">
              <ETHIcon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-purple-700">ETH</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{formatBalance(ethBalance, ethError)}</div>
          <div className="text-xs text-purple-600">Base Network</div>
        </div>

        {/* SETARA Points */}
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6">
              <SetaraIcon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-amber-700">Points</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{formatSetaraPoints(MOCK_BALANCES.setara)}</div>
          <div className="text-xs text-amber-600">Loyalty System</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3">
        <button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors border border-indigo-200">
          💸 Send
        </button>
        <button className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors border border-emerald-200">
          📥 Receive
        </button>
      </div>
    </div>
  )
}

export default CompactWalletBalance
