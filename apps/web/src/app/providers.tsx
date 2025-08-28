'use client'

import React from 'react'
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { THIRDWEB_CONFIG } from "@/config/thirdweb";

export function Providers({ children }: { children: React.ReactNode }) {
  const [clientId, setClientId] = React.useState<string | undefined>(THIRDWEB_CONFIG.CLIENT_ID)

  React.useEffect(() => {
    fetch('/api/env', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        if (typeof d.NEXT_PUBLIC_THIRDWEB_CLIENT_ID === 'string' && d.NEXT_PUBLIC_THIRDWEB_CLIENT_ID.length > 0) {
          setClientId(d.NEXT_PUBLIC_THIRDWEB_CLIENT_ID)
        }
      })
      .catch(() => {})
  }, [])

  if (!clientId) {
    return <>{children}</>
  }

  return (
    <ThirdwebProvider activeChain={THIRDWEB_CONFIG.CHAIN} clientId={clientId}>
      {children}
    </ThirdwebProvider>
  )
}
