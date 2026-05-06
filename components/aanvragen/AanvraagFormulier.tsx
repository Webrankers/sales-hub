'use client'

import { useState } from 'react'
import { ZAAK_OPTIES, KANAAL_OPTIES } from '@/types/aanvragen'

interface Props {
  onSuccess: () => void
}

const initialForm = {
  aanvrager_naam:   '',
  zaak:             '',
  kanalen:          [] as string[],
  beschrijving:     '',
  drukwerk_details: '',
  banner_afwerking: '',
  opleverdatum:     '',
  feedback_gewenst: true,
  opmerkingen:      '',
}

export default function AanvraagFormulier({ onSuccess }: Props) {
  const [form,    setForm]    = useState(initialForm)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const heeftDrukwerk = form.kanalen.includes('Drukwerk')

  function setField<K extends keyof typeof initialForm>(key: K, value: (typeof initialForm)[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleKanaal(k: string) {
    setForm(f => {
      const next = f.kanalen.includes(k)
        ? f.kanalen.filter(c => c !== k)
        : [...f.kanalen, k]
      // clear drukwerk fields if Drukwerk deselected
      if (k === 'Drukwerk' && !next.includes('Drukwerk'))
        return { ...f, kanalen: next, drukwerk_details: '', banner_afwerking: '' }
      return { ...f, kanalen: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.aanvrager_naam.trim()) { setError('Vul je naam in.'); return }
    if (!form.zaak)                  { setError('Kies een zaak.'); return }
    if (form.kanalen.length === 0)   { setError('Kies minimaal één kanaal.'); return }
    if (!form.beschrijving.trim())   { setError('Vul een beschrijving in.'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/aanvragen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aanvrager_naam:   form.aanvrager_naam.trim(),
          zaak:             form.zaak,
          kanalen:          form.kanalen,
          beschrijving:     form.beschrijving.trim(),
          drukwerk_details: heeftDrukwerk ? form.drukwerk_details.trim() || null : null,
          banner_afwerking: heeftDrukwerk ? form.banner_afwerking || null : null,
          opleverdatum:     form.opleverdatum || null,
          feedback_gewenst: form.feedback_gewenst,
          opmerkingen:      form.opmerkingen.trim() || null,
        }),
      })
      if (!res.ok) throw new Error('Fout bij indienen')
      setSuccess(true)
      setForm(initialForm)
      setTimeout(() => { setSuccess(false); onSuccess() }, 2000)
    } catch {
      setError('Er is iets misgegaan. Probeer het opnieuw.')
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">Aanvraag ingediend!</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Je wordt doorgestuurd naar Mijn aanvragen…</p>
      </div>
    )
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-500'
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      {/* Naam aanvrager */}
      <div>
        <label className={labelCls}>Naam aanvrager <span className="text-red-500">*</span></label>
        <input
          className={inputCls}
          placeholder="Jouw naam"
          value={form.aanvrager_naam}
          onChange={e => setField('aanvrager_naam', e.target.value)}
        />
      </div>

      {/* Zaak */}
      <div>
        <label className={labelCls}>Voor welke zaak? <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ZAAK_OPTIES.map(z => (
            <label key={z} className={[
              'flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm transition-colors',
              form.zaak === z
                ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 font-medium'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-pink-300',
            ].join(' ')}>
              <input type="radio" className="sr-only" value={z} checked={form.zaak === z} onChange={() => setField('zaak', z)} />
              {z}
            </label>
          ))}
        </div>
      </div>

      {/* Kanalen */}
      <div>
        <label className={labelCls}>Via welke kanalen? <span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-2">
          {KANAAL_OPTIES.map(k => (
            <label key={k} className={[
              'flex items-center gap-1.5 rounded-full border px-3 py-1 cursor-pointer text-sm transition-colors',
              form.kanalen.includes(k)
                ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 font-medium'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-pink-300',
            ].join(' ')}>
              <input type="checkbox" className="sr-only" checked={form.kanalen.includes(k)} onChange={() => toggleKanaal(k)} />
              {k}
            </label>
          ))}
        </div>
      </div>

      {/* Conditional Drukwerk fields */}
      {heeftDrukwerk && (
        <div className="rounded-xl border border-pink-200 dark:border-pink-800/40 bg-pink-50/50 dark:bg-pink-900/10 p-4 space-y-4">
          <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wide">Drukwerk details</p>
          <div>
            <label className={labelCls}>Hoeveel stuks en welk formaat?</label>
            <input
              className={inputCls}
              placeholder="bijv. 100 stuks A5, 50 stuks A3"
              value={form.drukwerk_details}
              onChange={e => setField('drukwerk_details', e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Banner afwerking</label>
            <div className="flex flex-col gap-2">
              {(['Ringen om de 30cm', 'Zomen en ringen om de 30cm'] as const).map(opt => (
                <label key={opt} className={[
                  'flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm transition-colors',
                  form.banner_afwerking === opt
                    ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 font-medium'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-pink-300',
                ].join(' ')}>
                  <input type="radio" className="sr-only" value={opt} checked={form.banner_afwerking === opt} onChange={() => setField('banner_afwerking', opt)} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Beschrijving */}
      <div>
        <label className={labelCls}>Wat wil je laten maken? <span className="text-red-500">*</span></label>
        <textarea
          className={inputCls + ' min-h-[100px] resize-y'}
          placeholder="Beschrijf zo duidelijk mogelijk wat je nodig hebt…"
          value={form.beschrijving}
          onChange={e => setField('beschrijving', e.target.value)}
        />
      </div>

      {/* Opleverdatum */}
      <div>
        <label className={labelCls}>Gewenste opleverdatum</label>
        <input
          type="date"
          className={inputCls}
          value={form.opleverdatum}
          onChange={e => setField('opleverdatum', e.target.value)}
        />
      </div>

      {/* Feedback gewenst */}
      <div>
        <label className={labelCls}>Wil je een feedbackmoment? <span className="text-red-500">*</span></label>
        <div className="flex gap-3">
          {([true, false] as const).map(v => (
            <label key={String(v)} className={[
              'flex items-center gap-2 rounded-lg border px-4 py-2 cursor-pointer text-sm transition-colors',
              form.feedback_gewenst === v
                ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 font-medium'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-pink-300',
            ].join(' ')}>
              <input type="radio" className="sr-only" checked={form.feedback_gewenst === v} onChange={() => setField('feedback_gewenst', v)} />
              {v ? 'Ja' : 'Nee'}
            </label>
          ))}
        </div>
      </div>

      {/* Opmerkingen */}
      <div>
        <label className={labelCls}>Overige opmerkingen <span className="text-gray-400 font-normal">(optioneel)</span></label>
        <textarea
          className={inputCls + ' min-h-[80px] resize-y'}
          placeholder="Eventuele aanvullende informatie…"
          value={form.opmerkingen}
          onChange={e => setField('opmerkingen', e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 transition-colors"
      >
        {saving && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        )}
        {saving ? 'Indienen…' : 'Aanvraag indienen'}
      </button>
    </form>
  )
}
