'use client'

import { useState } from 'react'
import type { HashtagSet } from '@/types/marketing'

interface Props {
  sets:     HashtagSet[]
  onAdd:    (data: { naam: string; onderwerp: string; hashtags: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const FIELD = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'

export default function HashtagSets({ sets, onAdd, onDelete }: Props) {
  const [naam,      setNaam]      = useState('')
  const [onderwerp, setOnderwerp] = useState('')
  const [hashtags,  setHashtags]  = useState('')
  const [saving,    setSaving]    = useState(false)

  async function handleAdd() {
    if (!naam.trim() || !hashtags.trim()) return
    setSaving(true)
    try {
      await onAdd({ naam: naam.trim(), onderwerp: onderwerp.trim(), hashtags: hashtags.trim() })
      setNaam('')
      setOnderwerp('')
      setHashtags('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* New set form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Nieuwe hashtag set</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Naam</label>
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                className={FIELD}
                placeholder="bijv. Bruiloft set"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Onderwerp</label>
              <input
                type="text"
                value={onderwerp}
                onChange={(e) => setOnderwerp(e.target.value)}
                className={FIELD}
                placeholder="bijv. Feest, Zomer, Breda"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Hashtags</label>
            <textarea
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              rows={2}
              className={`${FIELD} resize-none`}
              placeholder="#feestje #event #breda"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={!naam.trim() || !hashtags.trim() || saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
          >
            {saving ? 'Opslaan…' : 'Set opslaan'}
          </button>
        </div>
      </div>

      {/* Saved sets */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Opgeslagen sets ({sets.length})
        </h3>

        {sets.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-600">Nog geen sets opgeslagen.</p>
        ) : (
          <div className="space-y-2">
            {sets.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{s.naam}</span>
                    {s.onderwerp && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {s.onderwerp}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 break-all leading-relaxed">{s.hashtags}</p>
                </div>
                <button
                  onClick={() => onDelete(s.id)}
                  className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
