'use client'

import type { Submission, SubmissionSource } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'

interface Props {
  submissions: Submission[]
  selectedId: string | null
  onSelect: (submission: Submission) => void
  filter: 'active' | 'archived'
  onFilterChange: (f: 'active' | 'archived') => void
  companyFilter: 'all' | SubmissionSource
  onCompanyFilterChange: (f: 'all' | SubmissionSource) => void
}

const SOURCE_LABEL_STYLES: Record<SubmissionSource, string> = {
  holy_moly_breda: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  spinola_breda:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
}

const SOURCE_NAMES: Record<SubmissionSource, string> = {
  holy_moly_breda: 'Holy Moly Breda',
  spinola_breda:   'Spinola Breda',
}

const COMPANY_FILTERS: { value: 'all' | SubmissionSource; label: string }[] = [
  { value: 'all',             label: 'Alle'      },
  { value: 'holy_moly_breda', label: 'Holy Moly' },
  { value: 'spinola_breda',   label: 'Spinola'   },
]

function isHotLead(s: Submission) {
  return s.aantal_personen !== null && s.aantal_personen > 100
}

/** Hours elapsed since a date string */
function hoursAgo(dateStr: string): number {
  return (Date.now() - new Date(dateStr).getTime()) / 3_600_000
}

function timeAgoLabel(dateStr: string): string {
  const h = hoursAgo(dateStr)
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min geleden`
  if (h < 24) return `${Math.round(h)} uur geleden`
  const d = Math.floor(h / 24)
  return `${d} ${d === 1 ? 'dag' : 'dagen'} geleden`
}

function timeAgoColor(dateStr: string): string {
  const h = hoursAgo(dateStr)
  if (h >= 24) return 'text-red-500 dark:text-red-400'
  if (h >= 2)  return 'text-orange-500 dark:text-orange-400'
  return 'text-gray-400 dark:text-gray-500'
}

/** True when 'wachten_op_reactie' for more than 48 hours (based on updated_at) */
function needs48uBadge(s: Submission): boolean {
  return s.status === 'wachten_op_reactie' && hoursAgo(s.updated_at) >= 48
}

export default function SubmissionList({
  submissions,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  companyFilter,
  onCompanyFilterChange,
}: Props) {
  const visible = submissions.filter((s) => {
    const archiveMatch = filter === 'archived' ? s.archived_at !== null : s.archived_at === null
    const companyMatch = companyFilter === 'all' || s.source === companyFilter
    return archiveMatch && companyMatch
  })

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sales Hub</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Holy Moly Breda · Spinola Breda</p>

        {/* Active / archived tabs */}
        <div className="flex gap-1 mt-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['active', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`flex-1 text-xs font-medium py-1 rounded-md transition-colors ${
                filter === f
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {f === 'active' ? 'Actief' : 'Archief'}
            </button>
          ))}
        </div>

        {/* Company filter pills */}
        <div className="flex gap-1 mt-2">
          {COMPANY_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onCompanyFilterChange(value)}
              className={`flex-1 text-[10px] font-semibold py-1 rounded-md border transition-colors ${
                companyFilter === value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
        {visible.length === 0 && (
          <li className="py-12 text-center text-sm text-gray-400 dark:text-gray-600">
            Geen inzendingen
          </li>
        )}
        {visible.map((s) => {
          const hot = isHotLead(s)
          const sel = selectedId === s.id
          const badge48u = needs48uBadge(s)

          return (
            <li key={s.id}>
              <button
                onClick={() => onSelect(s)}
                className={[
                  'w-full text-left px-4 py-3 transition-colors',
                  sel
                    ? 'bg-indigo-50 dark:bg-indigo-950 border-l-2 border-indigo-500'
                    : hot
                    ? 'hot-lead-bg hover:brightness-95 dark:hover:brightness-125'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                {hot && (
                  <p className="text-[10px] font-semibold text-orange-500 dark:text-orange-400 mb-0.5">
                    🔥 Hot lead!
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {s.name}
                  </span>
                  {badge48u && (
                    <span className="shrink-0 text-[10px] font-bold text-white bg-orange-500 rounded-full px-1.5 py-0.5 animate-pulse">
                      48u
                    </span>
                  )}
                </div>

                <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${SOURCE_LABEL_STYLES[s.source]}`}>
                  {SOURCE_NAMES[s.source]}
                </span>

                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{s.email}</p>

                <div className="flex items-center justify-between mt-1.5">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>
                    {STATUS_LABELS[s.status]}
                  </span>
                  <span className={`text-[10px] ${timeAgoColor(s.created_at)}`}>
                    {timeAgoLabel(s.created_at)}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
        {visible.length} {visible.length === 1 ? 'inzending' : 'inzendingen'}
      </div>
    </aside>
  )
}
