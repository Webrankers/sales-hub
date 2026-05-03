'use client'

import { useState } from 'react'
import type { SubmissionStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'

interface Props {
  currentStatus: SubmissionStatus
  submissionId: string
  onStatusChange: (status: SubmissionStatus) => void
}

const STATUSES: SubmissionStatus[] = [
  'actie_ondernemen',
  'wachten_op_reactie',
  'afgewezen',
  'afgerond',
]

export default function StatusMenu({ currentStatus, submissionId, onStatusChange }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSelect(status: SubmissionStatus) {
    if (status === currentStatus) { setOpen(false); return }
    setLoading(true)
    setOpen(false)
    try {
      const res = await fetch(`/api/submissions/${submissionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) onStatusChange(status)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-opacity ${
          STATUS_COLORS[currentStatus]
        } ${loading ? 'opacity-50' : 'hover:opacity-80'}`}
      >
        {loading ? 'Opslaan…' : STATUS_LABELS[currentStatus]}
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[200px]">
            {STATUSES.map((s) => (
              <li key={s}>
                <button
                  onClick={() => handleSelect(s)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                    s === currentStatus ? 'font-semibold' : 'text-gray-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${dotColor(s)}`} />
                  {STATUS_LABELS[s]}
                  {s === 'afgewezen' && (
                    <span className="ml-auto text-[10px] text-gray-400">→ archief</span>
                  )}
                  {s === 'afgerond' && (
                    <span className="ml-auto text-[10px] text-gray-400">→ archief</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function dotColor(s: SubmissionStatus) {
  const map: Record<SubmissionStatus, string> = {
    actie_ondernemen: 'bg-red-500',
    wachten_op_reactie: 'bg-yellow-400',
    afgewezen: 'bg-gray-400',
    afgerond: 'bg-green-500',
  }
  return map[s]
}
