'use client'

import { ThirdwebProvider } from "@thirdweb-dev/react";
import { THIRDWEB_CONFIG } from "@/config/thirdweb";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider 
      activeChain={THIRDWEB_CONFIG.CHAIN}
      clientId={THIRDWEB_CONFIG.CLIENT_ID}
    >
      {children}
    </ThirdwebProvider>
  );
}
