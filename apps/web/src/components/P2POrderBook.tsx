'use client'

import React, { useEffect, useRef, useState } from 'react'
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

type P2POrderBookProps = {
  activeTab?: 'BUY' | 'SELL'
  onChangeActiveTab?: (tab: 'BUY' | 'SELL') => void
  selectedCurrency?: string
  onChangeCurrency?: (currency: string) => void
  showHeader?: boolean
}

const P2POrderBook: React.FC<P2POrderBookProps> = ({
  activeTab: activeTabProp,
  onChangeActiveTab,
  selectedCurrency: selectedCurrencyProp,
  onChangeCurrency,
  showHeader = true,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'BUY' | 'SELL'>('BUY')
  const activeTab = activeTabProp ?? internalActiveTab

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [selectedOrder, setSelectedOrder] = useState<P2POrder | null>(null)
  
  const [filters, setFilters] = useState<P2POrderFilter>({
    type: undefined,
    fiatCurrency: selectedCurrencyProp || 'IDR',
    paymentMethod: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    minRating: undefined,
    sortBy: 'PRICE',
    sortOrder: 'ASC'
  })

  const selectedCurrency = selectedCurrencyProp ?? filters.fiatCurrency
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false)
  const currencyRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!showCurrencyMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setShowCurrencyMenu(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCurrencyMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [showCurrencyMenu])

  const handleSetActiveTab = (tab: 'BUY' | 'SELL') => {
    if (onChangeActiveTab) onChangeActiveTab(tab)
    else setInternalActiveTab(tab)
  }

  const handleSetCurrency = (currency: string) => {
    if (onChangeCurrency) onChangeCurrency(currency)
    else setFilters({ ...filters, fiatCurrency: currency })
  }

  // Sync currency filter when parent prop changes
  useEffect(() => {
    if (selectedCurrencyProp && selectedCurrencyProp !== filters.fiatCurrency) {
      setFilters(prev => ({ ...prev, fiatCurrency: selectedCurrencyProp }))
    }
  }, [selectedCurrencyProp])

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
      {showHeader && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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
      )}

      {/* Tabs and Controls */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border-b">
          <div className="flex space-x-1 mb-3 sm:mb-0">
            <button
              onClick={() => handleSetActiveTab('BUY')}
              className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full font-medium transition-colors ${
                activeTab === 'BUY'
                  ? 'bg-teal-100 text-teal-700 border border-teal-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Beli
            </button>
            <button
              onClick={() => handleSetActiveTab('SELL')}
              className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full font-medium transition-colors ${
                activeTab === 'SELL'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Jual
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => setShowCurrencyMenu((v) => !v)}
                className="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2"
              >
                <span>{selectedCurrency}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showCurrencyMenu && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-1 min-w-[7rem] max-w-[12rem] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {['IDR','USD'].map((c) => (
                    <button
                      key={c}
                      onClick={() => { handleSetCurrency(c); setShowCurrencyMenu(false) }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${selectedCurrency === c ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2">
              Limit <ChevronDown className="w-4 h-4" />
            </button>
            <button className="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2">
              Metode <ChevronDown className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <span>Merchant</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                <div className="-ml-8 w-5 h-5 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform"></div>
              </label>
            </div>
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
            filteredOrders.map((order) => {
              const availableToken = order.exchangeRate ? (order.maxAmount / order.exchangeRate) : order.maxAmount
              return (
                <div key={order.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  {/* Top Row: Merchant + Stats */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
                        {order.username.charAt(0)}
                      </div>
                      <div className="font-medium text-gray-900">{order.username}</div>
                    </div>
                    <div className="text-right text-gray-500 text-sm">
                      <div>{order.totalTrades} Order (30H) | {Math.round((order.userRating/5)*100)}%</div>
                      <div className="text-gray-500">Online</div>
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{formatRate(order.exchangeRate, order.fiatCurrency)}</div>
                    </div>
                    <button
                      onClick={() => handleTradeClick(order)}
                      className={`px-5 py-2 rounded-full font-medium transition-colors ${
                        activeTab === 'BUY' ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {activeTab === 'BUY' ? 'Beli' : 'Jual'}
                    </button>
                  </div>

                  {/* Amount & Limit */}
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="text-sm text-gray-600">
                      Jumlah <span className="block font-medium text-gray-900">{availableToken.toLocaleString()} USDT</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Limit <span className="block font-medium text-gray-900">{formatCurrency(order.minAmount, order.fiatCurrency)} - {formatCurrency(order.maxAmount, order.fiatCurrency)}</span>
                    </div>
                  </div>

                  {/* Payment methods */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {order.paymentMethods.slice(0, 8).map((method, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        <span>{getPaymentMethodIcon(method.type)}</span>
                        <span>{method.name}</span>
                      </span>
                    ))}
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
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default P2POrderBook
