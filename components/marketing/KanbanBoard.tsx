'use client'

import { useState } from 'react'
import type { ContentPost, PostStatus } from '@/types/marketing'
import { PLATFORM_LABELS, STATUS_LABELS_MKT, platformDot, columnBg } from '@/types/marketing'

const COLUMNS: PostStatus[] = ['idee', 'in_productie', 'klaar', 'gepubliceerd']

function colHeaderPill(s: PostStatus): string {
  if (s === 'idee')         return 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
  if (s === 'in_productie') return 'bg-amber-200 text-amber-800 dark:bg-amber-800/40 dark:text-amber-300'
  if (s === 'klaar')        return 'bg-blue-200 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300'
  /* gepubliceerd */         return 'bg-green-200 text-green-800 dark:bg-green-800/40 dark:text-green-300'
}

interface Props {
  posts: ContentPost[]
  onStatusChange: (postId: string, status: PostStatus) => void
  onEditPost: (post: ContentPost) => void
}

export default function KanbanBoard({ posts, onStatusChange, onEditPost }: Props) {
  const [dragOverCol, setDragOverCol] = useState<PostStatus | null>(null)

  const byStatus = COLUMNS.reduce<Record<PostStatus, ContentPost[]>>((acc, col) => {
    acc[col] = posts.filter((p) => p.status === col)
    return acc
  }, {} as Record<PostStatus, ContentPost[]>)

  function handleDrop(e: React.DragEvent, status: PostStatus) {
    e.preventDefault()
    const postId = e.dataTransfer.getData('postId')
    if (postId) onStatusChange(postId, status)
    setDragOverCol(null)
  }

  return (
    <div className="grid grid-cols-4 gap-3 h-full min-h-0">
      {COLUMNS.map((col) => (
        <div
          key={col}
          onDragOver={(e) => { e.preventDefault(); setDragOverCol(col) }}
          onDragLeave={(e) => {
            // Only clear if leaving the column entirely
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null)
          }}
          onDrop={(e) => handleDrop(e, col)}
          className={[
            'flex flex-col rounded-2xl border-2 transition-colors overflow-hidden',
            dragOverCol === col
              ? 'border-indigo-400 dark:border-indigo-500'
              : 'border-transparent',
            columnBg(col),
          ].join(' ')}
        >
          {/* Column header */}
          <div className="px-3 pt-3 pb-2 flex items-center justify-between shrink-0">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colHeaderPill(col)}`}>
              {STATUS_LABELS_MKT[col]}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              {byStatus[col].length}
            </span>
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-[80px]">
            {byStatus[col].map((post) => (
              <div
                key={post.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('postId', post.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onClick={() => onEditPost(post)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 cursor-grab active:cursor-grabbing hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all select-none"
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${platformDot(post.platform)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
                      {post.titel}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {PLATFORM_LABELS[post.platform]}{post.type ? ` · ${post.type}` : ''}
                    </p>
                    {post.publicatiedatum && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        📅 {new Date(post.publicatiedatum + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                    {post.canva_link && (
                      <a
                        href={post.canva_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-block mt-1 text-[10px] text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                      >
                        Canva ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {byStatus[col].length === 0 && (
              <div className="h-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center">
                <span className="text-[11px] text-gray-300 dark:text-gray-600">Sleep hier</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
