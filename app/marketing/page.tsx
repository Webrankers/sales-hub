'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ContentPost, HashtagSet, Platform, PostStatus } from '@/types/marketing'
import ContentCalendar from '@/components/marketing/ContentCalendar'
import KanbanBoard     from '@/components/marketing/KanbanBoard'
import PostModal       from '@/components/marketing/PostModal'
import HashtagSets     from '@/components/marketing/HashtagSets'
import IdeaBoard       from '@/components/marketing/IdeaBoard'

type Tab = 'kalender' | 'kanban' | 'hashtags' | 'ideeen'

const TABS: { id: Tab; label: string }[] = [
  { id: 'kalender', label: 'Kalender'   },
  { id: 'kanban',   label: 'Kanban'     },
  { id: 'hashtags', label: 'Hashtags'   },
  { id: 'ideeen',   label: 'Ideeënbord' },
]

export default function MarketingPage() {
  const router = useRouter()

  const [posts,       setPosts]       = useState<ContentPost[]>([])
  const [hashtagSets, setHashtagSets] = useState<HashtagSet[]>([])
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState<Tab>('kanban')
  const [showModal,   setShowModal]   = useState(false)
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      fetch('/api/marketing/posts').then((r) => r.json()),
      fetch('/api/marketing/hashtag-sets').then((r) => r.json()),
    ]).then(([postsData, setsData]) => {
      if (Array.isArray(postsData))   setPosts(postsData)
      if (Array.isArray(setsData))    setHashtagSets(setsData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // ── Post CRUD ──────────────────────────────────────────────────────────────

  const createPost = useCallback(async (data: Partial<ContentPost>) => {
    const res  = await fetch('/api/marketing/posts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    if (res.ok) {
      const newPost = await res.json() as ContentPost
      setPosts((prev) => [newPost, ...prev])
      setShowModal(false)
      setEditingPost(null)
    }
  }, [])

  const updatePost = useCallback(async (id: string, data: Partial<ContentPost>) => {
    const res = await fetch(`/api/marketing/posts/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json() as ContentPost
      setPosts((prev) => prev.map((p) => p.id === id ? updated : p))
      setShowModal(false)
      setEditingPost(null)
    }
  }, [])

  const deletePost = useCallback(async (id: string) => {
    const res = await fetch(`/api/marketing/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
      setShowModal(false)
      setEditingPost(null)
    }
  }, [])

  // Kanban drag-drop status change (optimistic)
  const handleStatusChange = useCallback((postId: string, status: PostStatus) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, status } : p))
    fetch(`/api/marketing/posts/${postId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    })
  }, [])

  // ── Hashtag set CRUD ───────────────────────────────────────────────────────

  const createHashtagSet = useCallback(async (data: { naam: string; onderwerp: string; hashtags: string }) => {
    const res = await fetch('/api/marketing/hashtag-sets', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    if (res.ok) {
      const newSet = await res.json() as HashtagSet
      setHashtagSets((prev) => [newSet, ...prev])
    }
  }, [])

  const deleteHashtagSet = useCallback(async (id: string) => {
    const res = await fetch(`/api/marketing/hashtag-sets/${id}`, { method: 'DELETE' })
    if (res.ok) setHashtagSets((prev) => prev.filter((s) => s.id !== id))
  }, [])

  // ── Modal helpers ──────────────────────────────────────────────────────────

  function openCreate() { setEditingPost(null); setShowModal(true) }
  function openEdit(post: ContentPost) { setEditingPost(post); setShowModal(true) }
  function closeModal() { setShowModal(false); setEditingPost(null) }

  async function handleSave(data: Partial<ContentPost>) {
    if (editingPost) await updatePost(editingPost.id, data)
    else             await createPost(data)
  }

  // Quick-add idea from IdeaBoard
  async function handleAddIdea(titel: string, platform: Platform) {
    await createPost({ titel, platform, status: 'idee' })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
    )
  }

  const ideas = posts.filter((p) => p.status === 'idee')

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">

      {/* Top bar */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => router.push('/hub')}
          className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Hub
        </button>

        <span className="text-gray-200 dark:text-gray-700">|</span>

        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nieuwe post
        </button>
      </header>

      {/* Tab content */}
      <div className={`flex-1 overflow-hidden ${activeTab === 'kanban' ? '' : 'overflow-y-auto'}`}>

        {activeTab === 'kalender' && (
          <div className="max-w-3xl mx-auto px-6 py-6 overflow-y-auto h-full">
            <ContentCalendar posts={posts} onEditPost={openEdit} />
          </div>
        )}

        {activeTab === 'kanban' && (
          <div className="h-full px-4 py-4">
            <KanbanBoard
              posts={posts}
              onStatusChange={handleStatusChange}
              onEditPost={openEdit}
            />
          </div>
        )}

        {activeTab === 'hashtags' && (
          <div className="px-6 py-6 overflow-y-auto h-full">
            <HashtagSets
              sets={hashtagSets}
              onAdd={createHashtagSet}
              onDelete={deleteHashtagSet}
            />
          </div>
        )}

        {activeTab === 'ideeen' && (
          <div className="px-6 py-6 overflow-y-auto h-full">
            <IdeaBoard
              ideas={ideas}
              onAdd={handleAddIdea}
              onEditPost={openEdit}
            />
          </div>
        )}
      </div>

      {/* Post modal */}
      {showModal && (
        <PostModal
          post={editingPost}
          hashtagSets={hashtagSets}
          onSave={handleSave}
          onDelete={editingPost ? deletePost : undefined}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
