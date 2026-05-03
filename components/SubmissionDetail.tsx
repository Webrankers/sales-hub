'use client'

import { useState } from 'react'
import type { Submission, SubmissionStatus } from '@/types'
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

function buildCalendarUrl(name: string, email: string) {
  const title = `Kennismaking met ${name}`
  const details = `Opvolgingsgesprek met ${name} (${email})`
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}`
}

export default function SubmissionDetail({ submission, onStatusChange, onDelete }: Props) {
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const subject = `Naar aanleiding van uw aanvraag via ${SOURCE_LABELS[submission.source]}`
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
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{submission.name}</h2>
          <p className="text-sm text-gray-500 truncate">{submission.email}</p>
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
            className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 hover:border-red-300 transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting ? 'Verwijderen…' : 'Verwijder'}
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6 max-w-3xl">
        {/* Contact details */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Contactgegevens
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-400 text-xs">Naam</dt>
              <dd className="font-medium text-gray-900">{submission.name}</dd>
            </div>
            <div>
              <dt className="text-gray-400 text-xs">E-mail</dt>
              <dd className="font-medium text-gray-900 break-all">{submission.email}</dd>
            </div>
            {submission.phone && (
              <div>
                <dt className="text-gray-400 text-xs">Telefoon</dt>
                <dd className="font-medium text-gray-900">{submission.phone}</dd>
              </div>
            )}
            {submission.onderwerp && (
              <div>
                <dt className="text-gray-400 text-xs">Onderwerp</dt>
                <dd className="font-medium text-gray-900">{submission.onderwerp}</dd>
              </div>
            )}
            {submission.aantal_personen !== null && (
              <div>
                <dt className="text-gray-400 text-xs">Aantal personen</dt>
                <dd className="font-medium text-gray-900">{submission.aantal_personen}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-400 text-xs">Ontvangen</dt>
              <dd className="font-medium text-gray-900">
                {new Date(submission.created_at).toLocaleString('nl-NL', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </dd>
            </div>
          </dl>

          {submission.message && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <dt className="text-gray-400 text-xs mb-1.5">Bericht</dt>
              <dd className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {submission.message}
              </dd>
            </div>
          )}
        </section>

        {/* Draft email */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Conceptmail
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={copyEmail}
                className="text-xs text-gray-500 hover:text-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                {copied ? '✓ Gekopieerd' : 'Kopieer'}
              </button>
              <a
                href={buildGmailUrl(submission.email, subject, draftBody)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Open in Gmail
              </a>
            </div>
          </div>

          <div className="text-xs text-gray-400 mb-2">
            <span className="font-medium text-gray-600">Onderwerp:</span> {subject}
          </div>

          {draftBody ? (
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-4 border border-gray-100">
              {draftBody}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic py-4 text-center">
              Geen conceptmail beschikbaar
            </div>
          )}
        </section>

        {/* Google Calendar link when afgerond */}
        {submission.status === 'afgerond' && (
          <section className="bg-green-50 rounded-2xl border border-green-100 p-5">
            <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
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

        {/* Archived notice */}
        {submission.archived_at && (
          <p className="text-xs text-gray-400 text-center">
            Gearchiveerd op{' '}
            {new Date(submission.archived_at).toLocaleString('nl-NL', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        )}
      </div>
    </div>
  )
}
