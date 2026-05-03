'use client'

import { useMemo } from 'react'
import type { Submission } from '@/types'

interface Props {
  submissions: Submission[]
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string
}

function StatCard({ label, value, sub, accent = 'text-gray-900 dark:text-gray-100' }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-4xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard({ submissions }: Props) {
  const stats = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const thisMonth = submissions.filter((s) => new Date(s.created_at) >= monthStart)
    const total        = thisMonth.length
    const completed    = thisMonth.filter((s) => s.status === 'afgerond').length
    const rejected     = thisMonth.filter((s) => s.status === 'afgewezen').length
    const active       = submissions.filter((s) => s.archived_at === null).length
    const hotLeads     = submissions.filter((s) => (s.aantal_personen ?? 0) > 100).length

    const withPersons  = submissions.filter((s) => s.aantal_personen !== null)
    const avgPersons   = withPersons.length > 0
      ? Math.round(withPersons.reduce((sum, s) => sum + (s.aantal_personen ?? 0), 0) / withPersons.length)
      : 0

    const conversion   = total > 0 ? Math.round((completed / total) * 100) : 0

    const monthName = now.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })

    return { total, completed, rejected, active, hotLeads, avgPersons, conversion, monthName }
  }, [submissions])

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Dashboard</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 capitalize">{stats.monthName}</p>

        {/* Primary stats grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-4">
          <StatCard
            label="Totaal inzendingen"
            value={stats.total}
            sub="deze maand"
          />
          <StatCard
            label="Afgerond"
            value={stats.completed}
            sub="deze maand"
            accent="text-green-600 dark:text-green-400"
          />
          <StatCard
            label="Afgewezen"
            value={stats.rejected}
            sub="deze maand"
            accent="text-gray-500 dark:text-gray-400"
          />
          <StatCard
            label="Nog actief"
            value={stats.active}
            sub="openstaande leads"
            accent="text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            label="Hot leads"
            value={stats.hotLeads}
            sub="100+ personen"
            accent="text-orange-500 dark:text-orange-400"
          />
          <StatCard
            label="Gem. personen"
            value={stats.avgPersons === 0 ? '—' : stats.avgPersons}
            sub="per aanvraag"
          />
        </div>

        {/* Conversion rate — full width emphasis card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Conversiepercentage
            </p>
            <p className={`text-5xl font-bold ${
              stats.conversion >= 50
                ? 'text-green-600 dark:text-green-400'
                : stats.conversion >= 20
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-500 dark:text-red-400'
            }`}>
              {stats.conversion}%
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {stats.completed} afgerond van {stats.total} inzendingen deze maand
            </p>
          </div>

          {/* Simple progress bar */}
          <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-green-500"
              style={{ width: `${stats.conversion}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
