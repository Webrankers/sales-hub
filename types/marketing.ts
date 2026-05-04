export type Platform   = 'instagram' | 'tiktok' | 'facebook'
export type PostType   = 'foto' | 'video' | 'reel' | 'story'
export type PostStatus = 'idee' | 'in_productie' | 'klaar' | 'gepubliceerd'

export interface ContentPost {
  id:              string
  titel:           string
  platform:        Platform
  publicatiedatum: string | null
  type:            PostType | null
  caption:         string | null
  hashtags:        string | null
  canva_link:      string | null
  status:          PostStatus
  created_at:      string
}

export interface HashtagSet {
  id:         string
  naam:       string
  platform:   Platform | 'all'
  hashtags:   string
  created_at: string
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  tiktok:    'TikTok',
  facebook:  'Facebook',
}

export const STATUS_LABELS_MKT: Record<PostStatus, string> = {
  idee:          'Idee',
  in_productie:  'In productie',
  klaar:         'Klaar',
  gepubliceerd:  'Gepubliceerd',
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
  foto:  'Foto',
  video: 'Video',
  reel:  'Reel',
  story: 'Story',
}

// Literal Tailwind classes — scanner must see these here
export function platformDot(p: Platform): string {
  if (p === 'instagram') return 'bg-purple-500'
  if (p === 'tiktok')    return 'bg-gray-800 dark:bg-gray-200'
  /* facebook */          return 'bg-blue-600'
}

export function statusPillMkt(s: PostStatus): string {
  if (s === 'idee')         return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  if (s === 'in_productie') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  if (s === 'klaar')        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  /* gepubliceerd */         return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
}

export function columnBg(s: PostStatus): string {
  if (s === 'idee')         return 'bg-gray-50 dark:bg-gray-900/50'
  if (s === 'in_productie') return 'bg-amber-50/50 dark:bg-amber-950/20'
  if (s === 'klaar')        return 'bg-blue-50/50 dark:bg-blue-950/20'
  /* gepubliceerd */         return 'bg-green-50/50 dark:bg-green-950/20'
}
