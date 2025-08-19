'use client'

import { FC, Suspense, useEffect, useRef, useState } from 'react'
// import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, MoreVertical, HelpCircle, Bell, Globe, Moon, LogOut, Home as HomeIcon, ShoppingBag, Car as CarIcon, Coins, Wallet as WalletIcon, Star, Plus, MapPinned, Leaf, Building2, Cpu, ShieldCheck, ArrowUpRight, TrendingUp, MapPin, ChevronDown, Clock, Bike, Truck, Heart, MessageSquare as CommentIcon, Repeat2, Image as ImageIcon, Send, Pencil, X, User, Settings, Store, Smartphone, Package, Box, Backpack, Gem, Sun, ArrowLeftRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { LatLngLiteral } from 'leaflet'
import SimpleWalletConnect from '@/components/SimpleWalletConnect'
import WalletBalance from '@/components/WalletBalance'
import P2PComplete from '@/components/P2PComplete'
import Image from 'next/image'

const DriverMap = dynamic(() => import('../../components/DriverMap'), { ssr: false })

const Dashboard: FC = () => {
  // const router = useRouter()
  const [activeTab, setActiveTab] = useState('chat')
  const [activeBottomTab, setActiveBottomTab] = useState('home')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [hasStore, setHasStore] = useState(false)
  const [isDriver, setIsDriver] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [walletTab, setWalletTab] = useState<'web2' | 'web3'>('web2')
  const [walletView, setWalletView] = useState<'overview' | 'p2p' | 'defi'>('overview')
  const [vehicleType, setVehicleType] = useState<'motor' | 'mobil' | 'pickup'>('motor')
  const [isVehicleOpen, setIsVehicleOpen] = useState(false)
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [pickupPoint, setPickupPoint] = useState<LatLngLiteral | null>(null)
  const [destPoint, setDestPoint] = useState<LatLngLiteral | null>(null)
  const [mapSelectMode, setMapSelectMode] = useState<'pickup' | 'dest'>('pickup')
  const [pickupText, setPickupText] = useState('')
  const [destText, setDestText] = useState('')
  const malangCenter: LatLngLiteral = { lat: -7.9819, lng: 112.6304 }
  const [isResolvingPickup, setIsResolvingPickup] = useState(false)
  const [isResolvingDest, setIsResolvingDest] = useState(false)
  const vehicleOptions: { key: 'motor' | 'mobil' | 'pickup'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'motor', label: 'Motor', icon: Bike },
    { key: 'mobil', label: 'Mobil', icon: CarIcon },
    { key: 'pickup', label: 'Pickup', icon: Truck },
  ]

  const resolveAddress = async (ll: LatLngLiteral): Promise<string | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${ll.lat}&lon=${ll.lng}&zoom=16&addressdetails=1`
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
      if (!res.ok) return null
      const data: any = await res.json()
      const address = data?.address
      if (!address) return `${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`
      
      const parts = []
      if (address.road) parts.push(address.road)
      if (address.village || address.suburb || address.neighbourhood) parts.push(address.village || address.suburb || address.neighbourhood)
      if (address.city_district) parts.push(address.city_district)
      if (address.city || address.town) parts.push(address.city || address.town)
      
      return parts.join(', ') || `${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`
    } catch {
      return `${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`
    }
  }

  const handleMapClick = async (ll: LatLngLiteral) => {
    if (mapSelectMode === 'pickup') {
      setPickupPoint(ll)
      setIsResolvingPickup(true)
      const addr = await resolveAddress(ll)
      setPickupText(addr || '')
      setIsResolvingPickup(false)
    } else {
      setDestPoint(ll)
      setIsResolvingDest(true)
      const addr = await resolveAddress(ll)
      setDestText(addr || '')
      setIsResolvingDest(false)
    }
  }

  const clearPickup = () => {
    setPickupPoint(null)
    setPickupText('')
  }

  const clearDest = () => {
    setDestPoint(null)
    setDestText('')
  }

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const authed = !!localStorage.getItem('auth')
    setIsAuthed(authed)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const tabs = [
    { id: 'chat', label: 'Privat Chat' },
    { id: 'calls', label: 'Panggilan' },
    { id: 'social', label: 'Sosial' },
  ]

  const chatList = [
    { id: 1, name: 'Alice Johnson', message: 'Hey, bagaimana kabarmu?', time: '10:30', avatar: 'A', unread: 2, online: true },
    { id: 2, name: 'Bob Smith', message: 'Apakah kamu sudah selesai dengan proyeknya?', time: '09:15', avatar: 'B', unread: 0, online: false, lastSeen: '2 jam yang lalu' },
    { id: 3, name: 'Charlie Brown', message: 'Mari bertemu besok pagi', time: 'Kemarin', avatar: 'C', unread: 1, online: true },
    { id: 4, name: 'Diana Prince', message: 'Terima kasih atas bantuannya!', time: 'Kemarin', avatar: 'D', unread: 0, online: false, lastSeen: '1 hari yang lalu' },
    { id: 5, name: 'Ethan Hunt', message: 'Mission accomplished 🎯', time: '2 hari', avatar: 'E', unread: 3, online: true },
  ]

  const socialPosts = [
    { id: 1, user: 'Ahmad Setara', time: '2 jam', content: 'Cuaca hari ini sangat cerah! Perfect untuk jalan-jalan di Malang.', likes: 24, comments: 8, reposts: 3 },
    { id: 2, user: 'Siti Nurhaliza', time: '4 jam', content: 'Baru saja mencoba fitur DeFi di Setaradapps. Sangat mudah digunakan!', likes: 67, comments: 12, reposts: 15 },
    { id: 3, user: 'Budi Santoso', time: '6 jam', content: 'Marketplace Setara makin lengkap ya. Tadi beli kebutuhan harian langsung dikirim.', likes: 45, comments: 6, reposts: 8 },
  ]

  const callHistory = [
    { id: 1, name: 'Alice Johnson', type: 'incoming', time: '10:30', duration: '5 menit', avatar: 'A' },
    { id: 2, name: 'Bob Smith', type: 'outgoing', time: '09:15', duration: '12 menit', avatar: 'B' },
    { id: 3, name: 'Charlie Brown', type: 'missed', time: 'Kemarin', duration: '', avatar: 'C' },
  ]

  const categories = ['Semua', 'Elektronik', 'Fashion', 'Makanan', 'Kesehatan', 'Olahraga']

  const products = [
    { id: 1, name: 'iPhone 15 Pro', price: 'Rp 18.999.000', rating: 4.8, reviews: 1234, icon: Smartphone, iconColor: 'text-blue-600', category: 'Elektronik' },
    { id: 2, name: 'Sepatu Nike Air Max', price: 'Rp 1.899.000', rating: 4.6, reviews: 856, icon: Package, iconColor: 'text-gray-700', category: 'Fashion' },
    { id: 3, name: 'Kopi Arabica Premium', price: 'Rp 125.000', rating: 4.9, reviews: 423, icon: Box, iconColor: 'text-amber-700', category: 'Makanan' },
    { id: 4, name: 'Protein Whey 2kg', price: 'Rp 450.000', rating: 4.7, reviews: 234, icon: Package, iconColor: 'text-rose-700', category: 'Kesehatan' },
    { id: 5, name: 'Matras Yoga Premium', price: 'Rp 299.000', rating: 4.5, reviews: 156, icon: Backpack, iconColor: 'text-emerald-700', category: 'Olahraga' },
    { id: 6, name: 'Samsung Galaxy S24', price: 'Rp 12.999.000', rating: 4.7, reviews: 987, icon: Smartphone, iconColor: 'text-indigo-600', category: 'Elektronik' },
    { id: 7, name: 'Tas Ransel Tactical', price: 'Rp 350.000', rating: 4.4, reviews: 178, icon: Backpack, iconColor: 'text-gray-800', category: 'Fashion' },
    { id: 8, name: 'Green Tea Organic', price: 'Rp 85.000', rating: 4.8, reviews: 312, icon: Box, iconColor: 'text-green-700', category: 'Makanan' },
  ]

  const filteredProducts = selectedCategory === 'Semua' 
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products.filter(p => p.category === selectedCategory && p.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const activeOrders = [
    { id: 1, driver: 'Ahmad Driver', vehicle: 'Honda Vario', plate: 'N 1234 AB', status: 'Menuju lokasi pickup', eta: '5 menit', rating: 4.8 },
    { id: 2, driver: 'Siti Driver', vehicle: 'Yamaha Nmax', plate: 'N 5678 CD', status: 'Dalam perjalanan', eta: '15 menit', rating: 4.9 },
  ]

  const [isDark, setIsDark] = useState(false)

  const rwaProjects = [
    { id: 1, name: 'Real Estate Jakarta', icon: Building2, iconColor: 'text-indigo-600', apy: '12%', status: 'Active', risk: 'Medium', investment: 'Rp 1.000.000' },
    { id: 2, name: 'Gold Mining Venture', icon: Gem, iconColor: 'text-amber-600', apy: '8%', status: 'Coming Soon', risk: 'Low', investment: 'Rp 500.000' },
    { id: 3, name: 'Solar Energy Farm', icon: Sun, iconColor: 'text-yellow-500', apy: '15%', status: 'Active', risk: 'High', investment: 'Rp 2.000.000' },
  ]

  if (isAuthed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow border w-full max-w-sm text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Silakan Masuk</h2>
          <p className="text-sm text-gray-600 mb-4">Untuk mengakses dashboard, klik tombol di bawah.</p>
          <button
            onClick={() => { localStorage.setItem('auth', 'true'); window.location.href = '/dashboard' }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
          >
            🔐 Sign In
          </button>
        </div>
      </div>
    )
  }

  if (isAuthed === null) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 scrollbar-hide">
      {/* Header (only for Home) */}
      {activeBottomTab === 'home' && (
        <div className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="flex justify-between items-center px-4 py-4">
            <h1 className="text-2xl font-bold text-indigo-600">Setara</h1>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-indigo-600 transition-colors"><Search className="w-6 h-6" /></button>
              <button className="text-gray-600 hover:text-indigo-600 transition-colors"><ShoppingCart className="w-6 h-6" /></button>
              <div className="relative">
                <button onClick={toggleDropdown} className="text-gray-600 hover:text-indigo-600 transition-colors"><MoreVertical className="w-6 h-6" /></button>
                {isDropdownOpen && (
                  <div ref={dropdownRef} className="absolute right-0 mt-2 w-72 max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-indigo-100 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 rounded-t-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
                        <div>
                          <div className="font-semibold text-gray-900">Ahmad Setara</div>
                          <div className="text-xs text-gray-600">ahmad@setara.id</div>
                        </div>
                      </div>
                    </div>

                    {/* Akun */}
                    <div className="py-2">
                      <div className="px-4 pb-1 text-[11px] uppercase tracking-wider text-gray-400">Akun</div>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><User className="w-4 h-4 text-indigo-600" /><span>Profil Saya</span></button>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><Settings className="w-4 h-4 text-indigo-600" /><span>Pengaturan</span></button>
                    </div>
                    <div className="h-px bg-gray-100" />

                    {/* Transaksi */}
                    <div className="py-2">
                      <div className="px-4 pb-1 text-[11px] uppercase tracking-wider text-gray-400">Transaksi</div>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><WalletIcon className="w-4 h-4 text-indigo-600" /><span>Wallet & Pembayaran</span></button>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><ShoppingBag className="w-4 h-4 text-indigo-600" /><span>Pesanan Saya</span></button>
                    </div>
                    <div className="h-px bg-gray-100" />

                    {/* Bisnis */}
                    <div className="py-2">
                      <div className="px-4 pb-1 text-[11px] uppercase tracking-wider text-gray-400">Bisnis</div>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><Store className="w-4 h-4 text-indigo-600" /><span>{hasStore ? 'Kelola Toko' : 'Buka Toko'}</span></button>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><CarIcon className="w-4 h-4 text-indigo-600" /><span>{isDriver ? 'Panel Driver' : 'Daftar Driver'}</span></button>
                    </div>
                    <div className="h-px bg-gray-100" />

                    {/* Pengaturan */}
                    <div className="py-2">
                      <div className="px-4 pb-1 text-[11px] uppercase tracking-wider text-gray-400">Pengaturan</div>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><Bell className="w-4 h-4 text-indigo-600" /><span>Notifikasi</span></button>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><Globe className="w-4 h-4 text-indigo-600" /><span>Bahasa</span></button>
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-indigo-50">
                        <div className="flex items-center gap-3 text-gray-700"><Moon className="w-4 h-4 text-indigo-600" /><span>Dark Mode</span></div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={isDark} onChange={(e) => setIsDark(e.target.checked)} />
                          <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                          <div className="-ml-8 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform"></div>
                        </label>
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />

                    {/* Bantuan & Keluar */}
                    <div className="py-2">
                      <div className="px-4 pb-1 text-[11px] uppercase tracking-wider text-gray-400">Bantuan & Keluar</div>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><HelpCircle className="w-4 h-4 text-indigo-600" /><span>Pusat Bantuan</span></button>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><CommentIcon className="w-4 h-4 text-indigo-600" /><span>Feedback</span></button>
                      <a href="/" onClick={() => { localStorage.removeItem('auth') }} className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 cursor-pointer"><LogOut className="w-4 h-4" /><span>Logout</span></a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation (only for Home) */}
      {activeBottomTab === 'home' && (
        <div className="bg-white border-b border-gray-100">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-center relative transition-colors ${
                  activeTab === tab.id ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="pb-20">
        {/* Home Tab Content */}
        {activeBottomTab === 'home' && (
          <div>
            {activeTab === 'chat' && (
              <div className="bg-white">
                {chatList.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center px-4 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="relative mr-4 flex-shrink-0">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl">
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-semibold text-gray-900 truncate">{chat.name}</div>
                      <p className="text-sm text-gray-600 truncate">{chat.message}</p>
                    </div>

                    <div className="ml-3 w-10 flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[11px] text-gray-500">{chat.time}</span>
                      {chat.unread > 0 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'social' && (
              <div className="p-4 space-y-4">
                {socialPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        {post.user.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{post.user}</div>
                        <div className="text-sm text-gray-500">{post.time} yang lalu</div>
                      </div>
                    </div>
                    <p className="text-gray-800 mb-4">{post.content}</p>
                    <div className="flex items-center gap-6 text-gray-500">
                      <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        <CommentIcon className="w-4 h-4" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-gray-700 transition-colors">
                        <Repeat2 className="w-4 h-4" />
                        <span className="text-sm">{post.reposts}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'calls' && (
              <div className="bg-white">
                {callHistory.map((call) => (
                  <div key={call.id} className="flex items-center px-4 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl mr-4">
                      {call.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{call.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className={call.type === 'missed' ? 'text-red-500' : 'text-gray-500'}>
                          {call.type === 'incoming' ? '↙️' : call.type === 'outgoing' ? '↗️' : '📞'}
                        </span>
                        <span>{call.time}</span>
                        {call.duration && <span>• {call.duration}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FAB - Only show on Home tab */}
            <div className="fixed bottom-24 right-6 z-40">
              <AnimatePresence>
                {isFabOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mb-4 space-y-3"
                  >
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ delay: 0.1 }}
                      onClick={() => alert('Fitur Tulis Status')}
                      className="flex items-center gap-3 bg-white rounded-xl shadow-md px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Pencil className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium">Tulis Status</span>
                    </motion.button>
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => alert('Fitur Upload Gambar')}
                      className="flex items-center gap-3 bg-white rounded-xl shadow-md px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ImageIcon className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium">Upload Gambar</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button
                animate={{ rotate: isFabOpen ? 45 : 0 }}
                onClick={() => setIsFabOpen(!isFabOpen)}
                className="w-10 h-10 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        )}

        {/* Market Tab Content */}
        {activeBottomTab === 'market' && (
          <div>
            {/* Sticky Search & Categories */}
            <div className="sticky top-0 bg-white border-b border-gray-100 z-40">
              <div className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                        selectedCategory === category
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="relative aspect-square bg-gray-50 flex items-center justify-center">
                      <product.icon className={`w-12 h-12 ${product.iconColor}`} />
                      <button aria-label="Wishlist" className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur shadow text-gray-500 hover:text-rose-500 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{product.rating}</span>
                        <span className="text-xs text-gray-400">({product.reviews})</span>
                      </div>
                      <div className="text-base font-semibold text-gray-900 mb-2">{product.price}</div>
                      <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                        Tambah ke Keranjang
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Driver Tab Content */}
        {activeBottomTab === 'driver' && (
          <div>
            {/* Hero Header */}
            <div className="bg-white border-b p-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Setara Driver</h2>
              <p className="text-gray-600">Transportasi cepat dan aman di Malang</p>
            </div>

            <div className="p-4 space-y-6">
              {/* Map */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Pilih Lokasi</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titik Jemput</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={isResolvingPickup ? 'Mencari alamat...' : pickupText}
                          placeholder="Klik pada peta untuk set titik jemput"
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                        />
                        <button
                          onClick={() => setMapSelectMode('pickup')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            mapSelectMode === 'pickup' 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Set
                        </button>
                        {pickupPoint && (
                          <button
                            onClick={clearPickup}
                            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={isResolvingDest ? 'Mencari alamat...' : destText}
                          placeholder="Klik pada peta untuk set tujuan"
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                        />
                        <button
                          onClick={() => setMapSelectMode('dest')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            mapSelectMode === 'dest' 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Set
                        </button>
                        {destPoint && (
                          <button
                            onClick={clearDest}
                            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-64">
                  <Suspense fallback={<div className="h-64 bg-gray-100 flex items-center justify-center text-gray-500">Loading map...</div>}>
                    <DriverMap
                      mode={mapSelectMode}
                      center={malangCenter}
                      pickup={pickupPoint}
                      dest={destPoint}
                      onPick={(ll) => handleMapClick(ll)}
                      onDest={(ll) => handleMapClick(ll)}
                    />
                  </Suspense>
                </div>
              </div>

              {/* Booking Form */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Detail Booking</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kendaraan</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsVehicleOpen(!isVehicleOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = vehicleOptions.find(v => v.key === vehicleType)?.icon
                            return IconComponent ? <IconComponent className="w-5 h-5 text-gray-600" /> : null
                          })()}
                          <span>{vehicleOptions.find(v => v.key === vehicleType)?.label}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isVehicleOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isVehicleOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          {vehicleOptions.map((option) => (
                            <button
                              key={option.key}
                              onClick={() => {
                                setVehicleType(option.key)
                                setIsVehicleOpen(false)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                              <option.icon className="w-5 h-5 text-gray-600" />
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option>Cash</option>
                      <option>Setara Wallet</option>
                      <option>Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jadwal</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option>Sekarang</option>
                      <option>1 Jam lagi</option>
                      <option>2 Jam lagi</option>
                      <option>Besok pagi</option>
                    </select>
                  </div>

                  <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Book Driver
                  </button>
                </div>
              </div>

              {/* Active Orders */}
              {activeOrders.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Pesanan Aktif</h3>
                  
                  <div className="space-y-3">
                    {activeOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-900">{order.driver}</div>
                            <div className="text-sm text-gray-600">{order.vehicle} • {order.plate}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">{order.rating}</span>
                          </div>
                        </div>
                        <div className="text-sm text-indigo-600 font-medium">{order.status}</div>
                        <div className="text-xs text-gray-500">ETA: {order.eta}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SERA (Assistant) Tab Content */}
        {activeBottomTab === 'sera' && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">SERA – Setara Assistant</h2>
            <p className="text-gray-600">Tanya SERA untuk bantuan cepat seputar Setaradapps.</p>
          </div>
        )}

        {/* Wallet Tab Content with P2P & DeFi sub-views */}
        {activeBottomTab === 'wallet' && (
          <div className="p-4 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="flex border-b border-gray-100">
                <button onClick={() => setWalletView('overview')} className={`flex-1 py-3 text-center font-medium transition-colors ${walletView === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Overview</button>
                <button onClick={() => setWalletView('p2p')} className={`flex-1 py-3 text-center font-medium transition-colors ${walletView === 'p2p' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                  <span className="inline-flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> P2P</span>
                </button>
                <button onClick={() => setWalletView('defi')} className={`flex-1 py-3 text-center font-medium transition-colors ${walletView === 'defi' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                  <span className="inline-flex items-center gap-2"><Coins className="w-4 h-4" /> DeFi</span>
                </button>
              </div>

              <div className="p-4">
                {walletView === 'overview' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border">
                      <div className="flex border-b border-gray-100">
                        <button onClick={() => setWalletTab('web2')} className={`flex-1 py-3 text-center font-medium transition-colors ${walletTab === 'web2' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Fiat Balance</button>
                        <button onClick={() => setWalletTab('web3')} className={`flex-1 py-3 text-center font-medium transition-colors ${walletTab === 'web3' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Crypto Balance</button>
                      </div>
                      <div className="p-4">
                        {walletTab === 'web2' && (
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-gray-900">Rp 2.450.000</div>
                              <div className="text-sm text-gray-600">Total Saldo Fiat</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-lg font-semibold text-gray-900">Rp 1.200.000</div>
                                <div className="text-xs text-gray-600">Saldo Utama</div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-lg font-semibold text-gray-900">Rp 1.250.000</div>
                                <div className="text-xs text-gray-600">Tabungan</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {walletTab === 'web3' && (
                          <div className="space-y-4">
                            <div className="text-center"><SimpleWalletConnect /></div>
                            <WalletBalance />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button className="bg-white rounded-lg shadow-sm border p-4 text-center hover:bg-gray-50 transition-colors">
                        <Send className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <div className="font-medium text-gray-900">Send</div>
                        <div className="text-xs text-gray-600">Transfer uang</div>
                      </button>
                      <button className="bg-white rounded-lg shadow-sm border p-4 text-center hover:bg-gray-50 transition-colors">
                        <ArrowUpRight className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <div className="font-medium text-gray-900">Receive</div>
                        <div className="text-xs text-gray-600">Terima uang</div>
                      </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                      <h3 className="font-semibold text-gray-900 mb-4">QR Code Saya</h3>
                      <div className="w-32 h-32 mx-auto bg-gray-900 rounded-lg mb-4 flex items-center justify-center text-white text-xs">QR CODE</div>
                      <p className="text-sm text-gray-600">Scan untuk transfer ke akun saya</p>
                    </div>
                  </div>
                )}

                {walletView === 'p2p' && (
                  <div className="pb-20">
                    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
                      <div className="flex justify-between items-center px-4 py-4">
                        <h1 className="text-xl font-bold text-indigo-600">P2P Exchange</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ArrowLeftRight className="w-4 h-4 text-indigo-500" />
                          <span>Fiat ↔ SETARA</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4"><P2PComplete /></div>
                  </div>
                )}

                {walletView === 'defi' && (
                  <div className="space-y-6">
                    <div className="bg-white border-b p-6">
                      <h2 className="text-xl font-bold mb-2 text-gray-900">DeFi Web3</h2>
                      <p className="text-gray-600 mb-4">Investasi masa depan dengan teknologi blockchain</p>
                      <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Connect Wallet</button>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-sm border p-4 text-center"><div className="text-2xl font-bold text-indigo-600">$2.5M</div><div className="text-xs text-gray-600">TVL</div></div>
                        <div className="bg-white rounded-lg shadow-sm border p-4 text-center"><div className="text-2xl font-bold text-indigo-600">15%</div><div className="text-xs text-gray-600">APY Rata-rata</div></div>
                        <div className="bg-white rounded-lg shadow-sm border p-4 text-center"><div className="text-2xl font-bold text-indigo-600">12</div><div className="text-xs text-gray-600">Projects</div></div>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border p-4">
                        <h3 className="font-semibold text-gray-900 mb-4">Real World Assets (RWA)</h3>
                        <div className="space-y-3">
                          {rwaProjects.map((project) => (
                            <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3"><project.icon className="w-6 h-6 text-indigo-600" /><div><div className="font-semibold text-gray-900">{project.name}</div><div className="text-sm text-gray-600">Min. Investment: {project.investment}</div></div></div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'Active' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>{project.status}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-3"><div><div className="text-sm text-gray-600">APY</div><div className="font-semibold text-indigo-600">{project.apy}</div></div><div><div className="text-sm text-gray-600">Risk Level</div><div className="font-semibold text-gray-600">{project.risk}</div></div></div>
                              <button className={`w-full py-2 rounded-lg font-medium transition-colors ${project.status === 'Active' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`} disabled={project.status !== 'Active'}>{project.status === 'Active' ? 'Invest Now' : 'Coming Soon'}</button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border p-4"><div className="flex items-center gap-3 mb-3"><ShieldCheck className="w-6 h-6 text-indigo-600" /><h3 className="font-semibold text-gray-900">Keamanan Terjamin</h3></div><p className="text-sm text-gray-600">Semua investasi dijamin melalui smart contract yang telah diaudit dan teknologi blockchain yang transparan.</p></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'home', icon: HomeIcon, label: 'Home' },
            { id: 'market', icon: ShoppingBag, label: 'Market' },
            { id: 'sera', icon: Cpu, label: 'SERA' },
            { id: 'driver', icon: CarIcon, label: 'Driver' },
            { id: 'wallet', icon: WalletIcon, label: 'Wallet' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveBottomTab(tab.id)}
              className={`flex flex-col items-center py-1 px-2 transition-colors ${
                activeBottomTab === tab.id ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard