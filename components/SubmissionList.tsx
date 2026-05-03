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
  spinola_breda: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
}

const SOURCE_NAMES: Record<SubmissionSource, string> = {
  holy_moly_breda: 'Holy Moly Breda',
  spinola_breda: 'Spinola Breda',
}

const COMPANY_FILTERS: { value: 'all' | SubmissionSource; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'holy_moly_breda', label: 'Holy Moly' },
  { value: 'spinola_breda', label: 'Spinola' },
]

function isHotLead(s: Submission) {
  return s.aantal_personen !== null && s.aantal_personen > 100
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
          return (
            <li key={s.id}>
              <button
                onClick={() => onSelect(s)}
                style={hot && !sel ? { background: 'linear-gradient(135deg,#fff7ed,#fef3c7,#fff1f2)' } : undefined}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  sel
                    ? 'bg-indigo-50 dark:bg-indigo-950 border-l-2 border-indigo-500'
                    : hot
                    ? 'hover:brightness-95 dark:hover:brightness-110'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {hot && (
                  <p className="text-[10px] font-semibold text-orange-500 mb-0.5">🔥 Hot lead!</p>
                )}
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate block">{s.name}</span>
                <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${SOURCE_LABEL_STYLES[s.source]}`}>
                  {SOURCE_NAMES[s.source]}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{s.email}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>
                    {STATUS_LABELS[s.status]}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {new Date(s.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
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
