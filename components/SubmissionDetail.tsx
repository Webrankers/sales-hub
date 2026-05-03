'use client'

import { useState, useEffect } from 'react'
import type { Submission, SubmissionStatus, Note } from '@/types'
import { SOURCE_LABELS, SOURCE_COLORS } from '@/types'
import StatusMenu from './StatusMenu'

interface Props {
  submission: Submission
  onStatusChange: (id: string, status: SubmissionStatus) => void
  onDelete: (id: string) => void
}

function buildGmailUrl(to: string, subject: string, body: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function buildWhatsAppUrl(phone: string, name: string) {
  const digits = phone.replace(/\D/g, '')
  const intl = digits.startsWith('0') ? '31' + digits.slice(1) : digits
  const msg = `Hallo ${name}, bedankt voor je aanvraag! We nemen graag contact met je op.`
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`
}

function buildCalendarUrl(name: string, email: string) {
  const title = `Kennismaking met ${name}`
  const details = `Opvolgingsgesprek met ${name} (${email})`
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}`
}

function NotesPanel({ submissionId }: { submissionId: string }) {
  const [notes, setNotes]       = useState<Note[]>([])
  const [tekst, setTekst]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/submissions/${submissionId}/notes`)
      .then((r) => r.json())
      .then((data: Note[]) => { setNotes(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [submissionId])

  async function handleSave() {
    if (!tekst.trim()) return
    setSaving(true)
    const res = await fetch(`/api/submissions/${submissionId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tekst: tekst.trim() }),
    })
    if (res.ok) {
      const newNote: Note = await res.json()
      setNotes((prev) => [newNote, ...prev])
      setTekst('')
    }
    setSaving(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-4">
      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        Notities
      </h3>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <textarea
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nieuwe notitie… (Ctrl+Enter om op te slaan)"
          rows={3}
          className="w-full text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 resize-none outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={saving || !tekst.trim()}
          className="self-end text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg transition-colors"
        >
          {saving ? 'Opslaan…' : 'Opslaan'}
        </button>
      </div>

      {/* Saved notes */}
      <div className="flex flex-col gap-3 overflow-y-auto max-h-96">
        {loading && (
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-4">Laden…</p>
        )}
        {!loading && notes.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-600 italic text-center py-4">
            Nog geen notities
          </p>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3"
          >
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {note.tekst}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
              {new Date(note.created_at).toLocaleString('nl-NL', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function SubmissionDetail({ submission, onStatusChange, onDelete }: Props) {
  const [copied, setCopied]     = useState(false)
  const [deleting, setDeleting] = useState(false)

  const subject   = `Naar aanleiding van uw aanvraag via ${SOURCE_LABELS[submission.source]}`
  const draftBody = submission.draft_email ?? ''

  async function copyEmail() {
    await navigator.clipboard.writeText(draftBody)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!window.confirm(`Weet je zeker dat je de inzending van ${submission.name} permanent wilt verwijderen?`)) return
    setDeleting(true)
    const res = await fetch(`/api/submissions/${submission.id}`, { method: 'DELETE' })
    if (res.ok) {
      onDelete(submission.id)
    } else {
      alert('Verwijderen mislukt. Probeer het opnieuw.')
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{submission.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{submission.email}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SOURCE_COLORS[submission.source]}`}>
            {SOURCE_LABELS[submission.source]}
          </span>
          <StatusMenu
            currentStatus={submission.status}
            submissionId={submission.id}
            onStatusChange={(status) => onStatusChange(submission.id, status)}
          />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting ? 'Verwijderen…' : 'Verwijder'}
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6">
        {/* Contact details — full width */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
            Contactgegevens
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-400 dark:text-gray-500 text-xs">Naam</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{submission.name}</dd>
            </div>
            <div>
              <dt className="text-gray-400 dark:text-gray-500 text-xs">E-mail</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100 break-all">{submission.email}</dd>
            </div>
            {submission.phone && (
              <div>
                <dt className="text-gray-400 dark:text-gray-500 text-xs">Telefoon</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">{submission.phone}</dd>
              </div>
            )}
            {submission.onderwerp && (
              <div>
                <dt className="text-gray-400 dark:text-gray-500 text-xs">Onderwerp</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">{submission.onderwerp}</dd>
              </div>
            )}
            {submission.aantal_personen !== null && (
              <div>
                <dt className="text-gray-400 dark:text-gray-500 text-xs">Aantal personen</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">{submission.aantal_personen}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-400 dark:text-gray-500 text-xs">Ontvangen</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(submission.created_at).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })}
              </dd>
            </div>
          </dl>

          {submission.message && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <dt className="text-gray-400 dark:text-gray-500 text-xs mb-1.5">Bericht</dt>
              <dd className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {submission.message}
              </dd>
            </div>
          )}
        </section>

        {/* Email + Notes side by side */}
        <div className="grid grid-cols-2 gap-6 items-start">
          {/* Conceptmail — left */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Conceptmail
              </h3>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  onClick={copyEmail}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 transition-colors"
                >
                  {copied ? '✓ Gekopieerd' : 'Kopieer'}
                </button>

                {submission.phone && (
                  <a
                    href={buildWhatsAppUrl(submission.phone, submission.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-white px-2.5 py-1 rounded-lg transition-colors"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}

                <a
                  href={buildGmailUrl(submission.email, subject, draftBody)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg transition-colors"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Gmail
                </a>
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              <span className="font-medium text-gray-600 dark:text-gray-300">Onderwerp:</span> {subject}
            </p>

            {draftBody ? (
              <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                {draftBody}
              </div>
            ) : (
              <div className="text-sm text-gray-400 dark:text-gray-600 italic py-4 text-center">
                Geen conceptmail beschikbaar
              </div>
            )}
          </section>

          {/* Notities — right */}
          <NotesPanel submissionId={submission.id} />
        </div>

        {/* Google Calendar when afgerond */}
        {submission.status === 'afgerond' && (
          <section className="bg-green-50 dark:bg-green-950 rounded-2xl border border-green-100 dark:border-green-900 p-5">
            <h3 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3">
              Afgerond — Plan een afspraak
            </h3>
            <a
              href={buildCalendarUrl(submission.name, submission.email)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Toevoegen aan Google Calendar
            </a>
          </section>
        )}

        {submission.archived_at && (
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
            Gearchiveerd op{' '}
            {new Date(submission.archived_at).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        )}
      </div>
    </div>
  )
}
