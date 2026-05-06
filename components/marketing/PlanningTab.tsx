'use client'

import { useEffect, useState, useCallback } from 'react'
import type { MarketingAanvraag, MarketingNotitie } from '@/types/aanvragen'
import {
  PLANNING_STATUS_LABELS, planningStatusBadge,
  TOEGEWEZENE_LABELS,     toegewezeneBadge,
} from '@/types/aanvragen'
import type { PlanningStatus } from '@/types/aanvragen'

type AanvraagMetNotities = MarketingAanvraag & { notities: MarketingNotitie[] }

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}
function fmtLong(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

const inputCls =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ' +
  'px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100 ' +
  'focus:outline-none focus:ring-2 focus:ring-pink-400 w-full'

// ─── main component ──────────────────────────────────────────────────────────

export default function PlanningTab() {
  const [lijst,        setLijst]        = useState<MarketingAanvraag[]>([])
  const [selected,     setSelected]     = useState<AanvraagMetNotities | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [nieuwNotitie, setNieuwNotitie] = useState('')
  const [notSaving,    setNotSaving]    = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/marketing/aanvragen')
    if (res.ok) {
      const all: MarketingAanvraag[] = await res.json()
      setLijst(all.filter(a => a.status === 'geaccepteerd'))
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function openDetail(a: MarketingAanvraag) {
    const res     = await fetch(`/api/marketing/aanvragen/${a.id}/notities`)
    const notities = res.ok ? await res.json() : []
    setSelected({ ...a, notities })
    setNieuwNotitie('')
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setSaving(true)
    const res = await fetch(`/api/marketing/aanvragen/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
    if (res.ok) {
      const updated: MarketingAanvraag = await res.json()
      setLijst(l => l.map(a => a.id === id ? updated : a))
      if (selected?.id === id) setSelected(s => s ? { ...updated, notities: s.notities } : null)
    }
    setSaving(false)
  }

  async function addNotitie() {
    if (!selected || !nieuwNotitie.trim()) return
    setNotSaving(true)
    const res = await fetch(`/api/marketing/aanvragen/${selected.id}/notities`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tekst: nieuwNotitie.trim(), auteur: 'marketing' }),
    })
    if (res.ok) {
      const notitie: MarketingNotitie = await res.json()
      setSelected(s => s ? { ...s, notities: [...s.notities, notitie] } : null)
      setNieuwNotitie('')
    }
    setNotSaving(false)
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
      <p className="text-gray-400 dark:text-gray-500 text-sm">Geen geaccepteerde aanvragen in de planning.</p>
    </div>
  )

  return (
    <>
      {/* ── Mobile: card layout (< lg) ─────────────────────────────────────── */}
      <div className="lg:hidden space-y-3">
        {lijst.map(a => (
          <button
            key={a.id}
            onClick={() => openDetail(a)}
            className="w-full text-left rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-pink-300 dark:hover:border-pink-700 transition-colors group"
          >
            {/* Title row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{a.zaak}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{a.beschrijving}</p>
              </div>
              <svg className="shrink-0 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-pink-400 transition-colors mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Voortgang</span><span>{a.voortgang}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-pink-500 transition-all" style={{ width: `${a.voortgang}%` }} />
              </div>
            </div>

            {/* Badges + meta */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${planningStatusBadge(a.planning_status)}`}>
                {PLANNING_STATUS_LABELS[a.planning_status]}
              </span>
              {a.toegewezen_aan && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${toegewezeneBadge(a.toegewezen_aan)}`}>
                  {TOEGEWEZENE_LABELS[a.toegewezen_aan]}
                </span>
              )}
              {a.opleverdatum && (
                <span className="text-[11px] text-gray-400 ml-auto">↗ {fmt(a.opleverdatum)}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ── Desktop: compact table (lg+) ───────────────────────────────────── */}
      <div className="hidden lg:block rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col />                      {/* Taaknaam — flexible */}
            <col className="w-[130px]" />{/* Voortgang */}
            <col className="w-[120px]" />{/* Wie */}
            <col className="w-[150px]" />{/* Status */}
            <col className="w-[88px]"  />{/* Opleverdatum */}
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              {['Taaknaam', 'Voortgang', 'Wie', 'Status', 'Oplever'].map(h => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lijst.map(a => (
              <tr
                key={a.id}
                onClick={() => openDetail(a)}
                className="border-b last:border-0 border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
              >
                {/* Taaknaam */}
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{a.zaak}</p>
                  <p className="text-[11px] text-gray-400 font-normal truncate">{a.aanvrager_naam}</p>
                </td>

                {/* Voortgang — bar + input */}
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden min-w-0">
                      <div className="h-full rounded-full bg-pink-500 transition-all" style={{ width: `${a.voortgang}%` }} />
                    </div>
                    <input
                      type="number" min={0} max={100}
                      value={a.voortgang}
                      disabled={saving}
                      onChange={e => patch(a.id, { voortgang: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      className="w-10 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-center text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-pink-400 px-1 py-0.5"
                    />
                  </div>
                </td>

                {/* Wie */}
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <select
                    value={a.toegewezen_aan ?? ''}
                    disabled={saving}
                    onChange={e => patch(a.id, { toegewezen_aan: e.target.value || null })}
                    className={inputCls}
                  >
                    <option value="">—</option>
                    <option value="jazzlyn">Jazzlyn</option>
                    <option value="maxime">Maxime</option>
                  </select>
                </td>

                {/* Planning status */}
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <select
                    value={a.planning_status}
                    disabled={saving}
                    onChange={e => patch(a.id, { planning_status: e.target.value })}
                    className={inputCls}
                  >
                    {(Object.entries(PLANNING_STATUS_LABELS) as [PlanningStatus, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </td>

                {/* Opleverdatum — read-only, editing in detail panel */}
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {fmt(a.opleverdatum)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Detail panel (both layouts) ────────────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selected.zaak}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Door: {selected.aanvrager_naam}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-0.5"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${planningStatusBadge(selected.planning_status)}`}>
                  {PLANNING_STATUS_LABELS[selected.planning_status]}
                </span>
                {selected.toegewezen_aan && (
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${toegewezeneBadge(selected.toegewezen_aan)}`}>
                    {TOEGEWEZENE_LABELS[selected.toegewezen_aan]}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Voortgang</span><span>{selected.voortgang}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full bg-pink-500 transition-all" style={{ width: `${selected.voortgang}%` }} />
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoItem label="Opleverdatum"     value={fmtLong(selected.opleverdatum)} />
                <InfoItem label="Interne deadline" value={fmtLong(selected.interne_deadline)} />
                <InfoItem label="Feedbackmoment"   value={selected.feedback_gewenst ? 'Ja' : 'Nee'} />
                <InfoItem label="Aangevraagd door" value={selected.aanvrager_naam} />
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
                  {selected.banner_afwerking && (
                    <p className="text-sm text-gray-500 mt-0.5">Afwerking: {selected.banner_afwerking}</p>
                  )}
                </div>
              )}

              {selected.opmerkingen && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Opmerkingen</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{selected.opmerkingen}</p>
                </div>
              )}

              {/* Inline edit controls */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Voortgang %</label>
                  <input
                    type="number" min={0} max={100}
                    value={selected.voortgang}
                    disabled={saving}
                    onChange={e => patch(selected.id, { voortgang: Math.min(100, Math.max(0, Number(e.target.value))) })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Planning status</label>
                  <select
                    value={selected.planning_status}
                    disabled={saving}
                    onChange={e => patch(selected.id, { planning_status: e.target.value })}
                    className={inputCls}
                  >
                    {(Object.entries(PLANNING_STATUS_LABELS) as [PlanningStatus, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Toegewezen aan</label>
                  <select
                    value={selected.toegewezen_aan ?? ''}
                    disabled={saving}
                    onChange={e => patch(selected.id, { toegewezen_aan: e.target.value || null })}
                    className={inputCls}
                  >
                    <option value="">— niemand —</option>
                    <option value="jazzlyn">Jazzlyn</option>
                    <option value="maxime">Maxime</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Interne deadline</label>
                  <input
                    type="date"
                    value={selected.interne_deadline ?? ''}
                    disabled={saving}
                    onChange={e => patch(selected.id, { interne_deadline: e.target.value || null })}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Notities */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Notities</p>
                <div className="space-y-2 mb-3">
                  {selected.notities.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Nog geen notities.</p>
                  )}
                  {selected.notities.map(n => (
                    <div key={n.id} className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
                      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{n.tekst}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {n.auteur} · {new Date(n.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <textarea
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none min-h-[70px]"
                    placeholder="Notitie toevoegen…"
                    value={nieuwNotitie}
                    onChange={e => setNieuwNotitie(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNotitie() }}
                  />
                  <button
                    onClick={addNotitie}
                    disabled={notSaving || !nieuwNotitie.trim()}
                    className="rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 transition-colors self-end"
                  >
                    {notSaving ? '…' : 'Opslaan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
