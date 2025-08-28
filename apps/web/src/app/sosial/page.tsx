'use client'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useMemo, useState } from 'react'
import { Heart, MessageCircle, Repeat2, Image as ImageIcon, Send } from 'lucide-react'

type Post = {
  id: string
  user: { name: string; handle: string; avatarColor: string }
  text: string
  createdAt: string
  liked: boolean
  reposted: boolean
  commented: boolean
  likeCount: number
  repostCount: number
  commentCount: number
}

const initialPosts: Post[] = [
  {
    id: 'p3',
    user: { name: 'Ahmad Setara', handle: '@ahmad', avatarColor: '#3b82f6' },
    text: 'Panen pertama tahun ini! Alhamdulillah hasilnya bagus 🙏\n#pertanian #lokal',
    createdAt: '1h',
    liked: false,
    reposted: false,
    commented: false,
    likeCount: 12,
    repostCount: 3,
    commentCount: 5,
  },
  {
    id: 'p2',
    user: { name: 'Siti Aminah', handle: '@siti', avatarColor: '#10b981' },
    text: 'Ada rekomendasi pupuk organik yang bagus? 🌱',
    createdAt: '3h',
    liked: false,
    reposted: false,
    commented: false,
    likeCount: 7,
    repostCount: 1,
    commentCount: 9,
  },
  {
    id: 'p1',
    user: { name: 'Setara Market', handle: '@setara', avatarColor: '#8b5cf6' },
    text: 'Diskon fresh product sampai 20% minggu ini! Cek sekarang 🛒',
    createdAt: 'Yesterday',
    liked: false,
    reposted: false,
    commented: false,
    likeCount: 25,
    repostCount: 4,
    commentCount: 11,
  },
]

const formatNow = () => 'now'

export default function SosialPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [draft, setDraft] = useState('')

  const isPostDisabled = useMemo(() => draft.trim().length === 0, [draft])

  const handlePost = () => {
    if (isPostDisabled) return
    const text = draft.trim()
    const newPost: Post = {
      id: crypto.randomUUID(),
      user: { name: 'You', handle: '@you', avatarColor: '#f59e0b' },
      text,
      createdAt: formatNow(),
      liked: false,
      reposted: false,
      commented: false,
      likeCount: 0,
      repostCount: 0,
      commentCount: 0,
    }
    setPosts((prev) => [newPost, ...prev])
    setDraft('')
  }

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likeCount: p.likeCount + (!p.liked ? 1 : -1),
            }
          : p
      )
    )
  }

  const toggleRepost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              reposted: !p.reposted,
              repostCount: p.repostCount + (!p.reposted ? 1 : -1),
            }
          : p
      )
    )
  }

  const toggleComment = (id: string) => {
    // Untuk demo: toggling comment hanya mengubah warna & counter dummy
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              commented: !p.commented,
              commentCount: p.commentCount + (!p.commented ? 1 : -1),
            }
          : p
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold">Sosial</h1>
        </div>
      </div>

      {/* Composer */}
      <div className="bg-white border-b">
        <div className="px-4 py-3">
          <div className="flex gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: '#f59e0b' }}
            >
              Y
            </div>
            <div className="flex-1">
              <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Apa yang sedang terjadi?"
                  rows={3}
                  className="w-full resize-none p-3 text-sm outline-none"
                />
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t">
                  <div className="flex items-center gap-2 text-gray-500">
                    <button className="p-1 hover:text-indigo-600" title="Media">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={handlePost}
                    disabled={isPostDisabled}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-white ${
                      isPostDisabled ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <Send className="w-4 h-4" /> Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y">
          {posts.map((p) => (
            <div key={p.id} className="bg-white">
              <div className="px-4 py-3 flex gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: p.user.avatarColor }}
                >
                  {p.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-900 truncate">{p.user.name}</span>
                    <span className="text-gray-500 truncate">{p.user.handle}</span>
                    <span className="text-gray-400">· {p.createdAt}</span>
                  </div>
                  <div className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap">{p.text}</div>
                  <div className="mt-2 flex items-center justify-between max-w-md text-sm select-none">
                    <button
                      onClick={() => toggleComment(p.id)}
                      className={`group inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 ${
                        p.commented ? 'text-indigo-600' : 'text-gray-500'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{p.commentCount}</span>
                    </button>
                    <button
                      onClick={() => toggleRepost(p.id)}
                      className={`group inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 ${
                        p.reposted ? 'text-indigo-600' : 'text-gray-500'
                      }`}
                    >
                      <Repeat2 className="w-4 h-4" />
                      <span>{p.repostCount}</span>
                    </button>
                    <button
                      onClick={() => toggleLike(p.id)}
                      className={`group inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 ${
                        p.liked ? 'text-indigo-600' : 'text-gray-500'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span>{p.likeCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


