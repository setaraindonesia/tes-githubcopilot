import { P2POrder, P2PUser, P2PTrade, PaymentMethod, P2PMarketStats } from '@/types/p2p'

// Mock Payment Methods
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm1',
    type: 'BANK_TRANSFER',
    name: 'Bank BCA',
    details: {
      bankName: 'Bank Central Asia',
      accountNumber: '1234567890',
      accountName: 'John Doe'
    },
    isActive: true
  },
  {
    id: 'pm2',
    type: 'BANK_TRANSFER',
    name: 'Bank Mandiri',
    details: {
      bankName: 'Bank Mandiri',
      accountNumber: '0987654321',
      accountName: 'Jane Smith'
    },
    isActive: true
  },
  {
    id: 'pm3',
    type: 'E_WALLET',
    name: 'GoPay',
    details: {
      walletType: 'GoPay',
      walletNumber: '081234567890'
    },
    isActive: true
  },
  {
    id: 'pm4',
    type: 'E_WALLET',
    name: 'OVO',
    details: {
      walletType: 'OVO',
      walletNumber: '081987654321'
    },
    isActive: true
  }
]

// Mock P2P Users
export const mockP2PUsers: P2PUser[] = [
  {
    id: 'user1',
    username: 'CryptoTrader88',
    email: 'trader88@example.com',
    rating: 4.9,
    totalTrades: 245,
    completedTrades: 240,
    cancelledTrades: 5,
    isVerified: true,
    kycStatus: 'VERIFIED',
    paymentMethods: [mockPaymentMethods[0], mockPaymentMethods[2]],
    autoReply: 'Hi! I\'m online and ready to trade. Please follow the payment instructions carefully.',
    tradingLimits: {
      dailyLimit: 10000,
      monthlyLimit: 100000
    },
    p2pBalance: 5000,
    escrowBalance: 0,
    createdAt: new Date('2023-01-15'),
    lastActive: new Date()
  },
  {
    id: 'user2',
    username: 'SetaraWhale',
    email: 'whale@example.com',
    rating: 4.8,
    totalTrades: 189,
    completedTrades: 185,
    cancelledTrades: 4,
    isVerified: true,
    kycStatus: 'VERIFIED',
    paymentMethods: [mockPaymentMethods[1], mockPaymentMethods[3]],
    autoReply: 'Welcome! Large orders welcome. Fast release after payment confirmation.',
    tradingLimits: {
      dailyLimit: 50000,
      monthlyLimit: 500000
    },
    p2pBalance: 25000,
    escrowBalance: 2000,
    createdAt: new Date('2023-02-20'),
    lastActive: new Date()
  },
  {
    id: 'user3',
    username: 'QuickTrader',
    email: 'quick@example.com',
    rating: 4.7,
    totalTrades: 156,
    completedTrades: 150,
    cancelledTrades: 6,
    isVerified: true,
    kycStatus: 'VERIFIED',
    paymentMethods: [mockPaymentMethods[0], mockPaymentMethods[1], mockPaymentMethods[2]],
    autoReply: 'Fast and reliable trading. Online 24/7.',
    tradingLimits: {
      dailyLimit: 20000,
      monthlyLimit: 200000
    },
    p2pBalance: 8500,
    escrowBalance: 500,
    createdAt: new Date('2023-03-10'),
    lastActive: new Date()
  }
]

// Mock P2P Orders
export const mockP2POrders: P2POrder[] = [
  {
    id: 'order1',
    type: 'SELL',
    userId: 'user1',
    username: 'CryptoTrader88',
    userRating: 4.9,
    totalTrades: 245,
    tokenAmount: 1000,
    fiatAmount: 1000000,
    fiatCurrency: 'IDR',
    exchangeRate: 1000,
    minAmount: 100000,
    maxAmount: 500000,
    paymentMethods: [mockPaymentMethods[0], mockPaymentMethods[2]],
    status: 'ACTIVE',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    terms: 'Payment within 15 minutes. No refunds after confirmation.',
    autoReply: 'Hi! I\'m online and ready to trade. Please follow the payment instructions carefully.'
  },
  {
    id: 'order2',
    type: 'BUY',
    userId: 'user2',
    username: 'SetaraWhale',
    userRating: 4.8,
    totalTrades: 189,
    tokenAmount: 5000,
    fiatAmount: 5200000,
    fiatCurrency: 'IDR',
    exchangeRate: 1040,
    minAmount: 500000,
    maxAmount: 2000000,
    paymentMethods: [mockPaymentMethods[1], mockPaymentMethods[3]],
    status: 'ACTIVE',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    terms: 'Large orders preferred. Quick release guaranteed.',
    autoReply: 'Welcome! Large orders welcome. Fast release after payment confirmation.'
  },
  {
    id: 'order3',
    type: 'SELL',
    userId: 'user3',
    username: 'QuickTrader',
    userRating: 4.7,
    totalTrades: 156,
    tokenAmount: 2000,
    fiatAmount: 1980000,
    fiatCurrency: 'IDR',
    exchangeRate: 990,
    minAmount: 200000,
    maxAmount: 1000000,
    paymentMethods: [mockPaymentMethods[0], mockPaymentMethods[1], mockPaymentMethods[2]],
    status: 'ACTIVE',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    terms: 'Fast trading. Online 24/7. Payment proof required.',
    autoReply: 'Fast and reliable trading. Online 24/7.'
  },
  {
    id: 'order4',
    type: 'BUY',
    userId: 'user1',
    username: 'CryptoTrader88',
    userRating: 4.9,
    totalTrades: 245,
    tokenAmount: 1500,
    fiatAmount: 1530,
    fiatCurrency: 'USD',
    exchangeRate: 1.02,
    minAmount: 100,
    maxAmount: 500,
    paymentMethods: [mockPaymentMethods[0]],
    status: 'ACTIVE',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    terms: 'USD wire transfer only. International traders welcome.',
    autoReply: 'Hi! I\'m online and ready to trade. Please follow the payment instructions carefully.'
  },
  {
    id: 'order5',
    type: 'SELL',
    userId: 'user2',
    username: 'SetaraWhale',
    userRating: 4.8,
    totalTrades: 189,
    tokenAmount: 3000,
    fiatAmount: 3060,
    fiatCurrency: 'USD',
    exchangeRate: 1.02,
    minAmount: 200,
    maxAmount: 1000,
    paymentMethods: [mockPaymentMethods[1]],
    status: 'ACTIVE',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    terms: 'Premium rate for USD. Verified traders only.',
    autoReply: 'Welcome! Large orders welcome. Fast release after payment confirmation.'
  }
]

// Mock Market Stats
export const mockP2PMarketStats: P2PMarketStats = {
  totalVolume24h: 125000,
  totalTrades24h: 89,
  averagePrice: {
    IDR: 1015,
    USD: 1.02,
    EUR: 0.94,
    SGD: 1.38
  },
  priceChange24h: {
    IDR: 2.5,
    USD: 1.8,
    EUR: -0.5,
    SGD: 3.2
  },
  topTraders: [
    {
      username: 'CryptoTrader88',
      volume24h: 15000,
      trades24h: 12
    },
    {
      username: 'SetaraWhale',
      volume24h: 25000,
      trades24h: 8
    },
    {
      username: 'QuickTrader',
      volume24h: 12000,
      trades24h: 15
    }
  ]
}

// Mock Active Trades
export const mockActiveTrades: P2PTrade[] = [
  {
    id: 'trade1',
    orderId: 'order1',
    buyerId: 'user2',
    sellerId: 'user1',
    tokenAmount: 500,
    fiatAmount: 500000,
    fiatCurrency: 'IDR',
    exchangeRate: 1000,
    selectedPaymentMethod: mockPaymentMethods[1],
    status: 'PAYMENT_PENDING',
    escrowStatus: 'LOCKED',
    chatId: 'chat1',
    createdAt: new Date(),
    paymentDeadline: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  },
  {
    id: 'trade2',
    orderId: 'order2',
    buyerId: 'user2',
    sellerId: 'user3',
    tokenAmount: 1000,
    fiatAmount: 1040000,
    fiatCurrency: 'IDR',
    exchangeRate: 1040,
    selectedPaymentMethod: mockPaymentMethods[0],
    status: 'PAYMENT_MADE',
    escrowStatus: 'LOCKED',
    chatId: 'chat2',
    createdAt: new Date(),
    paymentDeadline: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes remaining
  }
]
