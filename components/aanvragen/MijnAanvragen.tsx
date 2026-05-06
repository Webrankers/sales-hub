'use client'

import { useEffect, useState, useCallback } from 'react'
import type { MarketingAanvraag, MarketingNotitie } from '@/types/aanvragen'
import { STATUS_LABELS_AAN, statusBadge, KANAAL_OPTIES, ZAAK_OPTIES } from '@/types/aanvragen'

type AanvraagMetNotities = MarketingAanvraag & { notities: MarketingNotitie[] }

export default function MijnAanvragen() {
  const [lijst,    setLijst]    = useState<MarketingAanvraag[]>([])
  const [selected, setSelected] = useState<AanvraagMetNotities | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [detLoading, setDetLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/aanvragen')
    if (res.ok) setLijst(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function openDetail(id: string) {
    setDetLoading(true)
    const res = await fetch(`/api/aanvragen/${id}`)
    if (res.ok) setSelected(await res.json())
    setDetLoading(false)
  }

  function fmt(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <svg className="w-7 h-7 animate-spin text-pink-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>
  )

  if (lijst.length === 0) return (
    <div className="py-20 text-center">
      <p className="text-gray-400 dark:text-gray-500 text-sm">Je hebt nog geen aanvragen ingediend.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {lijst.map(a => (
        <button
          key={a.id}
          onClick={() => openDetail(a.id)}
          className="w-full text-left rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-pink-300 dark:hover:border-pink-700 transition-colors group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{a.zaak}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(a.status)}`}>
                  {STATUS_LABELS_AAN[a.status]}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{a.beschrijving}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] text-gray-400">{fmt(a.created_at)}</span>
                {a.opleverdatum && (
                  <span className="text-[11px] text-gray-400">Opleverdatum: {fmt(a.opleverdatum)}</span>
                )}
              </div>
            </div>
            {/* Progress ring */}
            <div className="shrink-0 flex flex-col items-center gap-0.5">
              <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-gray-800"/>
                <circle
                  cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="4"
                  className="text-pink-500"
                  strokeDasharray={`${(a.voortgang / 100) * 100.5} 100.5`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{a.voortgang}%</span>
            </div>
          </div>
        </button>
      ))}

      {/* Detail panel / modal */}
      {(selected || detLoading) && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {detLoading ? (
              <div className="flex justify-center py-20">
                <svg className="w-7 h-7 animate-spin text-pink-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              </div>
            ) : selected ? (
              <DetailPanel aanvraag={selected} onClose={() => setSelected(null)} fmt={fmt} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailPanel({
  aanvraag, onClose, fmt,
}: {
  aanvraag: AanvraagMetNotities
  onClose: () => void
  fmt: (d: string | null) => string
}) {
  const a = aanvraag
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{a.zaak}</h2>
          <span className={`mt-1 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(a.status)}`}>
            {STATUS_LABELS_AAN[a.status]}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Voortgang</span><span>{a.voortgang}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-pink-500 transition-all"
            style={{ width: `${a.voortgang}%` }}
          />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoItem label="Aanvrager"    value={a.aanvrager_naam} />
        <InfoItem label="Ingediend"    value={fmt(a.created_at)} />
        <InfoItem label="Opleverdatum" value={fmt(a.opleverdatum)} />
        <InfoItem label="Feedbackmoment" value={a.feedback_gewenst ? 'Ja' : 'Nee'} />
      </div>

      {/* Kanalen */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Kanalen</p>
        <div className="flex flex-wrap gap-1.5">
          {a.kanalen.map(k => (
            <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{k}</span>
          ))}
        </div>
      </div>

      {/* Beschrijving */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Beschrijving</p>
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{a.beschrijving}</p>
      </div>

      {/* Drukwerk */}
      {a.drukwerk_details && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Drukwerk details</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{a.drukwerk_details}</p>
          {a.banner_afwerking && <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Afwerking: {a.banner_afwerking}</p>}
        </div>
      )}

      {/* Opmerkingen */}
      {a.opmerkingen && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Opmerkingen</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{a.opmerkingen}</p>
        </div>
      )}

      {/* Afwijzing reden */}
      {a.status === 'afgewezen' && a.afwijzing_reden && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Reden afwijzing</p>
          <p className="text-sm text-red-700 dark:text-red-300">{a.afwijzing_reden}</p>
        </div>
      )}

      {/* Notities van marketing */}
      {a.notities.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Notities van marketing</p>
          <div className="space-y-2">
            {a.notities.map(n => (
              <div key={n.id} className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{n.tekst}</p>
                <p className="text-[11px] text-gray-400 mt-1">{n.auteur} · {fmt(n.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
    </div>
  )
}
