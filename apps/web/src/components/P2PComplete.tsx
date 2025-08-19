'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Star, 
  Shield, 
  MessageCircle,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Copy,
  X,
  Send,
  User,
  CreditCard,
  Wallet,
  Zap
} from 'lucide-react'
import { useAddress, useBalance, useContract, useContractRead } from "@thirdweb-dev/react"
import { THIRDWEB_CONFIG } from '@/config/thirdweb'

interface P2PUser {
  id: string
  name: string
  rating: number
  totalTrades: number
  isVerified: boolean
  online: boolean
  lastSeen: string
  paymentMethods: string[]
  limits: {
    min: number
    max: number
  }
  rate: number
  currency: string
  completionRate: number
  avgResponseTime: string
}

interface P2PTrade {
  id: string
  buyerId: string
  sellerId: string
  amount: number
  totalPrice: number
  currency: string
  paymentMethod: string
  status: 'pending' | 'paid' | 'confirmed' | 'completed' | 'disputed' | 'cancelled'
  createdAt: string
  expiresAt: string
  chatMessages: ChatMessage[]
  paymentProof?: string
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: string
  type: 'text' | 'system' | 'payment'
}

const mockUsers: P2PUser[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    rating: 4.9,
    totalTrades: 156,
    isVerified: true,
    online: true,
    lastSeen: '2 min ago',
    paymentMethods: ['Bank BCA', 'Bank BRI', 'GoPay', 'OVO'],
    limits: { min: 100000, max: 5000000 },
    rate: 1050,
    currency: 'IDR',
    completionRate: 98.5,
    avgResponseTime: '2 min'
  },
  {
    id: '2',
    name: 'Sari Indah',
    rating: 4.8,
    totalTrades: 89,
    isVerified: true,
    online: false,
    lastSeen: '15 min ago',
    paymentMethods: ['Bank Mandiri', 'DANA', 'ShopeePay'],
    limits: { min: 50000, max: 2000000 },
    rate: 1045,
    currency: 'IDR',
    completionRate: 96.8,
    avgResponseTime: '5 min'
  },
  {
    id: '3',
    name: 'Ahmad Rahman',
    rating: 4.7,
    totalTrades: 234,
    isVerified: true,
    online: true,
    lastSeen: '1 min ago',
    paymentMethods: ['Bank BCA', 'Bank BNI', 'LinkAja'],
    limits: { min: 200000, max: 10000000 },
    rate: 1055,
    currency: 'IDR',
    completionRate: 97.2,
    avgResponseTime: '3 min'
  }
]

const P2PComplete: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY')
  const [selectedCurrency, setSelectedCurrency] = useState<string>('IDR')
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  // Modal states
  const [showTradeModal, setShowTradeModal] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<P2PUser | null>(null)
  
  // Trade states
  const [tradeAmount, setTradeAmount] = useState<string>('')
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [currentTrade, setCurrentTrade] = useState<P2PTrade | null>(null)
  
  // Chat states
  const [chatMessage, setChatMessage] = useState<string>('')
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)

  // Wallet integration
  const address = useAddress()
  const { data: ethBalance } = useBalance()
  const { contract: tokenContract } = useContract(THIRDWEB_CONFIG.TOKEN.address)
  const { data: tokenBalance } = useContractRead(tokenContract, "balanceOf", [address])

  // Get SETARA balance in readable format
  const getSetaraBalance = () => {
    if (tokenBalance) {
      try {
        return parseFloat(tokenBalance.toString()) / Math.pow(10, 18)
      } catch {
        return 0
      }
    }
    return 0
  }

  const setaraBalance = getSetaraBalance()

  // Memoized disabled state for trade button
  const isTradeDisabled = useMemo(() => {
    if (!tradeAmount || !selectedPayment) return true
    if (activeTab === 'SELL' && setaraBalance === 0) return true
    if (tradeAmount && validateTradeAmount(tradeAmount) !== null) return true
    return false
  }, [tradeAmount, selectedPayment, activeTab, setaraBalance])



  const filteredUsers = mockUsers.filter(user => {
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (user.currency !== selectedCurrency) return false
    return true
  })

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'IDR') {
      return `Rp ${amount.toLocaleString('id-ID')}`
    }
    return `${amount} ${currency}`
  }

  const handleTradeClick = (user: P2PUser) => {
    setSelectedUser(user)
    setShowTradeModal(true)
  }

  // Handle MAX button click
  const handleMaxClick = () => {
    if (!selectedUser) return
    
    if (activeTab === 'SELL') {
      // For selling, use user's SETARA balance
      setTradeAmount(setaraBalance.toString())
    } else {
      // For buying, use seller's max limit converted to SETARA
      const maxSetara = selectedUser.limits.max / selectedUser.rate
      setTradeAmount(maxSetara.toString())
    }
  }

  // Validate trade amount
  const validateTradeAmount = (amount: string): string | null => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) return "Amount must be greater than 0"
    
    if (activeTab === 'SELL') {
      if (numAmount > setaraBalance) return "Insufficient SETARA balance"
    } else {
      const minSetara = selectedUser!.limits.min / selectedUser!.rate
      const maxSetara = selectedUser!.limits.max / selectedUser!.rate
      if (numAmount < minSetara) return `Minimum: ${minSetara.toFixed(4)} SETARA`
      if (numAmount > maxSetara) return `Maximum: ${maxSetara.toFixed(4)} SETARA`
    }
    
    return null
  }

  const handleCreateTrade = () => {
    if (!tradeAmount || !selectedPayment || !selectedUser) return
    
    const validationError = validateTradeAmount(tradeAmount)
    if (validationError) {
      alert(validationError)
      return
    }
    
    const trade: P2PTrade = {
      id: `P2P${Date.now()}`,
      buyerId: activeTab === 'BUY' ? 'current-user' : selectedUser.id,
      sellerId: activeTab === 'SELL' ? 'current-user' : selectedUser.id,
      amount: parseFloat(tradeAmount),
      totalPrice: parseFloat(tradeAmount) * selectedUser.rate,
      currency: selectedUser.currency,
      paymentMethod: selectedPayment,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      chatMessages: [
        {
          id: '1',
          senderId: 'system',
          senderName: 'System',
          message: `Trade created: ${activeTab === 'BUY' ? 'Buying' : 'Selling'} ${tradeAmount} SETARA for ${formatCurrency(parseFloat(tradeAmount) * selectedUser.rate, selectedUser.currency)}`,
          timestamp: new Date().toISOString(),
          type: 'system'
        },
        {
          id: '2',
          senderId: selectedUser.id,
          senderName: selectedUser.name,
          message: activeTab === 'BUY' 
            ? `Hello! Please transfer ${formatCurrency(parseFloat(tradeAmount) * selectedUser.rate, selectedUser.currency)} to my ${selectedPayment} account. I'll release the SETARA once payment is confirmed.`
            : `Hello! I'm ready to buy your SETARA. Please confirm the trade and I'll send the payment to your ${selectedPayment} account.`,
          timestamp: new Date().toISOString(),
          type: 'text'
        }
      ]
    }
    
    setCurrentTrade(trade)
    setShowTradeModal(false)
    setTradeAmount('')
    setSelectedPayment('')
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !currentTrade) return
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      message: chatMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    }
    
    setCurrentTrade({
      ...currentTrade,
      chatMessages: [...currentTrade.chatMessages, newMessage]
    })
    
    setChatMessage('')
  }

  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentProofFile(file)
    }
  }

  const handleMarkAsPaid = () => {
    if (!currentTrade) return
    
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'System',
      message: 'Payment proof uploaded. Waiting for seller confirmation.',
      timestamp: new Date().toISOString(),
      type: 'system'
    }
    
    setCurrentTrade({
      ...currentTrade,
      status: 'paid',
      paymentProof: paymentProofFile?.name || 'payment-proof.jpg',
      chatMessages: [...currentTrade.chatMessages, systemMessage]
    })
    
    setPaymentProofFile(null)
  }

  const handleConfirmPayment = () => {
    if (!currentTrade) return
    
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'System',
      message: 'Payment confirmed! SETARA has been released to buyer.',
      timestamp: new Date().toISOString(),
      type: 'system'
    }
    
    setCurrentTrade({
      ...currentTrade,
      status: 'completed',
      chatMessages: [...currentTrade.chatMessages, systemMessage]
    })
  }

  const getStatusColor = (status: P2PTrade['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'disputed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: P2PTrade['status']) => {
    switch (status) {
      case 'pending': return 'Waiting for Payment'
      case 'paid': return 'Payment Submitted'
      case 'confirmed': return 'Payment Confirmed'
      case 'completed': return 'Completed'
      case 'disputed': return 'Disputed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  // If there's an active trade, show trade interface
  if (currentTrade) {
    return (
      <div className="space-y-6">
        {/* Trade Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Trade #{currentTrade.id}</h2>
              <p className="text-gray-600">
                {activeTab === 'BUY' ? 'Buying' : 'Selling'} {currentTrade.amount} SETARA
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentTrade.status)}`}>
                {getStatusText(currentTrade.status)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Expires in 25:30
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="font-semibold">{currentTrade.amount} SETARA</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Price</p>
              <p className="font-semibold">{formatCurrency(currentTrade.totalPrice, currentTrade.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-semibold">{currentTrade.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Trade Process */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Process
            </h3>

            {currentTrade.status === 'pending' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Payment Instructions</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Please transfer {formatCurrency(currentTrade.totalPrice, currentTrade.currency)} to:
                  </p>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-mono text-sm">Bank: {currentTrade.paymentMethod}</p>
                    <p className="font-mono text-sm">Account: 1234567890</p>
                    <p className="font-mono text-sm">Name: {selectedUser?.name}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Payment Proof
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentProofUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {paymentProofFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {paymentProofFile.name} selected
                    </p>
                  )}
                </div>

                <button
                  onClick={handleMarkAsPaid}
                  disabled={!paymentProofFile}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark as Paid
                </button>
              </div>
            )}

            {currentTrade.status === 'paid' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Payment Submitted</h4>
                  <p className="text-sm text-blue-700">
                    Your payment proof has been submitted. Waiting for seller confirmation.
                  </p>
                </div>
                
                {/* Simulate seller confirmation button (for demo) */}
                <button
                  onClick={handleConfirmPayment}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  [DEMO] Confirm Payment (Seller Action)
                </button>
              </div>
            )}

            {currentTrade.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Trade Completed!</h4>
                </div>
                <p className="text-sm text-green-700">
                  Payment confirmed and SETARA has been released to your wallet.
                </p>
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat with {selectedUser?.name}
            </h3>

            <div className="border rounded-lg h-80 flex flex-col">
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {currentTrade.chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.senderId === 'current-user' 
                        ? 'bg-blue-600 text-white' 
                        : msg.type === 'system'
                        ? 'bg-gray-100 text-gray-700 italic'
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      {msg.type !== 'system' && (
                        <p className="text-xs opacity-75 mb-1">{msg.senderName}</p>
                      )}
                      <p>{msg.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setCurrentTrade(null)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back to P2P Market
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Simple Header with Balance */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">P2P SETARA Exchange</h1>
          <p className="text-gray-600">Trade SETARA directly with other users - Fast, Safe, Simple</p>
          
          {address && (
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-900">
                  {setaraBalance.toFixed(4)} SETARA
                </span>
                <span className="text-sm text-gray-500">Available</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simple Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('BUY')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'BUY'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Buy SETARA
          </button>
          <button
            onClick={() => setActiveTab('SELL')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'SELL'
                ? 'bg-red-50 text-red-700 border-b-2 border-red-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Sell SETARA
          </button>
        </div>

        {/* Simple Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search traders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="divide-y divide-gray-200">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-lg mb-2">No traders found</div>
              <div className="text-sm">Try adjusting your search or currency</div>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        user.online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{user.name}</span>
                        {user.isVerified && <Shield className="w-4 h-4 text-blue-500" />}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.online ? 'Online' : user.lastSeen}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{user.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{user.totalTrades} trades</span>
                        <span>•</span>
                        <span>{user.completionRate}% completion</span>
                      </div>
                    </div>
                  </div>

                  {/* Trade Info */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {formatCurrency(user.rate, user.currency)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">per SETARA</div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      Limits: {formatCurrency(user.limits.min, user.currency)} - {formatCurrency(user.limits.max, user.currency)}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTradeClick(user)}
                        disabled={activeTab === 'SELL' && setaraBalance === 0}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          activeTab === 'BUY'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}

                      >
                        {activeTab === 'BUY' ? 'Buy Now' : 'Sell Now'}
                      </button>
                      
                      {activeTab === 'SELL' && setaraBalance > 0 && (
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setTradeAmount(setaraBalance.toString())
                            setShowTradeModal(true)
                          }}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1"
                          title="Sell all balance"
                        >
                          <Zap className="w-4 h-4" />
                          All
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">Payment:</span>
                  <div className="flex gap-2 flex-wrap">
                    {user.paymentMethods.slice(0, 3).map((method, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {method}
                      </span>
                    ))}
                    {user.paymentMethods.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{user.paymentMethods.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Trade with {selectedUser.name}</h3>
              <button
                onClick={() => setShowTradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (SETARA)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="Enter amount"
                    step="0.0001"
                    className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-xs rounded font-medium hover:bg-blue-700 transition-colors"
                  >
                    MAX
                  </button>
                </div>
                
                {activeTab === 'SELL' ? (
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {setaraBalance.toFixed(4)} SETARA
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Min: {(selectedUser.limits.min / selectedUser.rate).toFixed(4)} SETARA, 
                    Max: {(selectedUser.limits.max / selectedUser.rate).toFixed(4)} SETARA
                  </p>
                )}
                
                {tradeAmount && validateTradeAmount(tradeAmount) && (
                  <p className="text-xs text-red-500 mt-1">
                    {validateTradeAmount(tradeAmount)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select payment method</option>
                  {selectedUser.paymentMethods.map((method, idx) => (
                    <option key={idx} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {tradeAmount && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Total to pay:</div>
                  <div className="font-semibold text-lg">
                    {formatCurrency(parseFloat(tradeAmount || '0') * selectedUser.rate, selectedUser.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Rate: {formatCurrency(selectedUser.rate, selectedUser.currency)} per SETARA
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTradeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTrade}
                  disabled={isTradeDisabled}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default P2PComplete
