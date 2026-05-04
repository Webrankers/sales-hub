'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

type Rol = 'eigenaar' | 'sales' | 'marketing' | 'admin'

interface Profile {
  naam: string | null
  rol: Rol
}

interface Tile {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  color: string
  href?: string
  soon?: boolean
  rollen: Rol[]        // which roles can see this tile
}

const TILES: Tile[] = [
  {
    id: 'sales',
    label: 'Sales',
    description: 'Inzendingen, leads en opvolging voor Holy Moly Breda & Spinola Breda.',
    color: 'from-indigo-500 to-indigo-700',
    href: '/',
    rollen: ['eigenaar', 'sales'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Content kalender, posts plannen en hashtag sets voor Holy Moly & Spinola.',
    color: 'from-pink-500 to-rose-600',
    href: '/marketing',
    rollen: ['eigenaar', 'marketing'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Administratie',
    description: 'Documenten, taken, contacten en notities op één plek.',
    color: 'from-amber-500 to-orange-600',
    href: '/administratie',
    rollen: ['eigenaar', 'admin'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
]

export default function HubPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [email,    setEmail]    = useState<string>('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setEmail(user.email ?? '')

      const { data } = await supabase
        .from('profiles')
        .select('naam, rol')
        .eq('id', user.id)
        .single()

      setProfile(data as Profile ?? { naam: null, rol: 'sales' })
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName = profile?.naam || email.split('@')[0] || 'Gebruiker'

  const visibleTiles = profile
    ? TILES.filter((t) => t.rollen.includes(profile.rol))
    : []

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Hub</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {displayName}
            {profile?.rol && (
              <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {profile.rol}
              </span>
            )}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Uitloggen
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Welkom, {displayName}
        </h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-10">Kies een module om te beginnen.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleTiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => !tile.soon && tile.href && router.push(tile.href)}
              disabled={tile.soon}
              className={[
                'group relative text-left rounded-2xl overflow-hidden transition-all',
                tile.soon
                  ? 'cursor-default opacity-70'
                  : 'hover:scale-[1.02] hover:shadow-xl shadow-sm cursor-pointer',
              ].join(' ')}
            >
              {/* Gradient header */}
              <div className={`bg-gradient-to-br ${tile.color} p-6 text-white`}>
                {tile.icon}
                <h3 className="text-xl font-bold mt-3">{tile.label}</h3>
              </div>

              {/* Body */}
              <div className="bg-white dark:bg-gray-900 border border-t-0 border-gray-100 dark:border-gray-800 rounded-b-2xl px-6 py-4 flex items-end justify-between gap-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {tile.description}
                </p>
                {tile.soon ? (
                  <span className="shrink-0 text-[10px] font-bold text-white bg-gray-400 dark:bg-gray-600 rounded-full px-2 py-0.5">
                    Binnenkort
                  </span>
                ) : (
                  <svg className="shrink-0 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
