'use client'

import React, { useState } from 'react'
import { 
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building2,
  Smartphone,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Coins,
  Banknote
} from 'lucide-react'
import { USDCIcon, USDTIcon, ETHIcon, SetaraIcon } from '@/components/icons/CryptoIcons'

// Mock data for recent P2P transactions
const RECENT_P2P = [
  {
    id: '1',
    type: 'topup',
    method: 'Bank BCA',
    amount: 500.00,
    currency: 'USDC',
    status: 'completed',
    time: '1 hour ago',
    fee: 2.50
  },
  {
    id: '2',
    type: 'withdraw',
    method: 'Bank Mandiri',
    amount: 200.00,
    currency: 'USDT',
    status: 'pending',
    time: '3 hours ago',
    fee: 2.00
  },
  {
    id: '3',
    type: 'deposit_treasury',
    method: 'Web3 Treasury',
    amount: 1000.00,
    currency: 'USDC',
    status: 'completed',
    time: '1 day ago',
    fee: 0.50
  }
]

const P2PTopupWithdraw: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'topup' | 'withdraw' | 'history'>('topup')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'USDC' | 'USDT'>('USDC')
  const [bankMethod, setBankMethod] = useState<'bca' | 'mandiri' | 'bri' | 'bni'>('bca')

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'USDC': return <USDCIcon className="w-5 h-5" />
      case 'USDT': return <USDTIcon className="w-5 h-5" />
      default: return <USDCIcon className="w-5 h-5" />
    }
  }

  const getBankIcon = (bank: string) => {
    const bankColors: { [key: string]: string } = {
      bca: 'bg-blue-500',
      mandiri: 'bg-yellow-500', 
      bri: 'bg-blue-600',
      bni: 'bg-orange-500'
    }
    return bankColors[bank] || 'bg-gray-500'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation - Clean */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'topup', label: 'Deposit', icon: ArrowDownLeft },
            { key: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
            { key: 'history', label: 'History', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-4 px-4 text-center transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-gray-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'topup' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Deposit Funds</h3>
                <p className="text-gray-600">Add funds to your Setara account</p>
              </div>

              {/* Deposit Methods */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Bank Transfer</h4>
                      <p className="text-sm text-gray-600">Instant deposit via bank transfer</p>
                    </div>
                  </div>

                  {/* Bank Selection */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Select Bank</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'bca', name: 'BCA', color: 'bg-blue-500' },
                          { key: 'mandiri', name: 'Mandiri', color: 'bg-yellow-500' },
                          { key: 'bri', name: 'BRI', color: 'bg-blue-600' },
                          { key: 'bni', name: 'BNI', color: 'bg-orange-500' }
                        ].map((bank) => (
                          <button
                            key={bank.key}
                            onClick={() => setBankMethod(bank.key as any)}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                              bankMethod === bank.key
                                ? 'bg-gray-100 border-gray-300 text-gray-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-8 h-8 ${bank.color} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                              {bank.name.charAt(0)}
                            </div>
                            <span className="font-medium">{bank.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="block w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 focus:border-gray-400 text-lg font-medium"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <span className="text-gray-500 font-medium">USD</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">Fee: $2.50 • Min: $10 • Max: $10,000</div>
                    </div>

                    <button className="w-full bg-gray-700 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-center gap-2">
                        <ArrowDownLeft className="w-5 h-5" />
                        Deposit via Bank
                      </div>
                    </button>
                  </div>
                </div>

                {/* Treasury Deposit */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Coins className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Treasury Deposit</h4>
                      <p className="text-sm text-gray-600">Move funds to blockchain treasury</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Currency Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Select Currency</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['USDC', 'USDT'].map((curr) => (
                          <button
                            key={curr}
                            onClick={() => setCurrency(curr as any)}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-colors ${
                              currency === curr
                                ? 'bg-gray-100 border-gray-300 text-gray-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {getCurrencyIcon(curr)}
                            <span className="font-medium">{curr}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button className="w-full bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-center gap-2">
                        <Coins className="w-5 h-5" />
                        Deposit to Treasury
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Withdraw Funds</h3>
                <p className="text-gray-600">Transfer funds to your bank account</p>
              </div>

              {/* Withdraw Methods */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Bank Withdrawal</h4>
                      <p className="text-sm text-gray-600">Transfer to your bank account</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0.00"
                          className="block w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 focus:border-gray-400 text-lg font-medium"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <span className="text-gray-500 font-medium">USD</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">Fee: $2.00 • Min: $10 • Processing: 1-3 business days</div>
                    </div>
                    
                    <button className="w-full bg-gray-700 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-center gap-2">
                        <ArrowUpRight className="w-5 h-5" />
                        Withdraw to Bank
                      </div>
                    </button>
                  </div>
                </div>

                {/* Treasury Withdraw */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Coins className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Treasury Withdrawal</h4>
                      <p className="text-sm text-gray-600">Transfer from blockchain treasury</p>
                    </div>
                  </div>

                  <button className="w-full bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-center gap-2">
                      <Coins className="w-5 h-5" />
                      Withdraw from Treasury
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transaction History</h3>
                <p className="text-gray-600">Your deposit and withdrawal activity</p>
              </div>

              {/* Transaction History */}
              <div className="space-y-3">
                {RECENT_P2P.map((tx) => (
                  <div key={tx.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          tx.type === 'topup' ? 'bg-green-50' : 
                          tx.type === 'withdraw' ? 'bg-red-50' : 'bg-blue-50'
                        }`}>
                          {tx.type === 'topup' ? (
                            <ArrowDownLeft className={`w-6 h-6 ${
                              tx.type === 'topup' ? 'text-green-600' : 
                              tx.type === 'withdraw' ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          ) : tx.type === 'withdraw' ? (
                            <ArrowUpRight className="w-6 h-6 text-red-600" />
                          ) : (
                            <Coins className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {tx.type === 'topup' ? 'Deposit' : 
                             tx.type === 'withdraw' ? 'Withdraw' : 'Treasury Deposit'}
                          </div>
                          <div className="text-sm text-gray-500">{tx.method}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(tx.status)}
                            <span className="text-sm text-gray-500 capitalize">{tx.status}</span>
                            <span className="text-sm text-gray-400">• {tx.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          tx.type === 'withdraw' ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {tx.type === 'withdraw' ? '-' : '+'}{formatAmount(tx.amount)}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-sm text-gray-500 mt-1">
                          {getCurrencyIcon(tx.currency)}
                          <span>{tx.currency}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Fee: {formatAmount(tx.fee)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button className="text-gray-600 font-medium hover:text-gray-700">
                  View All Transactions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default P2PTopupWithdraw
