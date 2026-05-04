'use client'

import { useState } from 'react'
import type { Taak, TaakPrioriteit, TaakStatus } from '@/types/admin'
import { PRIORITEIT_LABELS, STATUS_LABELS_ADMIN, prioriteitPill, statusPillAdmin } from '@/types/admin'

const PRIORITEITEN: TaakPrioriteit[] = ['laag', 'normaal', 'hoog', 'urgent']
const STATUSSEN: TaakStatus[]        = ['open', 'in_behandeling', 'afgerond']

const FIELD = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition'

interface FormState {
  titel: string; omschrijving: string; deadline: string
  prioriteit: TaakPrioriteit; status: TaakStatus
}
const EMPTY: FormState = { titel: '', omschrijving: '', deadline: '', prioriteit: 'normaal', status: 'open' }

function isOverdue(taak: Taak): boolean {
  if (!taak.deadline || taak.status === 'afgerond') return false
  return taak.deadline < new Date().toISOString().slice(0, 10)
}

function deadlineLabel(d: string | null): string {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface Props {
  taken:          Taak[]
  onAdd:          (data: Partial<Taak>) => Promise<void>
  onStatusChange: (id: string, status: TaakStatus) => Promise<void>
  onDelete:       (id: string) => Promise<void>
}

export default function Takenlijst({ taken, onAdd, onStatusChange, onDelete }: Props) {
  const [showForm,     setShowForm]     = useState(false)
  const [form,         setForm]         = useState<FormState>(EMPTY)
  const [saving,       setSaving]       = useState(false)
  const [statusFilter, setStatusFilter] = useState<TaakStatus | 'all'>('all')

  async function handleSubmit() {
    if (!form.titel.trim()) return
    setSaving(true)
    try {
      await onAdd({
        titel:        form.titel.trim(),
        omschrijving: form.omschrijving.trim() || null,
        deadline:     form.deadline || null,
        prioriteit:   form.prioriteit,
        status:       form.status,
      })
      setForm(EMPTY)
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const visible = taken.filter((t) => statusFilter === 'all' || t.status === statusFilter)

  const overdueCount = taken.filter(isOverdue).length

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', ...STATUSSEN] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
              statusFilter === s
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
            }`}>
            {s === 'all' ? 'Alle' : STATUS_LABELS_ADMIN[s]}
          </button>
        ))}
        {overdueCount > 0 && (
          <span className="ml-1 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {overdueCount} verlopen
          </span>
        )}
        <button onClick={() => setShowForm((v) => !v)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Taak toevoegen
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Nieuwe taak</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Titel *</label>
            <input type="text" value={form.titel} onChange={(e) => setForm({ ...form, titel: e.target.value })} className={FIELD} placeholder="Taakomschrijving" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Omschrijving</label>
            <textarea value={form.omschrijving} onChange={(e) => setForm({ ...form, omschrijving: e.target.value })}
              rows={2} className={`${FIELD} resize-none`} placeholder="Extra details…" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={FIELD} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Prioriteit</label>
              <select value={form.prioriteit} onChange={(e) => setForm({ ...form, prioriteit: e.target.value as TaakPrioriteit })} className={FIELD}>
                {PRIORITEITEN.map((p) => <option key={p} value={p}>{PRIORITEIT_LABELS[p]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaakStatus })} className={FIELD}>
                {STATUSSEN.map((s) => <option key={s} value={s}>{STATUS_LABELS_ADMIN[s]}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSubmit} disabled={!form.titel.trim() || saving}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors">
              {saving ? 'Opslaan…' : 'Opslaan'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY) }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {visible.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-600 py-6 text-center">Geen taken gevonden.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((taak) => {
            const overdue = isOverdue(taak)
            return (
              <div key={taak.id} className={`bg-white dark:bg-gray-800 rounded-xl border px-4 py-3 flex items-start gap-3 transition-colors ${
                overdue ? 'border-red-200 dark:border-red-800' : 'border-gray-100 dark:border-gray-700'
              }`}>
                {/* Status toggle */}
                <button
                  onClick={() => {
                    const next: TaakStatus = taak.status === 'open' ? 'in_behandeling' : taak.status === 'in_behandeling' ? 'afgerond' : 'open'
                    onStatusChange(taak.id, next)
                  }}
                  title="Status wisselen"
                  className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    taak.status === 'afgerond'
                      ? 'bg-green-500 border-green-500'
                      : taak.status === 'in_behandeling'
                      ? 'bg-indigo-200 border-indigo-400 dark:bg-indigo-700 dark:border-indigo-500'
                      : 'border-gray-300 dark:border-gray-600 hover:border-amber-400'
                  }`}
                >
                  {taak.status === 'afgerond' && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${taak.status === 'afgerond' ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'}`}>
                      {taak.titel}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${prioriteitPill(taak.prioriteit)}`}>
                      {PRIORITEIT_LABELS[taak.prioriteit]}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusPillAdmin(taak.status)}`}>
                      {STATUS_LABELS_ADMIN[taak.status]}
                    </span>
                  </div>
                  {taak.omschrijving && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{taak.omschrijving}</p>
                  )}
                  <div className={`mt-1 text-[11px] font-medium flex items-center gap-1 ${overdue ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {overdue && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />}
                    {taak.deadline ? `Deadline: ${deadlineLabel(taak.deadline)}` : 'Geen deadline'}
                  </div>
                </div>

                <button onClick={() => onDelete(taak.id)}
                  className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
