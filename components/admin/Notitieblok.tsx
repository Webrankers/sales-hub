'use client'

import { useState } from 'react'
import type { AdminNotitie } from '@/types/admin'

const FIELD = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition'

interface Props {
  notities: AdminNotitie[]
  onAdd:    (data: { titel: string; tekst: string | null }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function timeLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Notitieblok({ notities, onAdd, onDelete }: Props) {
  const [titel,      setTitel]      = useState('')
  const [tekst,      setTekst]      = useState('')
  const [saving,     setSaving]     = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function handleAdd() {
    if (!titel.trim()) return
    setSaving(true)
    try {
      await onAdd({ titel: titel.trim(), tekst: tekst.trim() || null })
      setTitel('')
      setTekst('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Quick add */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Nieuwe notitie</h3>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Titel *</label>
          <input
            type="text" value={titel} onChange={(e) => setTitel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAdd()}
            className={FIELD} placeholder="Notitie titel"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Tekst</label>
          <textarea
            value={tekst} onChange={(e) => setTekst(e.target.value)}
            rows={4} className={`${FIELD} resize-none`} placeholder="Schrijf je notitie hier…"
          />
        </div>
        <button
          onClick={handleAdd} disabled={!titel.trim() || saving}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors">
          {saving ? 'Opslaan…' : 'Notitie opslaan'}
        </button>
      </div>

      {/* Notes list */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Notities ({notities.length})
        </h3>

        {notities.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-600">Nog geen notities aangemaakt.</p>
        ) : (
          <div className="space-y-2">
            {notities.map((n) => {
              const expanded = expandedId === n.id
              return (
                <div key={n.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expanded ? null : n.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{n.titel}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{timeLabel(n.created_at)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(n.id) }}
                      className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </button>

                  {expanded && n.tekst && (
                    <div className="px-4 pb-4">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{n.tekst}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
