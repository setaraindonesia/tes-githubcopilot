"use client"

import { useState } from 'react'
import { ArrowLeftRight, Link2, Shield, Wallet, ArrowUpFromLine, Globe } from 'lucide-react'
import SimpleWalletConnect from '@/components/SimpleWalletConnect'
import WalletBalance from '@/components/WalletBalance'
import { THIRDWEB_CONFIG } from '@/config/thirdweb'

type Props = {
  onSwapToWeb2?: () => void
  treasuryAddress?: string
}

export default function Web3Hub({ onSwapToWeb2, treasuryAddress }: Props) {
  const [connected, setConnected] = useState(false)
  const resolvedTreasury = (treasuryAddress || THIRDWEB_CONFIG.TREASURY.address || '').trim()



  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Network</div>
          <div className="text-lg font-semibold text-gray-900">Base (Mainnet)</div>
        </div>
        <div className="px-3 py-1 text-xs rounded-full bg-white border border-indigo-200 text-indigo-700">EVM • Low Fees</div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-5 h-5 text-indigo-600" />
          <div className="font-semibold text-gray-900">Web3 Wallet</div>
        </div>
        <div className="text-sm text-gray-600 mb-3">
          Hubungkan dompet untuk melihat aset di jaringan Base (ETH, USDC, USDT).
        </div>
        <div onClick={() => setConnected(true)} className="text-center">
          <SimpleWalletConnect />
        </div>
      </div>

      {connected && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <div className="font-semibold text-gray-900">Aset Anda (Base)</div>
          </div>
          <WalletBalance />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onSwapToWeb2}
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Swap ke Web2
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
              <ArrowUpFromLine className="w-4 h-4" />
              Swap ke Web3
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-5 h-5 text-gray-600" />
          <div className="font-semibold text-gray-900">Treasury Wallet</div>
        </div>
        <div className="text-sm text-gray-600 mb-3">
          Dompet multi-sig untuk menampung aset on-chain (RWA & treasury operasional).
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 break-all">
          <div className="text-xs text-gray-500 mb-1">Alamat</div>
          <div className="font-mono text-sm text-gray-900">
            {resolvedTreasury || '0x...treasury-address'}
          </div>
        </div>
        <div className="mt-3">
          <a
            href={`https://basescan.org/address/${resolvedTreasury}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm"
          >
            <Globe className="w-4 h-4" />
            Lihat di BaseScan
          </a>
        </div>
      </div>
    </div>
  )
}


