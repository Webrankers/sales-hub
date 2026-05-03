'use client'

import type { Submission } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'

interface Props {
  submissions: Submission[]
  selectedId: string | null
  onSelect: (submission: Submission) => void
  filter: 'active' | 'archived'
  onFilterChange: (f: 'active' | 'archived') => void
}

const SOURCE_LABEL_STYLES: Record<string, string> = {
  holy_moly_breda: 'bg-purple-100 text-purple-700',
  spinola_breda: 'bg-yellow-100 text-yellow-700',
}

const SOURCE_NAMES: Record<string, string> = {
  holy_moly_breda: 'Holy Moly Breda',
  spinola_breda: 'Spinola Breda',
}

function isHotLead(s: Submission) {
  return s.aantal_personen !== null && s.aantal_personen > 100
}

export default function SubmissionList({
  submissions,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
}: Props) {
  const visible = submissions.filter((s) =>
    filter === 'archived'
      ? s.archived_at !== null
      : s.archived_at === null,
  )

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-900">Sales Hub</h1>
        <p className="text-xs text-gray-400 mt-0.5">Holy Moly Breda · Spinola Breda</p>

        {/* Filter tabs */}
        <div className="flex gap-1 mt-3 bg-gray-100 rounded-lg p-1">
          {(['active', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`flex-1 text-xs font-medium py-1 rounded-md transition-colors ${
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'active' ? 'Actief' : 'Archief'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {visible.length === 0 && (
          <li className="py-12 text-center text-sm text-gray-400">
            Geen inzendingen
          </li>
        )}
        {visible.map((s) => {
          const hot = isHotLead(s)
          const selected = selectedId === s.id
          return (
            <li key={s.id}>
              <button
                onClick={() => onSelect(s)}
                style={hot ? { background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fff1f2 100%)' } : undefined}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  selected
                    ? 'bg-indigo-50 border-l-2 border-indigo-500'
                    : hot
                    ? 'hover:brightness-95'
                    : 'hover:bg-gray-50'
                }`}
              >
                {hot && (
                  <p className="text-[10px] font-semibold text-orange-500 mb-0.5">🔥 Hot lead!</p>
                )}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-sm text-gray-900 truncate">{s.name}</span>
                </div>
                <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${SOURCE_LABEL_STYLES[s.source]}`}>
                  {SOURCE_NAMES[s.source]}
                </span>
                <p className="text-xs text-gray-500 truncate mt-1">{s.email}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>
                    {STATUS_LABELS[s.status]}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(s.created_at).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Footer count */}
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
        {visible.length} {visible.length === 1 ? 'inzending' : 'inzendingen'}
      </div>
    </aside>
  )
}
