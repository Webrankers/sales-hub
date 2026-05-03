'use client'

import { useMemo, useState } from 'react'
import type { Submission } from '@/types'

interface Props {
  submissions: Submission[]
}

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1)
}

/** Monday-based day-of-week: Mon=0 … Sun=6 */
function mondayDow(date: Date) {
  return (date.getDay() + 6) % 7
}

export default function CalendarView({ submissions }: Props) {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  function prev() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  function next() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  // Map day-string → completed submissions for that day
  const completedByDay = useMemo(() => {
    const map: Record<string, Submission[]> = {}
    submissions
      .filter((s) => s.status === 'afgerond')
      .forEach((s) => {
        const key = s.created_at.slice(0, 10) // YYYY-MM-DD
        if (!map[key]) map[key] = []
        map[key].push(s)
      })
    return map
  }, [submissions])

  // Build calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow    = mondayDow(startOfMonth(year, month))
  const totalCells  = Math.ceil((firstDow + daysInMonth) / 7) * 7

  const monthLabel = new Date(year, month, 1).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
  const todayStr   = today.toISOString().slice(0, 10)

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Kalender</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500">Afgeronde inzendingen per aanvraagdatum</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize min-w-[140px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={next}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - firstDow + 1
              if (dayNum < 1 || dayNum > daysInMonth) {
                return <div key={i} className="h-16 border-b border-r border-gray-50 dark:border-gray-700/50 last:border-r-0" />
              }

              const mm    = String(month + 1).padStart(2, '0')
              const dd    = String(dayNum).padStart(2, '0')
              const dateKey = `${year}-${mm}-${dd}`
              const leads = completedByDay[dateKey] ?? []
              const isToday = dateKey === todayStr

              return (
                <div
                  key={i}
                  className={`h-16 p-1.5 border-b border-r border-gray-50 dark:border-gray-700/50 last:border-r-0 flex flex-col ${
                    isToday ? 'bg-indigo-50 dark:bg-indigo-950' : ''
                  }`}
                >
                  <span className={`text-[11px] font-medium self-end leading-none ${
                    isToday
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {dayNum}
                  </span>
                  {leads.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-0.5">
                      {leads.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          title={s.name}
                          className="block w-full truncate text-[9px] font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded px-1 leading-4"
                        >
                          {s.name.split(' ')[0]}
                        </span>
                      ))}
                      {leads.length > 3 && (
                        <span className="text-[9px] text-gray-400 dark:text-gray-500">+{leads.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/50 inline-block"/>
          Afgeronde inzending
        </div>
      </div>
    </div>
  )
}
