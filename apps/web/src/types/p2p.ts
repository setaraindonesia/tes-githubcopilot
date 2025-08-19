// P2P Exchange System Types
export interface P2POrder {
  id: string
  type: 'BUY' | 'SELL'
  userId: string
  username: string
  userRating: number
  totalTrades: number
  
  // Token details
  tokenAmount: number
  fiatAmount: number
  fiatCurrency: 'IDR' | 'USD' | 'EUR' | 'SGD' | 'MYR'
  exchangeRate: number
  
  // Order limits
  minAmount: number
  maxAmount: number
  
  // Payment methods
  paymentMethods: PaymentMethod[]
  
  // Order status
  status: 'ACTIVE' | 'MATCHED' | 'PAYMENT_PENDING' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'
  
  // Timestamps
  createdAt: Date
  expiresAt: Date
  
  // Additional info
  terms?: string
  autoReply?: string
}

export interface PaymentMethod {
  id: string
  type: 'BANK_TRANSFER' | 'E_WALLET' | 'CASH' | 'CRYPTO'
  name: string
  details: {
    bankName?: string
    accountNumber?: string
    accountName?: string
    walletType?: string
    walletNumber?: string
  }
  isActive: boolean
}

export interface P2PTrade {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  
  // Trade details
  tokenAmount: number
  fiatAmount: number
  fiatCurrency: string
  exchangeRate: number
  selectedPaymentMethod: PaymentMethod
  
  // Trade flow
  status: 'CREATED' | 'PAYMENT_PENDING' | 'PAYMENT_MADE' | 'PAYMENT_CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'
  
  // Escrow
  escrowStatus: 'PENDING' | 'LOCKED' | 'RELEASED' | 'REFUNDED'
  
  // Chat
  chatId: string
  
  // Timestamps
  createdAt: Date
  paymentDeadline: Date
  completedAt?: Date
  
  // Dispute
  disputeReason?: string
  disputeStatus?: 'OPEN' | 'RESOLVED'
}

export interface P2PUser {
  id: string
  username: string
  email: string
  
  // Reputation
  rating: number
  totalTrades: number
  completedTrades: number
  cancelledTrades: number
  
  // Verification
  isVerified: boolean
  kycStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  
  // Settings
  paymentMethods: PaymentMethod[]
  autoReply: string
  tradingLimits: {
    dailyLimit: number
    monthlyLimit: number
  }
  
  // Balances
  p2pBalance: number // Internal SETARA balance
  escrowBalance: number // Locked in escrow
  
  createdAt: Date
  lastActive: Date
}

export interface P2PChat {
  id: string
  tradeId: string
  participants: string[] // User IDs
  
  messages: P2PMessage[]
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface P2PMessage {
  id: string
  chatId: string
  senderId: string
  message: string
  type: 'TEXT' | 'IMAGE' | 'SYSTEM' | 'PAYMENT_PROOF'
  
  // System messages
  systemType?: 'TRADE_CREATED' | 'PAYMENT_MADE' | 'PAYMENT_CONFIRMED' | 'TRADE_COMPLETED'
  
  timestamp: Date
  isRead: boolean
}

export interface P2PMarketStats {
  totalVolume24h: number
  totalTrades24h: number
  averagePrice: {
    [currency: string]: number
  }
  priceChange24h: {
    [currency: string]: number
  }
  topTraders: Array<{
    username: string
    volume24h: number
    trades24h: number
  }>
}

export interface P2POrderFilter {
  type?: 'BUY' | 'SELL'
  fiatCurrency?: string
  paymentMethod?: string
  minAmount?: number
  maxAmount?: number
  minRating?: number
  sortBy?: 'PRICE' | 'AMOUNT' | 'RATING' | 'TRADES'
  sortOrder?: 'ASC' | 'DESC'
}
