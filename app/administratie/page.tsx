'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Document, Taak, TaakStatus, Contact, AdminNotitie } from '@/types/admin'
import DocumentenBibliotheek from '@/components/admin/DocumentenBibliotheek'
import Takenlijst             from '@/components/admin/Takenlijst'
import Contactenboek          from '@/components/admin/Contactenboek'
import Notitieblok            from '@/components/admin/Notitieblok'

type Tab = 'documenten' | 'taken' | 'contacten' | 'notities'

const TABS: { id: Tab; label: string }[] = [
  { id: 'documenten', label: 'Documenten' },
  { id: 'taken',      label: 'Taken'      },
  { id: 'contacten',  label: 'Contacten'  },
  { id: 'notities',   label: 'Notities'   },
]

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json() as Promise<T>
}

export default function AdministratiePage() {
  const router    = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('documenten')
  const [loading,   setLoading]   = useState(true)

  const [documenten, setDocumenten] = useState<Document[]>([])
  const [taken,      setTaken]      = useState<Taak[]>([])
  const [contacten,  setContacten]  = useState<Contact[]>([])
  const [notities,   setNotities]   = useState<AdminNotitie[]>([])

  // ── Fetch all ──────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      apiFetch<Document[]>('/api/admin/documenten'),
      apiFetch<Taak[]>('/api/admin/taken'),
      apiFetch<Contact[]>('/api/admin/contacten'),
      apiFetch<AdminNotitie[]>('/api/admin/notities'),
    ]).then(([docs, tks, ctcts, nts]) => {
      setDocumenten(docs)
      setTaken(tks)
      setContacten(ctcts)
      setNotities(nts)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // ── Documenten ─────────────────────────────────────────────────────────────
  const addDocument = useCallback(async (data: Partial<Document>) => {
    const doc = await apiFetch<Document>('/api/admin/documenten', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    setDocumenten((prev) => [doc, ...prev])
  }, [])

  const deleteDocument = useCallback(async (id: string) => {
    await apiFetch(`/api/admin/documenten/${id}`, { method: 'DELETE' })
    setDocumenten((prev) => prev.filter((d) => d.id !== id))
  }, [])

  // ── Taken ──────────────────────────────────────────────────────────────────
  const addTaak = useCallback(async (data: Partial<Taak>) => {
    const taak = await apiFetch<Taak>('/api/admin/taken', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    setTaken((prev) => [...prev, taak].sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return a.deadline.localeCompare(b.deadline)
    }))
  }, [])

  const updateTaakStatus = useCallback(async (id: string, status: TaakStatus) => {
    setTaken((prev) => prev.map((t) => t.id === id ? { ...t, status } : t))
    await apiFetch(`/api/admin/taken/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
  }, [])

  const deleteTaak = useCallback(async (id: string) => {
    await apiFetch(`/api/admin/taken/${id}`, { method: 'DELETE' })
    setTaken((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── Contacten ──────────────────────────────────────────────────────────────
  const addContact = useCallback(async (data: Partial<Contact>) => {
    const contact = await apiFetch<Contact>('/api/admin/contacten', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    setContacten((prev) => [...prev, contact].sort((a, b) => a.naam.localeCompare(b.naam)))
  }, [])

  const updateContact = useCallback(async (id: string, data: Partial<Contact>) => {
    const updated = await apiFetch<Contact>(`/api/admin/contacten/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    setContacten((prev) => prev.map((c) => c.id === id ? updated : c).sort((a, b) => a.naam.localeCompare(b.naam)))
  }, [])

  const deleteContact = useCallback(async (id: string) => {
    await apiFetch(`/api/admin/contacten/${id}`, { method: 'DELETE' })
    setContacten((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // ── Notities ───────────────────────────────────────────────────────────────
  const addNotitie = useCallback(async (data: { titel: string; tekst: string | null }) => {
    const notitie = await apiFetch<AdminNotitie>('/api/admin/notities', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    setNotities((prev) => [notitie, ...prev])
  }, [])

  const deleteNotitie = useCallback(async (id: string) => {
    await apiFetch(`/api/admin/notities/${id}`, { method: 'DELETE' })
    setNotities((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <svg className="w-8 h-8 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => router.push('/hub')}
          className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Hub
        </button>

        <span className="text-gray-200 dark:text-gray-700">|</span>

        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Tab content */}
      <div className={`flex-1 overflow-y-auto px-6 py-6 ${activeTab === 'contacten' ? 'overflow-hidden flex flex-col' : ''}`}>
        {activeTab === 'documenten' && (
          <div className="max-w-3xl mx-auto">
            <DocumentenBibliotheek documenten={documenten} onAdd={addDocument} onDelete={deleteDocument} />
          </div>
        )}
        {activeTab === 'taken' && (
          <div className="max-w-3xl mx-auto">
            <Takenlijst taken={taken} onAdd={addTaak} onStatusChange={updateTaakStatus} onDelete={deleteTaak} />
          </div>
        )}
        {activeTab === 'contacten' && (
          <div className="flex-1 min-h-0 max-w-5xl mx-auto w-full">
            <Contactenboek contacten={contacten} onAdd={addContact} onUpdate={updateContact} onDelete={deleteContact} />
          </div>
        )}
        {activeTab === 'notities' && (
          <div className="max-w-2xl mx-auto">
            <Notitieblok notities={notities} onAdd={addNotitie} onDelete={deleteNotitie} />
          </div>
        )}
      </div>
    </div>
  )
}
