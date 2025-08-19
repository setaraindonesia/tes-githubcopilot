'use client'

import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageCircle, 
  Upload, 
  Download,
  Shield,
  Star,
  Copy,
  ExternalLink,
  Timer
} from 'lucide-react'
import { P2PTrade, P2POrder } from '@/types/p2p'
import { mockActiveTrades } from '@/data/p2pMockData'

interface P2PTradeFlowProps {
  trade?: P2PTrade
  onClose?: () => void
}

const P2PTradeFlow: React.FC<P2PTradeFlowProps> = ({ trade, onClose }) => {
  const [currentTrade, setCurrentTrade] = useState<P2PTrade | null>(trade || mockActiveTrades[0])
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [showChat, setShowChat] = useState<boolean>(false)

  useEffect(() => {
    if (!currentTrade) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const deadline = new Date(currentTrade.paymentDeadline).getTime()
      const remaining = Math.max(0, deadline - now)
      setTimeRemaining(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [currentTrade])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'IDR') {
      return `Rp ${amount.toLocaleString('id-ID')}`
    } else if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US')}`
    }
    return `${amount} ${currency}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'bg-blue-100 text-blue-800'
      case 'PAYMENT_PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PAYMENT_MADE': return 'bg-orange-100 text-orange-800'
      case 'PAYMENT_CONFIRMED': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'DISPUTED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handlePaymentMade = () => {
    if (!currentTrade) return
    
    // Update trade status
    setCurrentTrade({
      ...currentTrade,
      status: 'PAYMENT_MADE'
    })
    
    alert('Payment marked as made! Please wait for seller confirmation.')
  }

  const handleConfirmPayment = () => {
    if (!currentTrade) return
    
    // Update trade status
    setCurrentTrade({
      ...currentTrade,
      status: 'PAYMENT_CONFIRMED',
      escrowStatus: 'RELEASED',
      completedAt: new Date()
    })
    
    alert('Payment confirmed! SETARA tokens have been released.')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPaymentProof(file)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (!currentTrade) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">No Active Trade</div>
          <div className="text-sm">Start trading to see your active orders here</div>
        </div>
      </div>
    )
  }

  const isTimeRunning = timeRemaining > 0 && currentTrade.status === 'PAYMENT_PENDING'

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">P2P Trade #{currentTrade.id}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentTrade.status)}`}>
                {currentTrade.status.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-600">
                Escrow: {currentTrade.escrowStatus}
              </span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>

        {/* Timer */}
        {isTimeRunning && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Payment deadline: {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Trade Details */}
      <div className="p-6 space-y-6">
        {/* Amount & Rate */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">SETARA Amount</div>
              <div className="text-lg font-bold text-gray-900">
                {currentTrade.tokenAmount.toLocaleString()} SETARA
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Fiat Amount</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(currentTrade.fiatAmount, currentTrade.fiatCurrency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Exchange Rate</div>
              <div className="text-base font-medium text-gray-700">
                1 SETARA = {formatCurrency(currentTrade.exchangeRate, currentTrade.fiatCurrency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Payment Method</div>
              <div className="text-base font-medium text-gray-700">
                {currentTrade.selectedPaymentMethod.name}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {currentTrade.status === 'PAYMENT_PENDING' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Payment Instructions</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex justify-between items-center">
                <span>Bank Name:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentTrade.selectedPaymentMethod.details.bankName}</span>
                  <button onClick={() => copyToClipboard(currentTrade.selectedPaymentMethod.details.bankName || '')}>
                    <Copy className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentTrade.selectedPaymentMethod.details.accountNumber}</span>
                  <button onClick={() => copyToClipboard(currentTrade.selectedPaymentMethod.details.accountNumber || '')}>
                    <Copy className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Account Name:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentTrade.selectedPaymentMethod.details.accountName}</span>
                  <button onClick={() => copyToClipboard(currentTrade.selectedPaymentMethod.details.accountName || '')}>
                    <Copy className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {currentTrade.status === 'PAYMENT_PENDING' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Payment Proof (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {paymentProof && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ {paymentProof.name} uploaded
                  </div>
                )}
              </div>
              <button
                onClick={handlePaymentMade}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                I Have Made Payment
              </button>
            </>
          )}

          {currentTrade.status === 'PAYMENT_MADE' && (
            <div className="text-center">
              <div className="text-yellow-600 mb-2">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Waiting for seller confirmation...</div>
                <div className="text-sm text-gray-600">The seller will confirm your payment shortly</div>
              </div>
              
              {/* For demo - seller can confirm */}
              <button
                onClick={handleConfirmPayment}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                [Demo] Confirm Payment (Seller)
              </button>
            </div>
          )}

          {currentTrade.status === 'PAYMENT_CONFIRMED' && (
            <div className="text-center">
              <div className="text-green-600 mb-4">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <div className="text-lg font-bold">Trade Completed!</div>
                <div className="text-sm text-gray-600">
                  {currentTrade.tokenAmount} SETARA has been released to your P2P balance
                </div>
              </div>
            </div>
          )}

          {/* Chat Button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with {currentTrade.buyerId === 'currentUser' ? 'Seller' : 'Buyer'}
          </button>
        </div>

        {/* Trade Timeline */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Trade Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="text-sm">
                <span className="font-medium">Trade Created</span>
                <span className="text-gray-600 ml-2">
                  {new Date(currentTrade.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            
            {currentTrade.status !== 'CREATED' && (
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  currentTrade.status === 'PAYMENT_PENDING' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="text-sm">
                  <span className="font-medium">Payment Phase Started</span>
                </div>
              </div>
            )}
            
            {currentTrade.status === 'PAYMENT_MADE' && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-medium">Payment Made by Buyer</span>
                </div>
              </div>
            )}
            
            {currentTrade.completedAt && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-medium">Trade Completed</span>
                  <span className="text-gray-600 ml-2">
                    {new Date(currentTrade.completedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Section */}
      {showChat && (
        <div className="border-t border-gray-200 p-4">
          <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
            <div className="text-center text-gray-500 text-sm">
              Chat functionality will be implemented here
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default P2PTradeFlow
