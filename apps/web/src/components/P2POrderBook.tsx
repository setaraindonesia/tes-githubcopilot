'use client'

import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Shield, 
  MessageCircle,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react'
import { P2POrder, P2POrderFilter } from '@/types/p2p'
import { mockP2POrders, mockP2PMarketStats } from '@/data/p2pMockData'

const P2POrderBook: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY')
  const [selectedCurrency, setSelectedCurrency] = useState<string>('IDR')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [selectedOrder, setSelectedOrder] = useState<P2POrder | null>(null)
  
  const [filters, setFilters] = useState<P2POrderFilter>({
    type: undefined,
    fiatCurrency: 'IDR',
    paymentMethod: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    minRating: undefined,
    sortBy: 'PRICE',
    sortOrder: 'ASC'
  })

  // Filter orders based on active tab and filters
  const filteredOrders = mockP2POrders.filter(order => {
    if (activeTab === 'BUY' && order.type !== 'SELL') return false
    if (activeTab === 'SELL' && order.type !== 'BUY') return false
    if (filters.fiatCurrency && order.fiatCurrency !== filters.fiatCurrency) return false
    if (filters.minRating && order.userRating < filters.minRating) return false
    if (searchTerm && !order.username.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'IDR') {
      return `Rp ${amount.toLocaleString('id-ID')}`
    } else if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US')}`
    }
    return `${amount} ${currency}`
  }

  const formatRate = (rate: number, currency: string) => {
    if (currency === 'IDR') {
      return `Rp ${rate.toLocaleString('id-ID')}`
    } else if (currency === 'USD') {
      return `$${rate.toFixed(2)}`
    }
    return `${rate} ${currency}`
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'BANK_TRANSFER': return '🏦'
      case 'E_WALLET': return '📱'
      case 'CASH': return '💵'
      case 'CRYPTO': return '₿'
      default: return '💳'
    }
  }

  const handleTradeClick = (order: P2POrder) => {
    setSelectedOrder(order)
    // TODO: Open trade modal
    alert(`Trading with ${order.username} - This will open trade modal`)
  }

  const currentStats = mockP2PMarketStats

  return (
    <div className="space-y-6">
      {/* Market Stats Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">P2P SETARA Exchange</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>24h Volume: {currentStats.totalVolume24h.toLocaleString()} SETARA</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">IDR Rate</div>
            <div className="font-bold text-lg">{formatRate(currentStats.averagePrice.IDR, 'IDR')}</div>
            <div className="text-xs text-green-600">+{currentStats.priceChange24h.IDR}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">USD Rate</div>
            <div className="font-bold text-lg">{formatRate(currentStats.averagePrice.USD, 'USD')}</div>
            <div className="text-xs text-green-600">+{currentStats.priceChange24h.USD}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">24h Trades</div>
            <div className="font-bold text-lg">{currentStats.totalTrades24h}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Active Orders</div>
            <div className="font-bold text-lg">{filteredOrders.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b">
          <div className="flex space-x-1 mb-3 sm:mb-0">
            <button
              onClick={() => setActiveTab('BUY')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'BUY'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Buy SETARA
            </button>
            <button
              onClick={() => setActiveTab('SELL')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'SELL'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sell SETARA
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search traders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="SGD">SGD</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                <select
                  value={filters.minRating || ''}
                  onChange={(e) => setFilters({...filters, minRating: e.target.value ? parseFloat(e.target.value) : undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="PRICE">Best Price</option>
                  <option value="RATING">Highest Rating</option>
                  <option value="TRADES">Most Trades</option>
                  <option value="AMOUNT">Highest Amount</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters({...filters, sortOrder: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="ASC">Low to High</option>
                  <option value="DESC">High to Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-lg mb-2">No orders found</div>
              <div className="text-sm">Try adjusting your filters or search terms</div>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Trader Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {order.username.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{order.username}</span>
                        {order.userRating >= 4.5 && <Shield className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{order.userRating}</span>
                        </div>
                        <span>•</span>
                        <span>{order.totalTrades} trades</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                    {/* Price & Amount */}
                    <div className="text-center lg:text-left">
                      <div className="text-lg font-bold text-gray-900">
                        {formatRate(order.exchangeRate, order.fiatCurrency)}
                      </div>
                      <div className="text-sm text-gray-600">per SETARA</div>
                    </div>

                    {/* Limits */}
                    <div className="text-center lg:text-left">
                      <div className="text-sm text-gray-600">Limits</div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(order.minAmount, order.fiatCurrency)} - {formatCurrency(order.maxAmount, order.fiatCurrency)}
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="text-center lg:text-left">
                      <div className="text-sm text-gray-600 mb-1">Payment</div>
                      <div className="flex flex-wrap gap-1">
                        {order.paymentMethods.slice(0, 2).map((method, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            <span>{getPaymentMethodIcon(method.type)}</span>
                            <span>{method.name}</span>
                          </span>
                        ))}
                        {order.paymentMethods.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{order.paymentMethods.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleTradeClick(order)}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'BUY'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {activeTab === 'BUY' ? 'Buy' : 'Sell'}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                {order.terms && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      <strong>Terms:</strong> {order.terms}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default P2POrderBook
