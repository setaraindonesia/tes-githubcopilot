import { Base } from "@thirdweb-dev/chains";

export const THIRDWEB_CONFIG = {
  // Base Network Configuration
  CHAIN: Base,
  
  // SETARA Token Contract
  TOKEN: {
    address: "0x4Cd21Bc007fF4100165CbE2f578F13c2B10A80bB",
    name: "SETARA",
    symbol: "SETARA",
    logo: "/images/setara-logo.svg"
  },
  
  // Treasury Safe Wallet (untuk topup/withdraw)
  TREASURY: {
    address: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "0xd660d57836177520098A6447D7016742fd7b1582",
  },
  
  // Client ID (optional, untuk analytics)
  CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || undefined
}
