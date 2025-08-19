'use client'

import React from 'react'
import { ConnectWallet, useAddress, useBalance, useContract, useContractRead } from "@thirdweb-dev/react";
import { THIRDWEB_CONFIG } from '@/config/thirdweb'
import Image from 'next/image'

const WalletConnect: React.FC = () => {
  const address = useAddress();
  const { data: ethBalance } = useBalance();
  const { contract: tokenContract } = useContract(THIRDWEB_CONFIG.TOKEN.address);
  const { data: tokenBalance } = useContractRead(tokenContract, "balanceOf", [address]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: any) => {
    if (!balance) return '0'
    const num = parseFloat(balance.displayValue)
    if (num < 0.001) return '< 0.001'
    return num.toFixed(3)
  }

  const formatTokenBalance = (balance: any) => {
    if (!balance) return '0'
    const num = parseFloat(balance.toString()) / Math.pow(10, 18)
    if (num < 0.001) return '< 0.001'
    return num.toFixed(3)
  }

  if (!address) {
    return (
      <ConnectWallet 
        theme="dark"
        btnTitle="Connect Wallet"
        modalTitle="Connect to SetaradApps"
        welcomeScreen={{
          title: "Welcome to SetaradApps",
          subtitle: "Connect your wallet to access all features"
        }}
        modalSize="wide"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "8px",
          padding: "12px 24px",
          fontWeight: "600"
        }}
      />
    )
  }

  return (
    <div className="flex items-center space-x-3">
      {/* SETARA Token Balance */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
        <div className="w-6 h-6 relative">
          <Image 
            src={THIRDWEB_CONFIG.TOKEN.logo} 
            alt="SETARA" 
            width={24} 
            height={24}
            className="rounded-full"
          />
        </div>
        <span className="text-indigo-700 text-sm font-medium">
          {formatTokenBalance(tokenBalance)} {THIRDWEB_CONFIG.TOKEN.symbol}
        </span>
      </div>
      
      {/* ETH Balance */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-blue-700 text-sm font-medium">
          {formatBalance(ethBalance)} ETH
        </span>
      </div>
      
      {/* Account Address */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
        <span className="text-gray-700 text-sm font-mono">
          {formatAddress(address)}
        </span>
      </div>
      
      {/* Disconnect Button */}
      <ConnectWallet 
        theme="dark"
        btnTitle="Disconnect"
        modalTitle="Wallet Settings"
        style={{
          background: "#ef4444",
          borderRadius: "8px",
          padding: "8px 16px",
          fontWeight: "500",
          fontSize: "14px"
        }}
      />
    </div>
  )
}

export default WalletConnect
