'use client'

import { FC, Suspense, useEffect, useRef, useState } from 'react'
// import { useRouter } from 'next/navigation'
import { Search, MoreVertical, HelpCircle, Bell, Globe, LogOut, Home as HomeIcon, ShoppingBag, Car as CarIcon, Coins, Wallet as WalletIcon, Star, Plus, MapPinned, Leaf, Building2, Cpu, ShieldCheck, ArrowLeft, TrendingUp, MapPin, ChevronDown, Clock, Bike, Truck, Heart, MessageSquare as CommentIcon, Repeat2, Image as ImageIcon, Send, Pencil, X, User, Settings, Store, Smartphone, Package, Box, Backpack, Gem, Sun, Link2, Phone, Video, Smile, Link, Camera, Pin, PinOff, Copy, Reply, CornerUpRight, Trash2, UserMinus, ShieldX } from 'lucide-react'

import dynamic from 'next/dynamic'
import { io, Socket } from 'socket.io-client'
import type { LatLngLiteral } from 'leaflet'
import SimpleWalletConnect from '@/components/SimpleWalletConnect'
import WalletBalance from '@/components/WalletBalance'
import HybridWallet from '@/components/HybridWallet'
import P2POrderBook from '@/components/P2POrderBook'
import P2PComplete from '@/components/P2PComplete'
import Image from 'next/image'
import Web3Hub from '@/components/Web3Hub'
import { BaseIcon } from '@/components/icons/CryptoIcons'
import UserSearch from '@/components/UserSearch'
import RealTimeChat from '@/components/RealTimeChat'
import { apiFetch, getChatWsUrl } from '@/lib/chatApi'

const DriverMap = dynamic(() => import('../../components/DriverMap'), { ssr: false })

type Message = {
  id: number
  text: string
  time: string
  from: 'me' | 'them'
  replyTo?: { id: number; text: string; from: 'me' | 'them' }
  createdAt?: string
}

const Dashboard: FC = () => {
  // const router = useRouter()
  const [activeTab, setActiveTab] = useState('chat')
  const [activeBottomTab, setActiveBottomTab] = useState('home')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [hasStore, setHasStore] = useState(false)
  const [isDriver, setIsDriver] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const [activeChat, setActiveChat] = useState<(typeof chatList)[number] | null>(null)
  const [chatMsgs, setChatMsgs] = useState<Message[]>([])
  const [pinnedMsgs, setPinnedMsgs] = useState<Message[]>([])
  const [showMsgMenu, setShowMsgMenu] = useState(false)
  const [msgMenuAt, setMsgMenuAt] = useState<{x:number;y:number}>({x:0,y:0})
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null)
  const [replyTarget, setReplyTarget] = useState<Message | null>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const lastTouchPosRef = useRef<{ x: number; y: number } | null>(null)
  const LONG_PRESS_MS = 500

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }
  const chatBottomRef = useRef<HTMLDivElement | null>(null)
  const [showChatMenu, setShowChatMenu] = useState(false)
  const chatMenuRef = useRef<HTMLDivElement | null>(null)
  const fabMenuRef = useRef<HTMLDivElement | null>(null)
  const profileRef = useRef<HTMLDivElement | null>(null)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)
  const financeMenuRef = useRef<HTMLDivElement | null>(null)
  const businessMenuRef = useRef<HTMLDivElement | null>(null)
  const settingsMainMenuRef = useRef<HTMLDivElement | null>(null)
  const helpMenuRef = useRef<HTMLDivElement | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [walletTab, setWalletTab] = useState<'web2' | 'web3'>('web2')
  const [walletView, setWalletView] = useState<'overview' | 'p2p' | 'defi' | 'web3'>('overview')
  const [isWalletFullscreen, setIsWalletFullscreen] = useState(false)
  // Always expose Web3 tab in public app; actual connection handled by provider
  const enableWeb3 = true
  const [vehicleType, setVehicleType] = useState<'motor' | 'mobil' | 'pickup'>('motor')
  const [isVehicleOpen, setIsVehicleOpen] = useState(false)
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [showSeraChat, setShowSeraChat] = useState(false)
  
  const [pickupPoint, setPickupPoint] = useState<LatLngLiteral | null>(null)
  const [destPoint, setDestPoint] = useState<LatLngLiteral | null>(null)
  const [mapSelectMode, setMapSelectMode] = useState<'pickup' | 'dest'>('pickup')
  const [pickupText, setPickupText] = useState('')
  const [destText, setDestText] = useState('')
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [showRealTimeChat, setShowRealTimeChat] = useState(false)
  const [chatTargetUser, setChatTargetUser] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isWsConnected, setIsWsConnected] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showFinanceMenu, setShowFinanceMenu] = useState(false)
  const [showBusinessMenu, setShowBusinessMenu] = useState(false)
  const [showSettingsMainMenu, setShowSettingsMainMenu] = useState(false)
  const [showHelpMenu, setShowHelpMenu] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
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

  const loadConversationMessages = async (conversationId: any) => {
    if (!authToken) return
    try {
      const data: any[] = await apiFetch<any[]>(`conversations/${conversationId}/messages?limit=30`, { token: authToken })
      // Sort ascending by createdAt if backend returns newest-first
      const sorted = [...data].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      const mapped: Message[] = sorted.map((m: any, idx: number) => ({
        id: idx + 1,
        text: m?.content || '',
        time: m?.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        from: m?.senderId && currentUser?.id && m.senderId === currentUser.id ? 'me' : 'them',
        replyTo: m?.replyToId ? { id: 0, text: m?.replyTo?.content || '', from: 'them' } : undefined,
        createdAt: m?.createdAt || undefined,
      }))
      setChatMsgs(mapped)
    } catch (e) {
      console.warn('Failed to load messages', e)
      setChatMsgs([])
    }
  }

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!activeChat || !authToken) return
    const text = messageInput.trim()
    if (!text) return

    const tempId = Date.now()
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const optimistic: Message = {
      id: tempId,
      text,
      time: nowStr,
      from: 'me',
      replyTo: replyTarget ? { id: replyTarget.id, text: replyTarget.text, from: replyTarget.from } : undefined,
    }
    setChatMsgs(prev => [...prev, optimistic])
    setMessageInput('')
    setReplyTarget(null)

    try {
      if (socket && isWsConnected) {
        socket.emit('send_message', { conversationId: activeChat.id, content: text, type: 'TEXT', replyToId: replyTarget ? replyTarget.id : undefined })
      } else {
        await apiFetch(`conversations/${activeChat.id}/messages`, {
          method: 'POST',
          token: authToken,
          body: JSON.stringify({ type: 'TEXT', content: text, replyToId: replyTarget ? replyTarget.id : undefined })
        })
      }
    } catch (err) {
      console.warn('Failed to send message', err)
      setChatMsgs(prev => prev.filter(m => m.id !== tempId))
      setMessageInput(text)
    }
  }

  const handleUnfollow = () => {
    setShowUnfollowConfirm(false)
    setShowChatMenu(false)
    setActiveChat(null)
    setChatMsgs([])
    setPinnedMsgs([])
    setReplyTarget(null)
  }

  const handleBlock = () => {
    setShowBlockConfirm(false)
    setShowChatMenu(false)
    setActiveChat(null)
    setChatMsgs([])
    setPinnedMsgs([])
    setReplyTarget(null)
  }

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

  // Handle start chat from UserSearch
  const handleStartChat = (user: any) => {
    console.log('handleStartChat called with user:', user)
    console.log('currentUser:', currentUser)
    
    // Set target user and show real-time chat
    setChatTargetUser(user)
    setShowRealTimeChat(true)
    setShowUserSearch(false)
    
    console.log('Chat state updated - showRealTimeChat:', true)
  }

  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)

  // Load user profile from API
  const loadProfile = async (token: string) => {
    setIsLoadingProfile(true)
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
        setCurrentUser(data.user)
      } else {
        console.error('Failed to load profile:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token) {
      setIsAuthed(true)
      setAuthToken(token)
      // Load fresh profile data from API
      loadProfile(token)
      
      // Set current user data for real-time chat (fallback from localStorage)
      if (user) {
        try {
          const userData = JSON.parse(user)
          setCurrentUser(userData)
        } catch (error) {
          console.error('Failed to parse user data:', error)
        }
      }
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login'
    }
  }, [])

  // Load conversations from backend once authed
  useEffect(() => {
    const loadConversations = async () => {
      if (!authToken) return
      try {
        setIsLoadingConversations(true)
        const data = await apiFetch<any[]>('conversations', { token: authToken })
        setConversations(Array.isArray(data) ? data : [])
      } catch (e) {
        console.warn('Failed to load conversations', e)
      } finally {
        setIsLoadingConversations(false)
      }
    }
    if (isAuthed) loadConversations()
  }, [isAuthed, authToken])

  // Setup WebSocket
  useEffect(() => {
    if (!authToken) return
    const s = io(getChatWsUrl(), {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
    })
    s.on('connect', () => setIsWsConnected(true))
    s.on('disconnect', () => setIsWsConnected(false))
    s.on('new_message', (m: any) => {
      setChatMsgs(prev => [...prev, {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        text: m?.content || '',
        time: m?.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        from: m?.senderId && currentUser?.id && m.senderId === currentUser.id ? 'me' : 'them',
        replyTo: m?.replyTo ? { id: 0, text: m.replyTo.content || '', from: 'them' } : undefined,
        createdAt: m?.createdAt || undefined,
      }])
    })
    setSocket(s)
    return () => { s.close() }
  }, [authToken, currentUser])

  // Join active conversation room
  useEffect(() => {
    if (!socket || !isWsConnected) return
    if (activeChat?.id) {
      socket.emit('join_conversation', { conversationId: activeChat.id })
    }
  }, [socket, isWsConnected, activeChat?.id])

  // Close profile popover on outside click
  useEffect(() => {
    if (!showProfile) return
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfile])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
        setShowChatMenu(false)
      }
      if (fabMenuRef.current && !fabMenuRef.current.contains(event.target as Node)) {
        setIsFabOpen(false)
      }
      // Close list dropdown submenus when clicking outside them
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false)
      }
      if (financeMenuRef.current && !financeMenuRef.current.contains(event.target as Node)) {
        setShowFinanceMenu(false)
      }
      if (businessMenuRef.current && !businessMenuRef.current.contains(event.target as Node)) {
        setShowBusinessMenu(false)
      }
      if (settingsMainMenuRef.current && !settingsMainMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMainMenu(false)
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setShowHelpMenu(false)
      }
    }

    if (isDropdownOpen || showChatMenu || isFabOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen, showChatMenu, isFabOpen])

  const tabs = [
    { id: 'chat', label: 'Privat Chat' },
    { id: 'calls', label: 'Panggilan' },
    { id: 'social', label: 'Sosial' },
  ]

  const chatList = conversations.map((c: any) => {
    const participants = (c.participants || []).map((p: any) => p.user || p).filter(Boolean)
    const otherNames = participants.filter((u: any) => u.id !== currentUser?.id).map((u: any) => u.username || u.name).filter(Boolean)
    const displayName = c.name || otherNames.join(', ') || 'Unknown'
    const lastMsg = (c.messages && c.messages[c.messages.length - 1]) || c.lastMessage
    const timeStr = lastMsg?.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    const avatar = (displayName?.[0] || '?').toUpperCase()
    return {
      id: c.id,
      name: displayName,
      message: lastMsg?.content || '',
      time: timeStr,
      avatar,
      unread: c.unreadCount || 0,
      online: false,
      lastSeen: c.lastSeen || '',
      raw: c,
    }
  })

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
          <a
            href="/login"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center"
          >
            Login
          </a>
        </div>
      </div>
    )
  }

  if (isAuthed === null) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 scrollbar-hide">
      {/* Enhanced Wallet - Multi-Currency Support with Fullscreen */}
      {activeBottomTab === 'wallet' && (
        <div className="min-h-screen bg-gray-50">
          {/* Fullscreen P2P Trading */}
          {isWalletFullscreen && walletView === 'p2p' && (
            <div className="fixed inset-0 bg-white z-50 flex flex-col">
              {/* P2P Header */}
              <div className="flex items-center px-4 py-4 border-b border-gray-200 bg-white">
                <button
                  onClick={() => {
                    setIsWalletFullscreen(false)
                    setWalletView('overview')
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700 mr-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Repeat2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">P2P</h1>
                    <p className="text-sm text-gray-500">Jual beli aset secara P2P</p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-700" aria-label="Bantuan">
                    <HelpCircle className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-700" aria-label="Notifikasi">
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
                
              </div>
              
              {/* P2P Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50 scrollbar-hide">
                <P2POrderBook showHeader={false} />
              </div>
            </div>
          )}

          {/* Fullscreen DeFi */}
          {isWalletFullscreen && walletView === 'defi' && (
            <div className="fixed inset-0 bg-white z-50 flex flex-col">
              {/* DeFi Header */}
              <div className="flex items-center px-4 py-4 border-b border-gray-200 bg-white">
                <button
                  onClick={() => {
                    setIsWalletFullscreen(false)
                    setWalletView('overview')
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700 mr-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Coins className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">DeFi Investment</h1>
                    <p className="text-sm text-gray-500">Decentralized Finance Opportunities</p>
                  </div>
                </div>
              </div>
              
              {/* DeFi Content */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                <div className="space-y-6">
                  {/* DeFi Stats */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-xl font-bold text-gray-900">$2.5M</div>
                        <div className="text-gray-600 text-xs">Total Value Locked</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-xl font-bold text-gray-900">15.2%</div>
                        <div className="text-gray-600 text-xs">Avg APY</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-xl font-bold text-gray-900">12</div>
                        <div className="text-gray-600 text-xs">Active Pools</div>
                      </div>
                    </div>
                  </div>

                  {/* Investment Pools */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Opportunities</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Real Estate Jakarta', icon: Building2, iconColor: 'text-teal-600', apy: '12.5%', risk: 'Medium', invested: 'Rp 1.000.000', returns: '+Rp 125.000', status: 'Active' },
                        { name: 'Gold Mining Venture', icon: Gem, iconColor: 'text-amber-600', apy: '8.7%', risk: 'Low', invested: 'Rp 500.000', returns: '+Rp 43.500', status: 'Active' },
                        { name: 'Solar Energy Farm', icon: Sun, iconColor: 'text-yellow-600', apy: '18.3%', risk: 'High', invested: 'Rp 2.000.000', returns: '+Rp 366.000', status: 'Active' }
                      ].map((pool, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center`}>
                                <div className={`w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center`}>
                                  <pool.icon className={`w-4 h-4 ${pool.iconColor}`} />
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{pool.name}</div>
                                <div className="text-sm text-gray-600">Min. Investment: Rp 100.000</div>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              pool.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : pool.status === 'Coming Soon'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {pool.status}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{pool.apy}</div>
                              <div className="text-xs text-gray-600">Annual APY</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{pool.risk}</div>
                              <div className="text-xs text-gray-600">Risk Level</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{pool.returns}</div>
                              <div className="text-xs text-gray-600">Returns</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Invested: <span className="font-medium text-gray-900">{pool.invested}</span>
                            </div>
                            <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              pool.status === 'Active' 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}>
                              {pool.status === 'Active' ? 'Manage' : 'Coming Soon'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Security Guaranteed</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      All investments are secured through audited smart contracts and backed by real-world assets. 
                      Your funds are protected by multi-signature wallets and insurance coverage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen Web3 */}
          {isWalletFullscreen && walletView === 'web3' && (
            <div className="fixed inset-0 bg-white z-50 flex flex-col">
              <div className="flex items-center px-4 py-4 border-b border-gray-200 bg-white">
                <button
                  onClick={() => {
                    setIsWalletFullscreen(false)
                    setWalletView('overview')
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700 mr-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Web3</h1>
                    <p className="text-sm text-gray-500">Wallet, assets, treasury (Base)</p>
                  </div>
                </div>
              </div>

              <Web3Hub
                onSwapToWeb2={() => alert('Swap ke Web2 (dev mock): kirim ke Treasury, backend kredit saldo Web2)')}
                treasuryAddress={process.env.NEXT_PUBLIC_TREASURY_ADDRESS}
              />
            </div>
          )}

          {/* Default Wallet View (when not fullscreen) */}
          {!isWalletFullscreen && (
            <>
              {/* Enhanced Header */}
              <div className="bg-white p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Setara Wallet</h1>
                    <p className="text-gray-500 text-sm">Multi-Currency Digital Finance Hub</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BaseIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                {/* Total Portfolio Value */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-1">Total Portfolio Value</p>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {(process.env.NEXT_PUBLIC_DEV_MOCK === '1' || process.env.NODE_ENV !== 'production') ? '$2,141.31' : '$0.00'}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">
                        {(process.env.NEXT_PUBLIC_DEV_MOCK === '1' || process.env.NODE_ENV !== 'production') ? '+5.2% (24h)' : 'Connect Wallet'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Tab Navigation */}
              <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="flex px-4">
                  {[
                    { id: 'overview', label: 'Overview', icon: HomeIcon },
                    { id: 'p2p', label: 'P2P', icon: Repeat2 },
                    { id: 'defi', label: 'DeFi', icon: Coins },
                    { id: 'web3', label: 'Web3', icon: Link2 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setWalletView(tab.id as 'overview' | 'p2p' | 'defi' | 'web3')
                        if (tab.id !== 'overview') {
                          setIsWalletFullscreen(true)
                        } else {
                          setIsWalletFullscreen(false)
                        }
                      }}
                      className={`flex-1 py-4 px-3 text-center relative transition-all duration-200 ${
                        walletView === tab.id 
                          ? 'text-indigo-600 font-semibold' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <tab.icon className="w-4 h-4" />
                        <span className="text-sm">{tab.label}</span>
                      </div>
                      {walletView === tab.id && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-indigo-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Overview Tab Content - Only when not fullscreen */}
          {!isWalletFullscreen && walletView === 'overview' && (
            <div className="p-4 space-y-6">
              {/* Multi-Currency Wallet */}
              <HybridWallet />
            </div>
          )}
        </div>
      )}

      {/* Header (only for Home) */}
      {activeBottomTab === 'home' && (
        <div className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="flex justify-between items-center px-4 py-4">
            <h1 className="text-2xl font-bold text-indigo-600">Setara</h1>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-indigo-600 transition-colors"><Search className="w-6 h-6" /></button>
              <div className="relative">
                <button onClick={toggleDropdown} className="text-gray-600 hover:text-indigo-600 transition-colors"><MoreVertical className="w-6 h-6" /></button>
                {isDropdownOpen && (
                  <div ref={dropdownRef} className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-indigo-100 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 rounded-t-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {userProfile?.username ? userProfile.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {userProfile?.username || 'User'}
                          </div>
                          <div className="text-xs text-gray-600">
                            {userProfile?.email || '(email belum dimuat)'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Akun */}
                    <div className="py-2">
                      
                      <div className="relative" ref={accountMenuRef}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowAccountMenu(v => !v) }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center justify-between gap-3"
                        >
                          <span className="flex items-center gap-3">
                            <User className="w-4 h-4 text-indigo-600" />
                            <span>Akun</span>
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showAccountMenu && (
                          <div className="absolute left-4 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg">Profil Saya</button>
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg">Keamanan</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />

                    {/* Keuangan */}
                    <div className="py-2">
                      
                      <div className="relative" ref={financeMenuRef}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowFinanceMenu(v => !v) }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center justify-between gap-3"
                        >
                          <span className="flex items-center gap-3">
                            <WalletIcon className="w-4 h-4 text-indigo-600" />
                            <span>Keuangan</span>
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showFinanceMenu && (
                          <div className="absolute left-4 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg">Wallet & Pembayaran</button>
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg">Pesanan Saya</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />

                    {/* Bisnis */}
                    <div className="py-2">
                      
                      <div className="relative" ref={businessMenuRef}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowBusinessMenu(v => !v) }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center justify-between gap-3"
                        >
                          <span className="flex items-center gap-3">
                            <Store className="w-4 h-4 text-indigo-600" />
                            <span>Bisnis</span>
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showBusinessMenu && (
                          <div className="absolute left-4 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg">{hasStore ? 'Kelola Toko' : 'Buka Toko'}</button>
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg">{isDriver ? 'Panel Driver' : 'Daftar Driver'}</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />

                    {/* Pengaturan */}
                    <div className="py-2">
                      
                      <div className="relative" ref={settingsMainMenuRef}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowSettingsMainMenu(v => !v) }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center justify-between gap-3"
                        >
                          <span className="flex items-center gap-3">
                            <Settings className="w-4 h-4 text-indigo-600" />
                            <span>Pengaturan</span>
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showSettingsMainMenu && (
                          <div className="absolute left-4 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg">Notifikasi</button>
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg">Bahasa</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />

                    {/* Bantuan & Keluar */}
                    <div className="py-2">
                      
                      <div className="relative" ref={helpMenuRef}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowHelpMenu(v => !v) }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 flex items-center justify-between gap-3"
                        >
                          <span className="flex items-center gap-3">
                            <HelpCircle className="w-4 h-4 text-indigo-600" />
                            <span>Bantuan & Keluar</span>
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showHelpMenu && (
                          <div className="absolute left-4 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg">Pusat Bantuan</button>
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50">Feedback</button>
                            <a href="/" onClick={() => { 
                              localStorage.removeItem('auth')
                              localStorage.removeItem('token')
                              localStorage.removeItem('user')
                            }} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 rounded-b-lg cursor-pointer">Logout</a>
                          </div>
                        )}
                      </div>
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
                {!activeChat && (
                  <div>

                    {chatList.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setActiveChat(chat)
                          loadConversationMessages(chat.id)
                        }}
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

                {activeChat && (
                  <div className="fixed inset-0 bg-white z-50 flex flex-col">
                    {/* Chat Header - Full Width */}
                    <div className="flex items-center px-2 py-4 border-b border-gray-200 bg-white">
                      <button
                        onClick={() => {
                          setActiveChat(null)
                          setChatMsgs([])
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="relative mr-3 ml-1">
                        <button
                          onClick={() => setShowProfile((v) => !v)}
                          className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-lg font-semibold"
                          title="Lihat profil"
                        >
                          {activeChat.avatar}
                        </button>
                        {showProfile && (
                          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-28">
                            <div ref={profileRef} className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                              <div className="bg-indigo-100 w-56 h-56 flex items-center justify-center text-6xl font-bold text-indigo-600">
                                {activeChat.avatar}
                              </div>
                              <div className="px-3 py-2 text-center">
                                <div className="text-base font-semibold text-gray-900">{activeChat.name}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg">{activeChat.name}</div>
                        <div className="text-sm text-gray-500">
                          {activeChat.online ? (
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Online
                            </span>
                          ) : (
                            activeChat.lastSeen ? `Terakhir dilihat ${activeChat.lastSeen}` : 'Offline'
                          )}
                        </div>
                      </div>
                      {/* Call Buttons */}
                      <div className="flex items-center gap-2 mr-2">
                        <button 
                          onClick={() => alert('Voice Call - Fitur akan segera hadir!')}
                          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                          title="Voice Call"
                        >
                          <Phone className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => alert('Video Call - Fitur akan segera hadir!')}
                          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                          title="Video Call"
                        >
                          <Video className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="relative" ref={chatMenuRef}>
                        <button 
                          onClick={() => setShowChatMenu(!showChatMenu)}
                          className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {showChatMenu && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                            <div className="py-2">
                              <button 
                                onClick={() => { setShowProfile(true); setShowChatMenu(false) }}
                                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                              >
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">Lihat Profil</span>
                              </button>
                              
                              <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                                <ImageIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">Media & File</span>
                              </button>
                              <div className="h-px bg-gray-100 my-2" />
                              <div className="relative">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setShowNotificationsMenu((v) => !v) }}
                                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center justify-between gap-3"
                                >
                                  <span className="flex items-center gap-3">
                                    <Bell className={`w-4 h-4 ${notificationsEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                                    <span className="text-sm">Notifikasi</span>
                                  </span>
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>
                                {showNotificationsMenu && (
                                  <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                    <button 
                                      onClick={() => { setNotificationsEnabled(true); setShowNotificationsMenu(false) }}
                                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg ${notificationsEnabled ? 'text-green-600' : 'text-gray-700'}`}
                                    >
                                      On
                                    </button>
                                    <button 
                                      onClick={() => { setNotificationsEnabled(false); setShowNotificationsMenu(false) }}
                                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg ${!notificationsEnabled ? 'text-red-600' : 'text-gray-700'}`}
                                    >
                                      Off
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setShowSettingsMenu(v => !v) }}
                                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center justify-between gap-3"
                                >
                                  <span className="flex items-center gap-3">
                                    <Settings className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">Pengaturan</span>
                                  </span>
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>
                                {showSettingsMenu && (
                                  <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                    <button 
                                      onClick={() => { setShowUnfollowConfirm(true); setShowSettingsMenu(false) }}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-orange-600"
                                    >
                                      Unfollow
                                    </button>
                                    <button 
                                      onClick={() => { setShowBlockConfirm(true); setShowSettingsMenu(false) }}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600"
                                    >
                                      Blockir
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="h-px bg-gray-100 my-2" />
                              <div className="h-px bg-gray-100 my-2" />
                              <button 
                                onClick={() => {
                                  if (confirm('Hapus semua pesan dalam chat ini?')) {
                                    setChatMsgs([])
                                    setShowChatMenu(false)
                                  }
                                }}
                                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
                              >
                                <X className="w-4 h-4 text-red-500" />
                                <span className="text-sm">Hapus Chat</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dialog Konfirmasi Unfollow */}
                    {showUnfollowConfirm && (
                      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
                          <div className="text-center">
                            <UserMinus className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                            <div className="text-lg font-semibold text-gray-900 mb-1">Unfollow User</div>
                            <div className="text-gray-600 mb-5">Apakah Anda yakin ingin menghapus pertemanan dengan user ini?</div>
                            <div className="flex gap-3">
                              <button onClick={() => setShowUnfollowConfirm(false)} className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Batal</button>
                              <button onClick={handleUnfollow} className="flex-1 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600">Ya, Unfollow</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dialog Konfirmasi Block */}
                    {showBlockConfirm && (
                      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
                          <div className="text-center">
                            <ShieldX className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <div className="text-lg font-semibold text-gray-900 mb-1">Blockir User</div>
                            <div className="text-gray-600 mb-5">Apakah Anda yakin ingin memblokir user ini?</div>
                            <div className="flex gap-3">
                              <button onClick={() => setShowBlockConfirm(false)} className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Batal</button>
                              <button onClick={handleBlock} className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Ya, Blockir</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Messages Area - Full Screen */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
                      {/* Pinned messages */}
                      {pinnedMsgs.length > 0 && (
                        <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
                            <Pin className="w-4 h-4" /> Pesan Penting
                          </div>
                          <div className="space-y-1">
                            {pinnedMsgs.map(pm => (
                              <div key={`pin-${pm.id}`} className="flex items-center justify-between gap-2">
                                <div className="text-sm text-amber-800 truncate">{pm.text}</div>
                                <button
                                  onClick={() => setPinnedMsgs(prev => prev.filter(x => x.id !== pm.id))}
                                  className="text-amber-700 hover:text-amber-900 p-1 rounded hover:bg-amber-100"
                                  title="Lepas pin"
                                >
                                  <PinOff className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3" onContextMenu={(e)=> e.preventDefault()}>
                        {chatMsgs.map((m) => (
                          <div 
                            key={m.id} 
                            className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
                            onContextMenu={(e)=>{
                              e.preventDefault();
                              setSelectedMsg(m);
                              setMsgMenuAt({ x: e.clientX, y: e.clientY });
                              setShowMsgMenu(true);
                            }}
                            onDoubleClick={(e) => {
                              setSelectedMsg(m);
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setMsgMenuAt({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                              setShowMsgMenu(true);
                            }}
                            onTouchStart={(e) => {
                              if (e.touches.length !== 1) return
                              const t = e.touches[0]
                              longPressStartPosRef.current = { x: t.clientX, y: t.clientY }
                              lastTouchPosRef.current = { x: t.clientX, y: t.clientY }
                              clearLongPressTimer()
                              longPressTimerRef.current = setTimeout(() => {
                                const pos = lastTouchPosRef.current || { x: t.clientX, y: t.clientY }
                                setSelectedMsg(m)
                                setMsgMenuAt({ x: pos.x + 8, y: pos.y + 8 })
                                setShowMsgMenu(true)
                              }, LONG_PRESS_MS)
                            }}
                            onTouchMove={(e) => {
                              if (!longPressStartPosRef.current) return
                              const t = e.touches[0]
                              lastTouchPosRef.current = { x: t.clientX, y: t.clientY }
                              const dx = Math.abs(t.clientX - longPressStartPosRef.current.x)
                              const dy = Math.abs(t.clientY - longPressStartPosRef.current.y)
                              if (dx > 10 || dy > 10) clearLongPressTimer()
                            }}
                            onTouchEnd={() => { clearLongPressTimer(); longPressStartPosRef.current = null; lastTouchPosRef.current = null }}
                            onTouchCancel={() => { clearLongPressTimer(); longPressStartPosRef.current = null; lastTouchPosRef.current = null }}
                          >
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              m.from === 'me' 
                                ? 'bg-indigo-50 text-gray-900 border border-indigo-100 rounded-br-md' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                            }`}>
                              {m.replyTo && (
                                <div className={`mb-2 px-3 py-2 text-xs rounded-lg border ${m.from === 'me' ? 'bg-white/60 border-indigo-100' : 'bg-gray-50 border-gray-200'}`}>
                                  <div className="text-gray-600 line-clamp-2">{m.replyTo.text}</div>
                                </div>
                              )}
                              <div className="text-sm">{m.text}</div>
                              <div className={`text-xs mt-1 ${m.from === 'me' ? 'text-gray-500' : 'text-gray-400'}`}>
                                {m.time}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={chatBottomRef} />
                      </div>
                    </div>

                    {/* Message context menu */}
                    {showMsgMenu && selectedMsg && (
                      <div className="fixed inset-0 z-50" onClick={() => setShowMsgMenu(false)}>
                        <div 
                          className="absolute bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48"
                          style={{ left: Math.min(Math.max(8, msgMenuAt.x), window.innerWidth - 208), top: Math.min(Math.max(8, msgMenuAt.y), window.innerHeight - 188) }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {pinnedMsgs.some(p=> p.id === selectedMsg.id) ? (
                            <button 
                              onClick={() => { setPinnedMsgs((prev)=> prev.filter(p=> p.id !== selectedMsg.id)); setShowMsgMenu(false) }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <PinOff className="w-4 h-4" /> Lepas pin
                            </button>
                          ) : (
                            <button 
                              onClick={() => { setPinnedMsgs((prev)=> prev.some(p=>p.id===selectedMsg.id)? prev : [...prev, selectedMsg]); setShowMsgMenu(false) }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Pin className="w-4 h-4" /> Pin pesan
                            </button>
                          )}
                          <button 
                            onClick={() => { navigator.clipboard.writeText(selectedMsg.text).catch(()=>{}); setShowMsgMenu(false) }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" /> Copy
                          </button>
                          <button 
                            onClick={() => { setReplyTarget(selectedMsg); setShowMsgMenu(false) }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Reply className="w-4 h-4" /> Reply
                          </button>
                          <button 
                            onClick={() => { /* placeholder forward */ setShowMsgMenu(false) }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <CornerUpRight className="w-4 h-4" /> Forward
                          </button>
                          <div className="h-px bg-gray-100 my-1" />
                          <button 
                            onClick={() => { setChatMsgs((prev)=> prev.filter(cm=> cm.id !== selectedMsg.id)); setShowMsgMenu(false) }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Message Composer - Bottom */}
                    <div className="px-4 py-4 border-t border-gray-200 bg-white">
                      {/* Reply preview */}
                      {replyTarget && (
                        <div className="mb-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-gray-800 flex items-start justify-between">
                          <div className="pr-2 line-clamp-2 text-gray-700">{replyTarget.text}</div>
                          <button onClick={()=> setReplyTarget(null)} className="text-gray-500 hover:text-gray-700 p-1"><X className="w-4 h-4" /></button>
                        </div>
                      )}
                      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        {/* Emoji Button - Left */}
                        <button 
                          type="button"
                          onClick={() => alert('Emoji Picker - Fitur akan segera hadir!')}
                          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Emoji"
                        >
                          <Smile className="w-5 h-5" />
                        </button>

                        <input
                          name="msg"
                          type="text"
                          placeholder="Tulis pesan..."
                          className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50"
                          value={messageInput}
                          onChange={(e) => {
                            setMessageInput(e.target.value)
                            if (socket && isWsConnected && activeChat?.id) {
                              socket.emit('typing_start', { conversationId: activeChat.id })
                            }
                          }}
                          onBlur={() => {
                            if (socket && isWsConnected && activeChat?.id) {
                              socket.emit('typing_stop', { conversationId: activeChat.id })
                            }
                          }}
                        />
                        {/* Share Link - Right of input */}
                        <button 
                          type="button"
                          onClick={() => alert('Share Link - Fitur akan segera hadir!')}
                          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Share Link"
                        >
                          <Link className="w-5 h-5" />
                        </button>

                        {/* Camera - capture from device */}
                        <label className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer" title="Ambil Kamera">
                          <Camera className="w-5 h-5" />
                          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            alert(`Foto diambil: ${file.name}`)
                          }} />
                        </label>

                        <button 
                          type="submit" 
                          className="w-12 h-12 bg-indigo-50 text-gray-700 border border-indigo-100 rounded-full hover:bg-indigo-100 flex items-center justify-center"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
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

            {/* SERA Chat Fullscreen */}
            {showSeraChat && (
              <div className="fixed inset-0 bg-white z-50 flex flex-col">
                {/* SERA Header - Full Width */}
                <div className="flex items-center px-2 py-4 border-b border-gray-200 bg-white">
                  <button
                    onClick={() => setShowSeraChat(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-lg font-semibold mr-3 ml-1">
                    <Cpu className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-lg">SERA Assistant</div>
                    <div className="text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Setaradapps AI • Always Online
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-2 rounded-full hover:bg-gray-100 text-gray-700">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages Area - Full Screen */}
                <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
                  <div className="space-y-4">
                    {/* Welcome Message */}
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-gray-100 rounded-bl-md">
                        <div className="text-sm">
                          👋 <strong>Halo!</strong> Saya SERA, asisten virtual Setaradapps. Ada yang bisa saya bantu hari ini?
                        </div>
                        <div className="text-xs mt-1 text-gray-400">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex justify-start">
                      <div className="max-w-[90%] space-y-2">
                        <div className="text-xs text-gray-500 px-2">Pertanyaan Populer:</div>
                        <button className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-100">
                          <p className="text-sm font-medium text-gray-900">💰 Bagaimana cara menggunakan P2P Exchange?</p>
                        </button>
                        <button className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-100">
                          <p className="text-sm font-medium text-gray-900">🚗 Cara booking driver di Setara?</p>
                        </button>
                        <button className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-100">
                          <p className="text-sm font-medium text-gray-900">🛒 Bagaimana cara belanja di Marketplace?</p>
                        </button>
                        <button className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-100">
                          <p className="text-sm font-medium text-gray-900">💎 Apa itu DeFi dan bagaimana cara investasi?</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Composer - Bottom */}
                <div className="px-4 py-4 border-t border-gray-200 bg-white">
                  <form className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Tanya SERA apapun..."
                      className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50"
                    />
                    <button 
                      type="submit" 
                      className="w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 flex items-center justify-center"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* SERA Button - positioned next to FAB */}
            {!activeChat && !showSeraChat && (
              <div className="fixed bottom-24 right-20 z-50">
                <button
                  onClick={() => setShowSeraChat(true)}
                  className="w-10 h-10 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-purple-700"
                >
                  <Cpu className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* FAB Dropdown - positioned absolutely */}
            {isFabOpen && !activeChat && !showSeraChat && (
              <div ref={fabMenuRef} className="fixed bottom-36 right-6 z-50 space-y-3">
                <button
                  onClick={() => alert('Fitur Tulis Status')}
                  className="flex items-center gap-3 bg-white rounded-xl shadow-md px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Tulis Status</span>
                </button>
                <button
                  onClick={() => alert('Fitur Upload Gambar')}
                  className="flex items-center gap-3 bg-white rounded-xl shadow-md px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Upload Gambar</span>
                </button>
                <button
                  onClick={() => { setShowUserSearch(true); setIsFabOpen(false); }}
                  className="flex items-center gap-3 bg-white rounded-xl shadow-md px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  <User className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Tambah Kontak Baru</span>
                </button>
              </div>
            )}

            {/* FAB - Always in fixed position */}
            {!activeChat && !showSeraChat && (
              <div className="fixed bottom-24 right-6 z-50">
                <button
                  onClick={() => setIsFabOpen(!isFabOpen)}
                  className="w-10 h-10 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-indigo-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
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
      </div>

      {/* Bottom Navigation */}
      {!activeChat && !showSeraChat && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'home', icon: HomeIcon, label: 'Home' },
            { id: 'market', icon: ShoppingBag, label: 'Market' },
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
      )}

      {/* UserSearch Modal */}
      {showUserSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Tambah Kontak</h2>
              <button
                onClick={() => setShowUserSearch(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* UserSearch Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              <UserSearch onStartChat={handleStartChat} />
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Chat */}
      {showRealTimeChat && currentUser && chatTargetUser && (
        <RealTimeChat
          currentUser={currentUser}
          targetUser={chatTargetUser}
          onBack={() => {
            setShowRealTimeChat(false)
            setChatTargetUser(null)
          }}
        />
      )}

      {/* Profile Modal (from chat dropdown) */}
      {/* Inline profile popover now anchored to avatar; full modal removed */}

      {/* Notifications simplified to toggle in dropdown; modal removed */}
    </div>
  )
}

export default Dashboard