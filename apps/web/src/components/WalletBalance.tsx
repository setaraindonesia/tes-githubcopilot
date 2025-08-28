'use client'

import React from 'react'
import { useAddress, useBalance, useContract, useContractRead } from "@thirdweb-dev/react";
import { THIRDWEB_CONFIG } from '@/config/thirdweb'
import { TrendingUp, Wallet as WalletIcon } from 'lucide-react'
import { USDCIcon, USDTIcon, ETHIcon, SetaraIcon } from '@/components/icons/CryptoIcons'
import Image from 'next/image'

// Default balances: 0 in production (safety). Enable mocks in dev only.
const DEV_MOCK = (process.env.NEXT_PUBLIC_DEV_MOCK === '1') || (process.env.NODE_ENV !== 'production')
const MOCK_BALANCES = DEV_MOCK
  ? {
      usdc: 1250.50,
      usdt: 890.25,
      eth: 0.0456,
      setara: 1075432,
    }
  : {
      usdc: 0,
      usdt: 0,
      eth: 0,
      setara: 0,
    }

const WalletBalance: React.FC = () => {
  const address = useAddress();
  const { data: ethBalance, error: ethError } = useBalance();
  const { contract: tokenContract } = useContract(THIRDWEB_CONFIG.TOKEN.address);
  const { data: tokenBalance, error: tokenError } = useContractRead(tokenContract, "balanceOf", [address]);

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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatSetaraPoints = (points: number) => {
    return new Intl.NumberFormat('en-US').format(points)
  }

  if (!address) {
    return (
      <div className="space-y-3">
        {/* Portfolio Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-indigo-900">Total Portfolio</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-indigo-900">$0.00</div>
              <div className="text-xs text-indigo-600">Connect Wallet</div>
            </div>
          </div>
        </div>

        {/* Currency Preview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <div className="w-8 h-8 mx-auto mb-2">
              <USDCIcon className="w-8 h-8" />
            </div>
            <div className="text-sm font-medium text-gray-900">USDC</div>
            <div className="text-xs text-gray-500">Base Network</div>
            <div className="text-lg font-bold text-gray-400 mt-1">--</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <div className="w-8 h-8 mx-auto mb-2">
              <USDTIcon className="w-8 h-8" />
            </div>
            <div className="text-sm font-medium text-gray-900">USDT</div>
            <div className="text-xs text-gray-500">Base Network</div>
            <div className="text-lg font-bold text-gray-400 mt-1">--</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <div className="w-8 h-8 mx-auto mb-2">
              <ETHIcon className="w-8 h-8" />
            </div>
            <div className="text-sm font-medium text-gray-900">ETH</div>
            <div className="text-xs text-gray-500">Base Network</div>
            <div className="text-lg font-bold text-gray-400 mt-1">--</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <div className="w-8 h-8 mx-auto mb-2">
              <SetaraIcon className="w-8 h-8" />
            </div>
            <div className="text-sm font-medium text-gray-900">SETARA</div>
            <div className="text-xs text-gray-500">Loyalty System</div>
            <div className="text-lg font-bold text-gray-400 mt-1">--</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-indigo-900">Total Portfolio</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-indigo-900">$2,141.31</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              +5.2% (24h)
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Currency Balances */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">💱 Multi-Currency Balances</div>
        
        {/* USDC */}
        <div className="flex justify-between items-center bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              <USDCIcon className="w-8 h-8" />
            </div>
            <div>
              <span className="font-medium text-green-700">USDC</span>
              <div className="text-xs text-green-600">Base Network</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-green-900">{formatFiatBalance(MOCK_BALANCES.usdc)}</div>
            <div className="text-xs text-green-600">USD Coin</div>
          </div>
        </div>
        
        {/* USDT */}
        <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              <USDTIcon className="w-8 h-8" />
            </div>
            <div>
              <span className="font-medium text-blue-700">USDT</span>
              <div className="text-xs text-blue-600">Base Network</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-blue-900">{formatFiatBalance(MOCK_BALANCES.usdt)}</div>
            <div className="text-xs text-blue-600">Tether USD</div>
          </div>
        </div>

        {/* ETH Base */}
        <div className="flex justify-between items-center bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              <ETHIcon className="w-8 h-8" />
            </div>
            <div>
              <span className="font-medium text-purple-700">ETH</span>
              <div className="text-xs text-purple-600">Base Network</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-purple-900">{formatBalance(ethBalance, ethError)}</div>
            <div className="text-xs text-purple-600">Ethereum (Base)</div>
          </div>
        </div>

        {/* SETARA Points */}
        <div className="flex justify-between items-center bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              <SetaraIcon className="w-8 h-8" />
            </div>
            <div>
              <span className="font-medium text-amber-700">SETARA Points</span>
              <div className="text-xs text-amber-600">Loyalty System</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-amber-900">{formatSetaraPoints(MOCK_BALANCES.setara)}</div>
            <div className="text-xs text-amber-600">{MOCK_BALANCES.setara ? `Worth ${formatFiatBalance(0)}` : 'Worth $0.00'}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors border border-indigo-200">
          💸 Send
        </button>
        <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors border border-emerald-200">
          📥 Receive
        </button>
      </div>
    </div>
  )
}

export default WalletBalance
