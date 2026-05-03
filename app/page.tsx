'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase-browser'
import type { Submission, SubmissionStatus, SubmissionSource } from '@/types'

type StatusFilter = 'all' | SubmissionStatus
import { SOURCE_LABELS, STATUS_LABELS } from '@/types'
import SubmissionList   from '@/components/SubmissionList'
import SubmissionDetail from '@/components/SubmissionDetail'
import ThemeToggle      from '@/components/ThemeToggle'
import Dashboard        from '@/components/Dashboard'
import CalendarView     from '@/components/CalendarView'

type View = 'submissions' | 'dashboard' | 'calendar'

const TABS: { id: View; label: string }[] = [
  { id: 'submissions', label: 'Inzendingen' },
  { id: 'dashboard',   label: 'Dashboard'   },
  { id: 'calendar',    label: 'Kalender'    },
]

export default function SalesHub() {
  const [submissions, setSubmissions]       = useState<Submission[]>([])
  const [selected, setSelected]             = useState<Submission | null>(null)
  const [filter, setFilter]                 = useState<'active' | 'archived'>('active')
  const [companyFilter, setCompanyFilter]   = useState<'all' | SubmissionSource>('all')
  const [statusFilter, setStatusFilter]     = useState<StatusFilter>('all')
  const [view, setView]                     = useState<View>('submissions')
  const [loading, setLoading]               = useState(true)

  const supabase = createClient()

  // Initial fetch
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) setSubmissions(data as Submission[])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('submissions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSubmissions((prev) => [payload.new as Submission, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new as Submission
          setSubmissions((prev) => prev.map((s) => (s.id === row.id ? row : s)))
          setSelected((prev) => (prev?.id === row.id ? row : prev))
        } else if (payload.eventType === 'DELETE') {
          const id = (payload.old as Submission).id
          setSubmissions((prev) => prev.filter((s) => s.id !== id))
          setSelected((prev) => (prev?.id === id ? null : prev))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = useCallback((id: string, status: SubmissionStatus) => {
    const archived_at = status === 'afgewezen' || status === 'afgerond' ? new Date().toISOString() : null
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status, archived_at } : s))
    setSelected((prev) => prev?.id === id ? { ...prev, status, archived_at } : prev)
  }, [])

  const handleDelete = useCallback((id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id))
    setSelected((prev) => (prev?.id === id ? null : prev))
  }, [])

  // Auto-sort: hot leads (100+ personen) first, then newest first
  const sortedSubmissions = useMemo(() =>
    [...submissions].sort((a, b) => {
      const aHot = (a.aantal_personen ?? 0) > 100 ? 1 : 0
      const bHot = (b.aantal_personen ?? 0) > 100 ? 1 : 0
      if (aHot !== bHot) return bHot - aHot
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }),
  [submissions])

  function exportToExcel() {
    const rows = submissions.map((s) => ({
      'Naam':            s.name,
      'E-mail':          s.email,
      'Telefoon':        s.phone ?? '',
      'Onderwerp':       s.onderwerp ?? '',
      'Aantal personen': s.aantal_personen ?? '',
      'Bericht':         s.message ?? '',
      'Status':          STATUS_LABELS[s.status],
      'Bron':            SOURCE_LABELS[s.source],
      'Ontvangen':       new Date(s.created_at).toLocaleString('nl-NL'),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inzendingen')
    XLSX.writeFile(wb, `sales-hub-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <span className="text-sm">Laden…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="shrink-0 flex items-center gap-4 px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {/* Navigation tabs */}
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                view === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        <button
          onClick={exportToExcel}
          className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#1D6F42' }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/>
          </svg>
          Export to Excel
        </button>
        <ThemeToggle />
      </header>

      {/* Views */}
      {view === 'submissions' && (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 shrink-0 flex flex-col overflow-hidden">
            <SubmissionList
              submissions={sortedSubmissions}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
              filter={filter}
              onFilterChange={setFilter}
              companyFilter={companyFilter}
              onCompanyFilterChange={setCompanyFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>
          <main className="flex-1 overflow-hidden">
            {selected ? (
              <SubmissionDetail
                key={selected.id}
                submission={selected}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <p className="text-sm">Selecteer een inzending</p>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {view === 'dashboard' && (
        <Dashboard submissions={submissions} />
      )}

      {view === 'calendar' && (
        <CalendarView submissions={submissions} />
      )}
    </div>
  )
}
