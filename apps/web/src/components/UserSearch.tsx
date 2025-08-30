'use client'

import { useState, useEffect } from 'react'
import { Search, User, Plus } from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  online?: boolean
}

interface UserSearchProps {
  onStartChat: (user: User) => void
}

const UserSearch: React.FC<UserSearchProps> = ({ onStartChat }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Test users untuk development - real user1 & user2
  const mockUsers: User[] = [
    { id: 'user1', username: 'user1', email: 'user1@setaradapps.com', online: true },
    { id: 'user2', username: 'user2', email: 'user2@setaradapps.com', online: true },
    { id: '3', username: 'alice_setara', email: 'alice@setaradapps.com', online: false },
    { id: '4', username: 'bob_smith', email: 'bob@setaradapps.com', online: true },
    { id: '5', username: 'charlie_brown', email: 'charlie@setaradapps.com', online: false },
  ]

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const filtered = mockUsers.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari user untuk mulai chat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
        />
      </div>

      {isSearching && (
        <div className="text-center py-4 text-gray-500">
          Mencari user...
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Hasil Pencarian</h3>
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  {user.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.username}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log('Chat button clicked for user:', user)
                  onStartChat(user)
                }}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Chat</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Tidak ada user ditemukan</p>
          <p className="text-sm">Coba kata kunci lain</p>
        </div>
      )}

      {!searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Ketik username atau email untuk mencari user</p>
          <p className="text-sm">Mulai chat dengan user lain</p>
        </div>
      )}
    </div>
  )
}

export default UserSearch

