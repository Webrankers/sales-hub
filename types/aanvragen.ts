export type AanvraagStatus  = 'in_behandeling' | 'geaccepteerd' | 'afgewezen'
export type PlanningStatus  = 'uitvoeren' | 'feedback_moment' | 'opgeleverd'
export type Toegewezene     = 'jazzlyn' | 'maxime'

export interface MarketingAanvraag {
  id:               string
  aanvrager_id:     string | null
  aanvrager_naam:   string
  zaak:             string
  kanalen:          string[]
  beschrijving:     string
  drukwerk_details: string | null
  banner_afwerking: string | null
  opleverdatum:     string | null
  feedback_gewenst: boolean
  opmerkingen:      string | null
  status:           AanvraagStatus
  toegewezen_aan:   Toegewezene | null
  voortgang:        number
  interne_deadline: string | null
  planning_status:  PlanningStatus
  afwijzing_reden:  string | null
  created_at:       string
  updated_at:       string
}

export interface MarketingNotitie {
  id:          string
  aanvraag_id: string
  auteur:      string
  tekst:       string
  created_at:  string
}

// ── Labels ──────────────────────────────────────────────────────────────────

export const ZAAK_OPTIES = [
  'Holy Moly',
  'Spinola',
  'Evenementen haven',
  'Huiskamer',
  'Gastrobar de Markt',
  'Overig',
] as const

export const KANAAL_OPTIES = [
  'Instagram', 'TikTok', 'Facebook', 'Website', 'LinkedIn', 'Drukwerk', 'Overig',
] as const

export const STATUS_LABELS_AAN: Record<AanvraagStatus, string> = {
  in_behandeling: 'In behandeling',
  geaccepteerd:   'Geaccepteerd',
  afgewezen:      'Afgewezen',
}

export const PLANNING_STATUS_LABELS: Record<PlanningStatus, string> = {
  uitvoeren:       'Uitvoeren',
  feedback_moment: 'Feedback moment',
  opgeleverd:      'Opgeleverd',
}

export const TOEGEWEZENE_LABELS: Record<Toegewezene, string> = {
  jazzlyn: 'Jazzlyn',
  maxime:  'Maxime',
}

// ── Literal Tailwind class helpers ────────────────────────────────────────────

export function statusBadge(s: AanvraagStatus): string {
  if (s === 'in_behandeling') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  if (s === 'geaccepteerd')   return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  /* afgewezen */              return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
}

export function planningStatusBadge(s: PlanningStatus): string {
  if (s === 'uitvoeren')       return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
  if (s === 'feedback_moment') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  /* opgeleverd */              return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
}

export function toegewezeneBadge(t: Toegewezene): string {
  if (t === 'jazzlyn') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  /* maxime */          return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
}
