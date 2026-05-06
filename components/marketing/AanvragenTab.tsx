'use client'

import { useEffect, useState, useCallback } from 'react'
import type { MarketingAanvraag } from '@/types/aanvragen'
import { STATUS_LABELS_AAN, statusBadge, TOEGEWEZENE_LABELS, toegewezeneBadge } from '@/types/aanvragen'
import type { Toegewezene } from '@/types/aanvragen'

export default function AanvragenTab() {
  const [lijst,     setLijst]     = useState<MarketingAanvraag[]>([])
  const [selected,  setSelected]  = useState<MarketingAanvraag | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)

  // Reject form state
  const [rejectMode,  setRejectMode]  = useState(false)
  const [rejectReden, setRejectReden] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/marketing/aanvragen')
    if (res.ok) setLijst(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function patch(id: string, body: Record<string, unknown>) {
    setSaving(true)
    const res = await fetch(`/api/marketing/aanvragen/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const updated: MarketingAanvraag = await res.json()
      setLijst(l => l.map(a => a.id === id ? updated : a))
      if (selected?.id === id) setSelected(updated)
    }
    setSaving(false)
  }

  async function accepteer(a: MarketingAanvraag) {
    await patch(a.id, { status: 'geaccepteerd' })
  }

  async function wijs(a: MarketingAanvraag, toe: Toegewezene) {
    await patch(a.id, { toegewezen_aan: toe })
  }

  async function wijs_af(a: MarketingAanvraag) {
    if (!rejectReden.trim()) return
    await patch(a.id, { status: 'afgewezen', afwijzing_reden: rejectReden.trim() })
    setRejectMode(false)
    setRejectReden('')
    setSelected(null)
  }

  function fmt(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <svg className="w-7 h-7 animate-spin text-pink-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>
  )

  const inBehandeling = lijst.filter(a => a.status === 'in_behandeling')
  const overige       = lijst.filter(a => a.status !== 'in_behandeling')

  return (
    <div className="space-y-6">
      {/* New requests */}
      {inBehandeling.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Nieuw · {inBehandeling.length}
          </h3>
          <div className="space-y-3">
            {inBehandeling.map(a => (
              <AanvraagKaart key={a.id} a={a} fmt={fmt} onClick={() => { setSelected(a); setRejectMode(false); setRejectReden('') }} />
            ))}
          </div>
        </section>
      )}

      {/* Handled */}
      {overige.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Afgehandeld · {overige.length}
          </h3>
          <div className="space-y-2">
            {overige.map(a => (
              <AanvraagKaart key={a.id} a={a} fmt={fmt} onClick={() => { setSelected(a); setRejectMode(false); setRejectReden('') }} compact />
            ))}
          </div>
        </section>
      )}

      {lijst.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">Geen aanvragen gevonden.</p>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selected.zaak}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Door: {selected.aanvrager_naam}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status badge */}
              <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusBadge(selected.status)}`}>
                {STATUS_LABELS_AAN[selected.status]}
              </span>

              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoItem label="Ingediend"    value={fmt(selected.created_at)} />
                <InfoItem label="Opleverdatum" value={fmt(selected.opleverdatum)} />
                <InfoItem label="Feedbackmoment" value={selected.feedback_gewenst ? 'Ja' : 'Nee'} />
              </div>

              {/* Kanalen */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Kanalen</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.kanalen.map(k => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{k}</span>
                  ))}
                </div>
              </div>

              {/* Beschrijving */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Beschrijving</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{selected.beschrijving}</p>
              </div>

              {selected.drukwerk_details && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Drukwerk</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{selected.drukwerk_details}</p>
                  {selected.banner_afwerking && <p className="text-sm text-gray-500 mt-0.5">Afwerking: {selected.banner_afwerking}</p>}
                </div>
              )}

              {selected.opmerkingen && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Opmerkingen</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{selected.opmerkingen}</p>
                </div>
              )}

              {/* Actions */}
              {selected.status === 'in_behandeling' && !rejectMode && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => accepteer(selected)}
                    disabled={saving}
                    className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 transition-colors"
                  >
                    ✓ Accepteren
                  </button>
                  <button
                    onClick={() => setRejectMode(true)}
                    disabled={saving}
                    className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 transition-colors"
                  >
                    ✗ Afwijzen
                  </button>
                </div>
              )}

              {rejectMode && (
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reden afwijzing <span className="text-red-500">*</span></label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[80px] resize-y"
                    placeholder="Licht toe waarom de aanvraag wordt afgewezen…"
                    value={rejectReden}
                    onChange={e => setRejectReden(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => wijs_af(selected)}
                      disabled={saving || !rejectReden.trim()}
                      className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 transition-colors"
                    >
                      Bevestigen
                    </button>
                    <button
                      onClick={() => { setRejectMode(false); setRejectReden('') }}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-sm px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              )}

              {/* Toewijzen (only if accepted) */}
              {selected.status === 'geaccepteerd' && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Toewijzen aan</p>
                  <div className="flex gap-2">
                    {(['jazzlyn', 'maxime'] as Toegewezene[]).map(t => (
                      <button
                        key={t}
                        onClick={() => wijs(selected, t)}
                        disabled={saving}
                        className={[
                          'flex-1 rounded-xl border font-semibold text-sm px-4 py-2.5 transition-colors disabled:opacity-60',
                          selected.toegewezen_aan === t
                            ? toegewezeneBadge(t) + ' border-transparent'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                        ].join(' ')}
                      >
                        {TOEGEWEZENE_LABELS[t]}
                        {selected.toegewezen_aan === t && ' ✓'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AanvraagKaart({ a, fmt, onClick, compact }: {
  a: MarketingAanvraag
  fmt: (d: string | null) => string
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors group hover:border-pink-300 dark:hover:border-pink-700',
        compact ? 'px-4 py-3' : 'p-4',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{a.zaak}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(a.status)}`}>
              {STATUS_LABELS_AAN[a.status]}
            </span>
            {a.toegewezen_aan && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${toegewezeneBadge(a.toegewezen_aan)}`}>
                {TOEGEWEZENE_LABELS[a.toegewezen_aan]}
              </span>
            )}
          </div>
          {!compact && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{a.beschrijving}</p>}
          <p className="text-[11px] text-gray-400 mt-1">{a.aanvrager_naam} · {fmt(a.created_at)}</p>
        </div>
        <svg className="shrink-0 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-pink-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
    </div>
  )
}
