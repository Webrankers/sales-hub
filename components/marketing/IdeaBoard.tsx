'use client'

import { useState } from 'react'
import type { ContentPost, Platform } from '@/types/marketing'
import { PLATFORM_LABELS, platformDot } from '@/types/marketing'

const PLATFORMS: Platform[] = ['instagram', 'tiktok', 'facebook']

interface Props {
  ideas:      ContentPost[]               // posts with status === 'idee'
  onAdd:      (titel: string, platform: Platform) => Promise<void>
  onEditPost: (post: ContentPost) => void
}

export default function IdeaBoard({ ideas, onAdd, onEditPost }: Props) {
  const [titel,    setTitel]    = useState('')
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [saving,   setSaving]   = useState(false)

  async function handleAdd() {
    if (!titel.trim()) return
    setSaving(true)
    try {
      await onAdd(titel.trim(), platform)
      setTitel('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Quick capture */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Idee opschrijven</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Snel een idee opschrijven…"
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
          </select>
          <button
            onClick={handleAdd}
            disabled={!titel.trim() || saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold disabled:opacity-60 transition-colors"
          >
            {saving ? '…' : '+'}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">Druk op Enter om snel toe te voegen. Klik op een idee om details in te vullen.</p>
      </div>

      {/* Ideas list */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Ideeën ({ideas.length})
        </h3>

        {ideas.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-600">
            Nog geen ideeën. Schrijf ze hierboven snel op!
          </p>
        ) : (
          <div className="space-y-2">
            {ideas.map((post) => (
              <button
                key={post.id}
                onClick={() => onEditPost(post)}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors flex items-center gap-3 group"
              >
                <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${platformDot(post.platform)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{post.titel}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{PLATFORM_LABELS[post.platform]}</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
