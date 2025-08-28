'use client'

import React, { useState } from 'react'
import { useAddress, useBalance, useContract, useContractRead } from "@thirdweb-dev/react";
import { THIRDWEB_CONFIG } from '@/config/thirdweb'
import { TrendingUp, Wallet as WalletIcon, Send, Download, RefreshCw, Plus, ArrowRight } from 'lucide-react'
import { USDCIcon, USDTIcon, ETHIcon, SetaraIcon } from '@/components/icons/CryptoIcons'
import Image from 'next/image'

// Mock data for development (replace with real contract calls later)
const MOCK_BALANCES = {
  usdc: 1250.50,
  usdt: 890.25,
  eth: 0.0456,
  setara: 12500
}

const MultiCurrencyWallet: React.FC = () => {
  const address = useAddress();
  const { data: ethBalance, error: ethError } = useBalance();
  const { contract: tokenContract } = useContract(THIRDWEB_CONFIG.TOKEN.address);
  const { data: tokenBalance, error: tokenError } = useContractRead(tokenContract, "balanceOf", [address]);
  const [selectedCurrency, setSelectedCurrency] = useState<'usdc' | 'usdt' | 'eth' | 'setara'>('usdc')

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

  const getCurrencyInfo = (currency: string) => {
    switch (currency) {
      case 'usdc':
        return { name: 'USD Coin', symbol: 'USDC', color: 'green', icon: USDCIcon, network: 'Base Network' }
      case 'usdt':
        return { name: 'Tether USD', symbol: 'USDT', color: 'blue', icon: USDTIcon, network: 'Base Network' }
      case 'eth':
        return { name: 'Ethereum', symbol: 'ETH', color: 'purple', icon: ETHIcon, network: 'Base Network' }
      case 'setara':
        return { name: 'SETARA Points', symbol: 'POINTS', color: 'amber', icon: SetaraIcon, network: 'Loyalty System' }
      default:
        return { name: 'Unknown', symbol: 'UNK', color: 'gray', icon: WalletIcon, network: 'Unknown' }
    }
  }

  if (!address) {
    return (
      <div className="space-y-4">
        {/* Connect Wallet Prompt */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WalletIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 text-sm mb-4">Connect your wallet to view your multi-currency balances</p>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200">
            Connect Wallet
          </button>
        </div>

        {/* Currency Preview */}
        <div className="grid grid-cols-2 gap-3">
          {['usdc', 'usdt', 'eth', 'setara'].map((currency) => {
            const info = getCurrencyInfo(currency)
            return (
              <div key={currency} className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <div className={`w-10 h-10 bg-${info.color}-100 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <info.icon className={`w-5 h-5 text-${info.color}-600`} />
                </div>
                <div className="text-sm font-medium text-gray-900">{info.name}</div>
                <div className="text-xs text-gray-500">{info.network}</div>
                <div className="text-lg font-bold text-gray-400 mt-1">--</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Portfolio</h3>
              <p className="text-sm text-gray-600">Multi-Currency Balance</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">$2,141.31</div>
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              +5.2% (24h)
            </div>
          </div>
        </div>
      </div>

      {/* Currency Selection Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {['usdc', 'usdt', 'eth', 'setara'].map((currency) => {
            const info = getCurrencyInfo(currency)
            const isSelected = selectedCurrency === currency
            return (
              <button
                key={currency}
                onClick={() => setSelectedCurrency(currency as any)}
                className={`flex-1 py-3 px-4 text-center transition-all duration-200 ${
                  isSelected 
                    ? `bg-${info.color}-50 text-${info.color}-700 border-b-2 border-${info.color}-500` 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4">
                    <info.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{info.symbol}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Currency Details */}
        <div className="p-6">
          {(() => {
            const info = getCurrencyInfo(selectedCurrency)
            const balance = MOCK_BALANCES[selectedCurrency as keyof typeof MOCK_BALANCES]
            
            return (
              <div className="space-y-6">
                {/* Balance Display */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {selectedCurrency === 'setara' 
                      ? formatSetaraPoints(balance) 
                      : selectedCurrency === 'eth' 
                        ? balance.toFixed(4)
                        : formatFiatBalance(balance)
                    }
                  </div>
                  <div className="text-lg text-gray-600 mb-1">{info.name}</div>
                  <div className="text-sm text-gray-500">{info.network}</div>
                  {selectedCurrency === 'setara' && (
                    <div className="text-sm text-amber-600 mt-2">
                      Worth $143.75 • Exchange Rate: 1 Point = $0.0115
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium transition-colors border border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Send
                    </div>
                  </button>
                  <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium transition-colors border border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Receive
                    </div>
                  </button>
                  <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium transition-colors border border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                                          <RefreshCw className="w-4 h-4" />
                    Swap
                    </div>
                  </button>
                </div>

                {/* Network Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8">
                        <info.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{info.name}</div>
                        <div className="text-sm text-gray-500">{info.network}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Network Fee</div>
                      <div className="font-medium text-gray-900">
                        {selectedCurrency === 'setara' ? 'Free' : '$0.50'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* All Balances Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3">All Balances</h4>
        <div className="space-y-2">
          {['usdc', 'usdt', 'eth', 'setara'].map((currency) => {
            const info = getCurrencyInfo(currency)
            const balance = MOCK_BALANCES[currency as keyof typeof MOCK_BALANCES]
            const isSelected = selectedCurrency === currency
            
            return (
              <button
                key={currency}
                onClick={() => setSelectedCurrency(currency as any)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  isSelected 
                    ? `bg-${info.color}-50 border border-${info.color}-200` 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8">
                    <info.icon className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{info.name}</div>
                    <div className="text-xs text-gray-500">{info.network}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {currency === 'setara' 
                        ? formatSetaraPoints(balance)
                        : currency === 'eth' 
                          ? balance.toFixed(4)
                          : formatFiatBalance(balance)
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {currency === 'setara' ? 'Points' : info.symbol}
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform ${
                    isSelected ? 'rotate-90' : ''
                  }`} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 px-4 rounded-lg text-sm font-medium transition-colors border border-indigo-200">
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add Funds
          </div>
        </button>
        <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-3 px-4 rounded-lg text-sm font-medium transition-colors border border-emerald-200">
          <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4" />
                  Exchange
          </div>
        </button>
      </div>
    </div>
  )
}

export default MultiCurrencyWallet
