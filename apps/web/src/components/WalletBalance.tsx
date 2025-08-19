'use client'

import React from 'react'
import { useAddress, useBalance, useContract, useContractRead } from "@thirdweb-dev/react";
import { THIRDWEB_CONFIG } from '@/config/thirdweb'
import Image from 'next/image'

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

  const formatTokenBalance = (balance: any, error: any) => {
    if (error) return 'Error'
    if (!balance) return '0.000'
    try {
      const num = parseFloat(balance.toString()) / Math.pow(10, 18)
      if (num < 0.001) return '< 0.001'
      return num.toFixed(3)
    } catch {
      return '0.000'
    }
  }

  if (!address) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 relative">
              <Image 
                src={THIRDWEB_CONFIG.TOKEN.logo} 
                alt="SETARA" 
                width={24} 
                height={24}
                className="rounded-full"
              />
            </div>
            <span className="font-medium text-indigo-700">SETARA</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-indigo-900">--</div>
            <div className="text-xs text-indigo-600">Connect Wallet</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
            <span className="font-medium">ETH</span>
          </div>
          <div className="text-right">
            <div className="font-semibold">--</div>
            <div className="text-xs text-gray-600">Connect Wallet</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 relative">
            <Image 
              src={THIRDWEB_CONFIG.TOKEN.logo} 
              alt="SETARA" 
              width={24} 
              height={24}
              className="rounded-full"
            />
          </div>
          <span className="font-medium text-indigo-700">SETARA</span>
        </div>
        <div className="text-right">
          <div className="font-semibold text-indigo-900">{formatTokenBalance(tokenBalance, tokenError)}</div>
          <div className="text-xs text-indigo-600">Base Network</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
          <span className="font-medium">ETH</span>
        </div>
        <div className="text-right">
          <div className="font-semibold">{formatBalance(ethBalance, ethError)}</div>
          <div className="text-xs text-gray-600">Base Network</div>
        </div>
      </div>
    </div>
  )
}

export default WalletBalance
