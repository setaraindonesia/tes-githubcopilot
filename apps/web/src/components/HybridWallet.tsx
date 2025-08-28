'use client'

import React, { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  Wallet as WalletIcon, 
  Send, 
  Download, 
  RefreshCw, 
  Plus, 
  ArrowRight,
  CreditCard,
  Users,
  Coins,
  Building2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { USDCIcon, USDTIcon, ETHIcon, SetaraIcon } from '@/components/icons/CryptoIcons'

// Dev-only mock toggle: in production, all default amounts must be 0
const DEV_MOCK = (process.env.NEXT_PUBLIC_DEV_MOCK === '1') || (process.env.NODE_ENV !== 'production')

// Mock data for Web2 balance / holdings (for overview rendering only)
const MOCK_WEB2_BALANCE = {
  total: DEV_MOCK ? 2141.31 : 0,
  setara_points: DEV_MOCK ? 12500 : 0,
}

// Mock token holdings (quantity) and IDR prices for overview rows
const MOCK_HOLDINGS = {
  usdc: DEV_MOCK ? 0.0005 : 0,
  usdt: 0,
  str: DEV_MOCK ? 2000000 : 0,
}

const MOCK_PRICES_IDR = {
  usdc: 16227.1,
  usdt: 16227.1,
  str: 1, // 1 IDR = 1 STR
}

const MOCK_CHANGE_24H = {
  usdc: 0.0,
  usdt: 0.0,
  str: 5.23,
}

// Mock data for Web3 treasury (blockchain)
const MOCK_WEB3_BALANCE = {
  usdc: 0,
  usdt: 0,
  eth: 0
}

const HybridWallet: React.FC = () => {
  // Web2-only: remove on-chain hooks; keep UI and live fiat pricing

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

  const formatIdr = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 }).format(amount)
  }

  const changeClass = (v: number) => v > 0 ? 'text-emerald-600' : v < 0 ? 'text-rose-600' : 'text-gray-500'

  // Live prices (optional override) with visibility-aware lazy fetch and optional polling
  const [live, setLive] = useState<{ prices?: any } | null>(null)
  const pollMs = Number(process.env.NEXT_PUBLIC_PRICES_POLL_MS || 0)
  const disablePrices = (process.env.NEXT_PUBLIC_DISABLE_PRICES === '1')
  const clientPegMode = (process.env.NEXT_PUBLIC_STR_PEG_MODE || '').toLowerCase()
  const [lsOverride, setLsOverride] = useState<number>(0)

  useEffect(() => {
    let mounted = true
    let timer: any = null

    const load = () => {
      fetch('/api/prices', { cache: 'no-store' })
        .then(r => (r.ok ? r.json() : null))
        .then(d => { if (mounted && d) setLive(d) })
        .catch(() => {})
    }

    const startPolling = () => {
      if (pollMs > 0 && !timer) {
        timer = setInterval(() => {
          if (document.visibilityState === 'visible') load()
        }, pollMs)
      }
    }

    const stopPolling = () => { if (timer) { clearInterval(timer); timer = null } }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        load()
        startPolling()
      } else {
        stopPolling()
      }
    }

    // initial
    if (!disablePrices) {
      if (typeof document !== 'undefined') {
        if (document.visibilityState === 'visible') load()
        document.addEventListener('visibilitychange', onVisibility)
      } else {
        load()
      }
      startPolling()
    }

    return () => {
      mounted = false
      stopPolling()
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [pollMs, disablePrices])

  // Read localStorage override for STR amount (no restart needed)
  useEffect(() => {
    try {
      if (DEV_MOCK && typeof window !== 'undefined') {
        const v = Number(localStorage.getItem('STR_AMOUNT_OVERRIDE') || 0)
        if (!Number.isNaN(v) && v > 0) setLsOverride(v)
      }
    } catch {}
  }, [])

  const price = {
    usdc: live?.prices?.usdc?.idr ?? MOCK_PRICES_IDR.usdc,
    usdt: live?.prices?.usdt?.idr ?? MOCK_PRICES_IDR.usdt,
    str: live?.prices?.str?.idr ?? 1, // API price or fallback to 1 IDR = 1 STR
  }
  const change = {
    usdc: live?.prices?.usdc?.change24h ?? 0,
    usdt: live?.prices?.usdt?.change24h ?? 0,
    str:  live?.prices?.str?.change24h  ?? MOCK_CHANGE_24H.str,
  }

  // STR amount override: env first, then localStorage STR_AMOUNT_OVERRIDE, else gold price per gram, else mock
  const envOverride = Number(process.env.NEXT_PUBLIC_STR_AMOUNT_OVERRIDE || 0)
  const strOverride = DEV_MOCK ? (envOverride > 0 ? envOverride : lsOverride) : 0
  const strAmount = strOverride > 0
    ? Math.round(strOverride)
    : MOCK_HOLDINGS.str

  // Calculate token amounts to match MOCK_WEB2_BALANCE.total (2141.31 USD)
  const targetTotalUSD = MOCK_WEB2_BALANCE.total
  const usdToIdrRate = price.usdc // USDC price in IDR (≈16,227) represents USD/IDR rate
  
  // Convert STR value from IDR to USD: 2,000,000 IDR / 16,227 ≈ $123.28
  const strValueUSD = (strAmount * price.str) / usdToIdrRate
  const remainingValueUSD = Math.max(0, targetTotalUSD - strValueUSD)
  
  // Split remaining USD value between USDC and USDT (70% USDC, 30% USDT)
  // USDC ≈ $1, USDT ≈ $1
  const adjustedUSDC = remainingValueUSD * 0.7
  const adjustedUSDT = remainingValueUSD * 0.3
  
  // Calculate actual total in USD
  const totalValueUSD = adjustedUSDC + adjustedUSDT + strValueUSD

  // Debug info (remove in production)
  if (typeof window !== 'undefined' && window.console) {
    console.log('STR Debug:', {
      envOverride,
      lsOverride,
      strOverride,
      strAmount,
      mockStr: MOCK_HOLDINGS.str
    })
    console.log('Portfolio Balance (USD):', {
      targetTotalUSD,
      usdToIdrRate,
      strAmount,
      strPriceIDR: price.str,
      strValueUSD,
      remainingValueUSD,
      adjustedUSDC,
      adjustedUSDT,
      usdcValueIDR: adjustedUSDC * price.usdc,
      usdtValueIDR: adjustedUSDT * price.usdt,
      calculatedTotalUSD: totalValueUSD
    })
  }

  return (
    <div className="space-y-6">

      {/* Assets - Clean Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Assets</h3>
            <span className="text-sm text-gray-500">Web2</span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-50">
          {/* USDC */}
          <div className="p-4 hover:bg-gray-25 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <USDCIcon className="w-10 h-10" />
                <div>
                  <div className="font-semibold text-gray-900">USDC</div>
                  <div className="text-sm text-gray-500">
                    {formatIdr(price.usdc)}
                    <span className={`ml-2 ${changeClass(change.usdc)}`}>
                      {change.usdc.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{adjustedUSDC <= 0 ? '0' : adjustedUSDC < 0.0001 ? '<0.0001' : adjustedUSDC.toFixed(4)}</div>
                <div className="text-sm text-gray-500">{formatIdr(adjustedUSDC * price.usdc)}</div>
              </div>
            </div>
          </div>

          {/* USDT */}
          <div className="p-4 hover:bg-gray-25 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <USDTIcon className="w-10 h-10" />
                <div>
                  <div className="font-semibold text-gray-900">USDT</div>
                  <div className="text-sm text-gray-500">
                    {formatIdr(price.usdt)}
                    <span className={`ml-2 ${changeClass(change.usdt)}`}>
                      {change.usdt.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{adjustedUSDT <= 0 ? '0' : adjustedUSDT < 0.0001 ? '<0.0001' : adjustedUSDT.toFixed(4)}</div>
                <div className="text-sm text-gray-500">{formatIdr(adjustedUSDT * price.usdt)}</div>
              </div>
            </div>
          </div>

          {/* SETARA Points */}
          <div className="p-4 hover:bg-gray-25 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SetaraIcon className="w-10 h-10" />
                <div>
                  <div className="font-semibold text-gray-900">STR</div>
                  <div className="text-sm text-gray-500">
                    {formatIdr(price.str)}
                    <span className={`ml-2 ${changeClass(change.str)}`}>
                      {change.str >= 0 ? '+' : ''}{change.str.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{formatSetaraPoints(strAmount)}</div>
                <div className="text-sm text-gray-500">{formatIdr(strAmount * (price.str || 1))}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Quick Actions - Clean */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h4 className="font-semibold text-gray-900">Quick Actions</h4>
          <p className="text-sm text-gray-500 mt-1">Transfer and manage your funds</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-gray-100 text-gray-700 py-4 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              <div className="flex items-center justify-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                Send
              </div>
            </button>
            <button className="bg-gray-100 text-gray-700 py-4 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              <div className="flex items-center justify-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                Receive
              </div>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium text-gray-900">Recent Activity</h5>
              <button className="text-gray-600 text-sm font-medium hover:text-gray-700">View All</button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Ahmad Rizki', amount: '-$150.00', time: '2 min ago', type: 'sent' },
                { name: 'Siti Nurhaliza', amount: '+$75.50', time: '1 hour ago', type: 'received' }
              ].map((tx, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{tx.name}</div>
                      <div className="text-sm text-gray-500">{tx.time}</div>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    tx.type === 'sent' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HybridWallet
