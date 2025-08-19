'use client'

import React from 'react'
import { ConnectWallet } from "@thirdweb-dev/react";

const SimpleWalletConnect: React.FC = () => {
  return (
    <ConnectWallet 
      theme="light"
      btnTitle="Connect Wallet"
      modalTitle="Connect Your Wallet"
      modalTitleIconUrl=""
      style={{
        width: "100%",
        background: "#3b82f6",
        borderRadius: "8px",
        padding: "12px 24px",
        fontWeight: "600",
        border: "none",
        cursor: "pointer"
      }}
      switchToActiveChain={true}
      modalSize="compact"
    />
  )
}

export default SimpleWalletConnect
