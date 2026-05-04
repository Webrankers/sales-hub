'use client'

import { useState } from 'react'
import type { Document, DocCategorie } from '@/types/admin'
import { CATEGORIE_LABELS, categoriePill } from '@/types/admin'

const CATEGORIEEN: DocCategorie[] = ['contract', 'offerte', 'belasting', 'verzekering', 'overig']

const FIELD = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition'

interface FormState {
  titel: string; categorie: DocCategorie; omschrijving: string; link: string
}
const EMPTY: FormState = { titel: '', categorie: 'overig', omschrijving: '', link: '' }

interface Props {
  documenten: Document[]
  onAdd:    (data: Omit<FormState, never>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function DocumentenBibliotheek({ documenten, onAdd, onDelete }: Props) {
  const [catFilter, setCatFilter] = useState<DocCategorie | 'all'>('all')
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState<FormState>(EMPTY)
  const [saving,    setSaving]    = useState(false)

  const visible = catFilter === 'all'
    ? documenten
    : documenten.filter((d) => d.categorie === catFilter)

  async function handleSubmit() {
    if (!form.titel.trim()) return
    setSaving(true)
    try {
      await onAdd({ ...form, titel: form.titel.trim(), omschrijving: form.omschrijving.trim(), link: form.link.trim() })
      setForm(EMPTY)
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', ...CATEGORIEEN] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
              catFilter === c
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
            }`}
          >
            {c === 'all' ? 'Alle' : CATEGORIE_LABELS[c]}
          </button>
        ))}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Document toevoegen
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Nieuw document</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Titel *</label>
              <input type="text" value={form.titel} onChange={(e) => setForm({ ...form, titel: e.target.value })} className={FIELD} placeholder="Document titel" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Categorie</label>
              <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value as DocCategorie })} className={FIELD}>
                {CATEGORIEEN.map((c) => <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Omschrijving</label>
            <input type="text" value={form.omschrijving} onChange={(e) => setForm({ ...form, omschrijving: e.target.value })} className={FIELD} placeholder="Korte omschrijving" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Link (Google Drive / URL)</label>
            <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={FIELD} placeholder="https://drive.google.com/…" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSubmit} disabled={!form.titel.trim() || saving} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors">
              {saving ? 'Opslaan…' : 'Opslaan'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY) }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Document list */}
      {visible.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-600 py-6 text-center">Geen documenten gevonden.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-start gap-3">
              {/* Icon */}
              <div className="shrink-0 w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mt-0.5">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{doc.titel}</span>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoriePill(doc.categorie)}`}>
                    {CATEGORIE_LABELS[doc.categorie]}
                  </span>
                </div>
                {doc.omschrijving && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doc.omschrijving}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {doc.link && (
                  <a href={doc.link} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
                    Openen ↗
                  </a>
                )}
                <button onClick={() => onDelete(doc.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
