export type DocCategorie   = 'contract' | 'offerte' | 'belasting' | 'verzekering' | 'overig'
export type TaakPrioriteit = 'laag' | 'normaal' | 'hoog' | 'urgent'
export type TaakStatus     = 'open' | 'in_behandeling' | 'afgerond'

export interface Document {
  id:           string
  titel:        string
  categorie:    DocCategorie
  omschrijving: string | null
  link:         string | null
  created_at:   string
}

export interface Taak {
  id:           string
  titel:        string
  omschrijving: string | null
  deadline:     string | null
  prioriteit:   TaakPrioriteit
  status:       TaakStatus
  created_at:   string
}

export interface Contact {
  id:         string
  naam:       string
  bedrijf:    string | null
  telefoon:   string | null
  email:      string | null
  notitie:    string | null
  created_at: string
}

export interface AdminNotitie {
  id:         string
  titel:      string
  tekst:      string | null
  created_at: string
}

// ── Labels ──────────────────────────────────────────────────────────────────

export const CATEGORIE_LABELS: Record<DocCategorie, string> = {
  contract:    'Contract',
  offerte:     'Offerte',
  belasting:   'Belasting',
  verzekering: 'Verzekering',
  overig:      'Overig',
}

export const PRIORITEIT_LABELS: Record<TaakPrioriteit, string> = {
  laag:    'Laag',
  normaal: 'Normaal',
  hoog:    'Hoog',
  urgent:  'Urgent',
}

export const STATUS_LABELS_ADMIN: Record<TaakStatus, string> = {
  open:          'Open',
  in_behandeling:'In behandeling',
  afgerond:      'Afgerond',
}

// ── Literal Tailwind class helpers (scanner reads these) ─────────────────────

export function categoriePill(c: DocCategorie): string {
  if (c === 'contract')    return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
  if (c === 'offerte')     return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  if (c === 'belasting')   return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  if (c === 'verzekering') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  /* overig */              return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
}

export function prioriteitPill(p: TaakPrioriteit): string {
  if (p === 'laag')    return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  if (p === 'normaal') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  if (p === 'hoog')    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  /* urgent */          return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

export function statusPillAdmin(s: TaakStatus): string {
  if (s === 'open')          return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  if (s === 'in_behandeling')return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
  /* afgerond */              return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
}
