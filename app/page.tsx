'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Submission, SubmissionStatus } from '@/types'
import SubmissionList from '@/components/SubmissionList'
import SubmissionDetail from '@/components/SubmissionDetail'

export default function SalesHub() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selected, setSelected] = useState<Submission | null>(null)
  const [filter, setFilter] = useState<'active' | 'archived'>('active')
  const [loading, setLoading] = useState(true)

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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as Submission
            setSubmissions((prev) => [row, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as Submission
            setSubmissions((prev) =>
              prev.map((s) => (s.id === row.id ? row : s)),
            )
            setSelected((prev) => (prev?.id === row.id ? row : prev))
          } else if (payload.eventType === 'DELETE') {
            const id = (payload.old as Submission).id
            setSubmissions((prev) => prev.filter((s) => s.id !== id))
            setSelected((prev) => (prev?.id === id ? null : prev))
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = useCallback((id: string, status: SubmissionStatus) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              archived_at:
                status === 'afgewezen' || status === 'afgerond'
                  ? new Date().toISOString()
                  : null,
            }
          : s,
      ),
    )
    setSelected((prev) =>
      prev?.id === id
        ? {
            ...prev,
            status,
            archived_at:
              status === 'afgewezen' || status === 'afgerond'
                ? new Date().toISOString()
                : null,
          }
        : prev,
    )
  }, [])

  const handleDelete = useCallback((id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id))
    setSelected((prev) => (prev?.id === id ? null : prev))
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
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
    <div className="h-full flex overflow-hidden">
      {/* Left column — submission list */}
      <div className="w-80 shrink-0 flex flex-col overflow-hidden">
        <SubmissionList
          submissions={submissions}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          filter={filter}
          onFilterChange={setFilter}
        />
      </div>

      {/* Right column — detail view */}
      <main className="flex-1 overflow-hidden">
        {selected ? (
          <SubmissionDetail
            key={selected.id}
            submission={selected}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
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
  )
}
