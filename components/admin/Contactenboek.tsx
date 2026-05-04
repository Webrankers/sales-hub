'use client'

import { useState } from 'react'
import type { Contact } from '@/types/admin'

const FIELD = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition'

interface FormState {
  naam: string; bedrijf: string; telefoon: string; email: string; notitie: string
}
const EMPTY: FormState = { naam: '', bedrijf: '', telefoon: '', email: '', notitie: '' }

function initials(naam: string): string {
  return naam.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

// ── ContactForm is defined at MODULE level so React never remounts it ────────
interface ContactFormProps {
  form:        FormState
  saving:      boolean
  submitLabel: string
  onChange:    (f: FormState) => void
  onSubmit:    () => void
  onCancel:    () => void
}

function ContactForm({ form, saving, submitLabel, onChange, onSubmit, onCancel }: ContactFormProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Naam *</label>
          <input
            type="text" value={form.naam}
            onChange={(e) => onChange({ ...form, naam: e.target.value })}
            className={FIELD} placeholder="Volledige naam"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Bedrijf</label>
          <input
            type="text" value={form.bedrijf}
            onChange={(e) => onChange({ ...form, bedrijf: e.target.value })}
            className={FIELD} placeholder="Bedrijfsnaam"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Telefoon</label>
          <input
            type="tel" value={form.telefoon}
            onChange={(e) => onChange({ ...form, telefoon: e.target.value })}
            className={FIELD} placeholder="+31 6 00 00 00 00"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">E-mail</label>
          <input
            type="email" value={form.email}
            onChange={(e) => onChange({ ...form, email: e.target.value })}
            className={FIELD} placeholder="naam@bedrijf.nl"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Notitie</label>
        <textarea
          value={form.notitie}
          onChange={(e) => onChange({ ...form, notitie: e.target.value })}
          rows={2} className={`${FIELD} resize-none`} placeholder="Extra informatie…"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSubmit} disabled={!form.naam.trim() || saving}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
        >
          {saving ? 'Opslaan…' : submitLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Annuleren
        </button>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  contacten: Contact[]
  onAdd:     (data: Partial<Contact>) => Promise<void>
  onUpdate:  (id: string, data: Partial<Contact>) => Promise<void>
  onDelete:  (id: string) => Promise<void>
}

export default function Contactenboek({ contacten, onAdd, onUpdate, onDelete }: Props) {
  const [query,    setQuery]    = useState('')
  const [selected, setSelected] = useState<Contact | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(false)
  const [form,     setForm]     = useState<FormState>(EMPTY)
  const [saving,   setSaving]   = useState(false)

  const filtered = contacten.filter((c) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      c.naam.toLowerCase().includes(q) ||
      (c.bedrijf   ?? '').toLowerCase().includes(q) ||
      (c.email     ?? '').toLowerCase().includes(q) ||
      (c.telefoon  ?? '').toLowerCase().includes(q)
    )
  })

  function cancelForm() {
    setShowForm(false)
    setEditing(false)
    setForm(EMPTY)
  }

  async function handleAdd() {
    if (!form.naam.trim()) return
    setSaving(true)
    try {
      await onAdd({
        naam:     form.naam.trim(),
        bedrijf:  form.bedrijf.trim()  || null,
        telefoon: form.telefoon.trim() || null,
        email:    form.email.trim()    || null,
        notitie:  form.notitie.trim()  || null,
      })
      setForm(EMPTY)
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate() {
    if (!selected || !form.naam.trim()) return
    setSaving(true)
    try {
      await onUpdate(selected.id, {
        naam:     form.naam.trim(),
        bedrijf:  form.bedrijf.trim()  || null,
        telefoon: form.telefoon.trim() || null,
        email:    form.email.trim()    || null,
        notitie:  form.notitie.trim()  || null,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function startEdit(c: Contact) {
    setForm({ naam: c.naam, bedrijf: c.bedrijf ?? '', telefoon: c.telefoon ?? '', email: c.email ?? '', notitie: c.notitie ?? '' })
    setEditing(true)
  }

  function openContact(c: Contact) {
    setSelected(c)
    setEditing(false)
    setShowForm(false)
  }

  return (
    <div className="flex gap-4 h-full min-h-0">
      {/* Left: list */}
      <div className="w-72 shrink-0 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              placeholder="Zoeken…"
            />
          </div>
          <button
            onClick={() => { setShowForm(true); setSelected(null); setEditing(false); setForm(EMPTY) }}
            className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
          >+</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-6">Geen contacten gevonden.</p>
          )}
          {filtered.map((c) => (
            <button key={c.id} onClick={() => openContact(c)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                selected?.id === c.id
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-300">
                {initials(c.naam)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{c.naam}</p>
                {c.bedrijf && <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{c.bedrijf}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: detail / form */}
      <div className="flex-1 min-w-0">
        {/* New contact form */}
        {showForm && !selected && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Nieuw contact</h3>
            <ContactForm
              form={form} saving={saving} submitLabel="Contact opslaan"
              onChange={setForm} onSubmit={handleAdd} onCancel={cancelForm}
            />
          </div>
        )}

        {/* Selected contact: detail or edit */}
        {selected && !showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            {editing ? (
              <>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact bewerken</h3>
                <ContactForm
                  form={form} saving={saving} submitLabel="Wijzigingen opslaan"
                  onChange={setForm} onSubmit={handleUpdate} onCancel={cancelForm}
                />
              </>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-lg font-bold text-amber-700 dark:text-amber-300">
                      {initials(selected.naam)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{selected.naam}</h3>
                      {selected.bedrijf && <p className="text-sm text-gray-500 dark:text-gray-400">{selected.bedrijf}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(selected)}
                      className="text-xs font-medium text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20">
                      Bewerken
                    </button>
                    <button onClick={async () => { await onDelete(selected.id); setSelected(null) }}
                      className="text-xs font-medium text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      Verwijderen
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {selected.telefoon && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      <a href={`tel:${selected.telefoon}`} className="text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                        {selected.telefoon}
                      </a>
                    </div>
                  )}
                  {selected.email && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      <a href={`mailto:${selected.email}`} className="text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                        {selected.email}
                      </a>
                    </div>
                  )}
                  {selected.notitie && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">Notitie</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selected.notitie}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty state */}
        {!selected && !showForm && (
          <div className="h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <p className="text-sm">Selecteer een contact</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
