'use client'

import { useMemo, useState } from 'react'
import type { ContentPost } from '@/types/marketing'
import { PLATFORM_LABELS, STATUS_LABELS_MKT, platformDot, statusPillMkt } from '@/types/marketing'

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

function mondayDow(date: Date) {
  return (date.getDay() + 6) % 7
}

interface Props {
  posts: ContentPost[]
  onEditPost: (post: ContentPost) => void
}

export default function ContentCalendar({ posts, onEditPost }: Props) {
  const today = new Date()
  const [year, setYear]         = useState(today.getFullYear())
  const [month, setMonth]       = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  function prev() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  function next() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const postsByDay = useMemo(() => {
    const map: Record<string, ContentPost[]> = {}
    posts
      .filter((p) => p.publicatiedatum)
      .forEach((p) => {
        const key = p.publicatiedatum!.slice(0, 10)
        if (!map[key]) map[key] = []
        map[key].push(p)
      })
    return map
  }, [posts])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow    = mondayDow(new Date(year, month, 1))
  const totalCells  = Math.ceil((firstDow + daysInMonth) / 7) * 7
  const monthLabel  = new Date(year, month, 1).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
  const todayStr    = today.toISOString().slice(0, 10)

  const selectedPosts = selectedDay ? (postsByDay[selectedDay] ?? []) : []

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">{monthLabel}</span>
        <div className="flex gap-1">
          <button onClick={prev} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button onClick={next} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNum = i - firstDow + 1
            if (dayNum < 1 || dayNum > daysInMonth) {
              return <div key={i} className="h-20 border-b border-r border-gray-50 dark:border-gray-700/40 last:border-r-0" />
            }

            const mm      = String(month + 1).padStart(2, '0')
            const dd      = String(dayNum).padStart(2, '0')
            const dateKey = `${year}-${mm}-${dd}`
            const dayPosts = postsByDay[dateKey] ?? []
            const isToday    = dateKey === todayStr
            const isSelected = dateKey === selectedDay

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                className={[
                  'h-20 p-1.5 border-b border-r border-gray-50 dark:border-gray-700/40 last:border-r-0 flex flex-col text-left transition-colors',
                  isSelected  ? 'bg-indigo-50 dark:bg-indigo-950/60'    :
                  isToday     ? 'bg-blue-50/60 dark:bg-blue-950/30'      :
                  'hover:bg-gray-50 dark:hover:bg-gray-700/30',
                ].join(' ')}
              >
                <span className={`text-[11px] font-medium self-end leading-none ${
                  isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {dayNum}
                </span>

                {dayPosts.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-0.5 pt-1">
                    {dayPosts.slice(0, 6).map((p) => (
                      <span
                        key={p.id}
                        title={`${p.titel} (${PLATFORM_LABELS[p.platform]})`}
                        className={`w-2 h-2 rounded-full ${platformDot(p.platform)}`}
                      />
                    ))}
                    {dayPosts.length > 6 && (
                      <span className="text-[9px] text-gray-400 dark:text-gray-500">+{dayPosts.length - 6}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />Instagram</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-800 dark:bg-gray-200 shrink-0" />TikTok</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />Facebook</span>
      </div>

      {/* Selected-day detail */}
      {selectedDay && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          {selectedPosts.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-600">Geen posts gepland op deze dag.</p>
          ) : (
            <div className="space-y-2">
              {selectedPosts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onEditPost(p)}
                  className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors flex items-center gap-3"
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${platformDot(p.platform)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.titel}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{PLATFORM_LABELS[p.platform]}{p.type ? ` · ${p.type}` : ''}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusPillMkt(p.status)}`}>
                    {STATUS_LABELS_MKT[p.status]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
