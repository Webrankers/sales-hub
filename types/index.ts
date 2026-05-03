export type SubmissionSource = 'holy_moly_breda' | 'spinola_breda'

export type SubmissionStatus =
  | 'actie_ondernemen'
  | 'wachten_op_reactie'
  | 'afgewezen'
  | 'afgerond'

export interface Submission {
  id: string
  source: SubmissionSource
  name: string
  email: string
  phone: string | null
  onderwerp: string | null
  aantal_personen: number | null
  message: string | null
  notes: string | null
  raw_data: Record<string, unknown> | null
  status: SubmissionStatus
  draft_email: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export const SOURCE_LABELS: Record<SubmissionSource, string> = {
  holy_moly_breda: 'Holy Moly Breda',
  spinola_breda: 'Spinola Breda',
}

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  actie_ondernemen: 'Actie ondernemen',
  wachten_op_reactie: 'Wachten op reactie',
  afgewezen: 'Afgewezen',
  afgerond: 'Afgerond',
}

// Includes dark: variants so pills are readable in both modes
export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  actie_ondernemen:  'bg-red-100    text-red-700    dark:bg-red-900/50    dark:text-red-300',
  wachten_op_reactie:'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  afgewezen:         'bg-gray-100   text-gray-500   dark:bg-gray-700      dark:text-gray-400',
  afgerond:          'bg-green-100  text-green-700  dark:bg-green-900/50  dark:text-green-300',
}

export const SOURCE_COLORS: Record<SubmissionSource, string> = {
  holy_moly_breda: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  spinola_breda:   'bg-blue-100   text-blue-700   dark:bg-blue-900/50   dark:text-blue-300',
}
