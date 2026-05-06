'use client'

import { useState } from 'react'
import AanvraagFormulier from '@/components/aanvragen/AanvraagFormulier'
import MijnAanvragen     from '@/components/aanvragen/MijnAanvragen'
import { useRouter }     from 'next/navigation'
import { createClient }  from '@/lib/supabase-browser'

type Tab = 'formulier' | 'mijn'

export default function AanvragenPage() {
  const [tab,      setTab]      = useState<Tab>('formulier')
  const [refresh,  setRefresh]  = useState(0)
  const router  = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function onFormSuccess() {
    setTab('mijn')
    setRefresh(r => r + 1)
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/hub')}
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Hub
          </button>
          <span className="text-gray-200 dark:text-gray-700">/</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Aanvragen</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Uitloggen
        </button>
      </header>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-6 pt-8">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-1 w-fit mb-8">
          {([
            { id: 'formulier', label: 'Nieuwe aanvraag' },
            { id: 'mijn',      label: 'Mijn aanvragen'  },
          ] as { id: Tab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'formulier' && <AanvraagFormulier onSuccess={onFormSuccess} />}
        {tab === 'mijn'      && <MijnAanvragen key={refresh} />}
      </div>
    </div>
  )
}
