'use client'

import { useState } from 'react'
import type { ContentPost, HashtagSet, Platform, PostStatus, PostType } from '@/types/marketing'
import { PLATFORM_LABELS, STATUS_LABELS_MKT, POST_TYPE_LABELS } from '@/types/marketing'

const PLATFORMS: Platform[]   = ['instagram', 'tiktok', 'facebook']
const POST_TYPES: PostType[]  = ['foto', 'video', 'reel', 'story']
const STATUSES: PostStatus[]  = ['idee', 'in_productie', 'klaar', 'gepubliceerd']

interface Props {
  post?:         ContentPost | null   // undefined/null = create mode
  hashtagSets:   HashtagSet[]
  onSave:        (data: Partial<ContentPost>) => Promise<void>
  onDelete?:     (id: string) => Promise<void>
  onClose:       () => void
}

const FIELD = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'

export default function PostModal({ post, hashtagSets, onSave, onDelete, onClose }: Props) {
  const isEdit = !!post

  const [titel,           setTitel]           = useState(post?.titel ?? '')
  const [platform,        setPlatform]        = useState<Platform>(post?.platform ?? 'instagram')
  const [publicatiedatum, setPublicatiedatum] = useState(post?.publicatiedatum ?? '')
  const [type,            setType]            = useState<PostType | ''>(post?.type ?? '')
  const [caption,         setCaption]         = useState(post?.caption ?? '')
  const [hashtags,        setHashtags]        = useState(post?.hashtags ?? '')
  const [canvaLink,       setCanvaLink]       = useState(post?.canva_link ?? '')
  const [status,          setStatus]          = useState<PostStatus>(post?.status ?? 'idee')
  const [saving,          setSaving]          = useState(false)
  const [deleting,        setDeleting]        = useState(false)
  const [captionCopied,   setCaptionCopied]   = useState(false)

  function appendHashtagSet(set: HashtagSet) {
    setHashtags((h) => (h.trim() ? h.trim() + ' ' : '') + set.hashtags)
  }

  function openCaptionGenerator() {
    const typeLabel = type ? POST_TYPE_LABELS[type as PostType] : 'post'
    const prompt = `Schrijf een pakkende ${PLATFORM_LABELS[platform]} caption voor een ${typeLabel} over "${titel || 'dit onderwerp'}". De caption moet passen bij de stijl van ${PLATFORM_LABELS[platform]} en aanzetten tot interactie. Geef ook 10 relevante hashtags.`
    navigator.clipboard.writeText(prompt).catch(() => {})
    window.open('https://claude.ai', '_blank')
    setCaptionCopied(true)
    setTimeout(() => setCaptionCopied(false), 3000)
  }

  async function handleSave() {
    if (!titel.trim()) return
    setSaving(true)
    try {
      await onSave({
        titel:           titel.trim(),
        platform,
        publicatiedatum: publicatiedatum || null,
        type:            (type || null) as PostType | null,
        caption:         caption.trim() || null,
        hashtags:        hashtags.trim() || null,
        canva_link:      canvaLink.trim() || null,
        status,
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!post || !onDelete) return
    if (!confirm('Post verwijderen?')) return
    setDeleting(true)
    try {
      await onDelete(post.id)
    } finally {
      setDeleting(false)
    }
  }

  // Only show sets relevant to the chosen platform
  const relevantSets = hashtagSets.filter(
    (s) => s.platform === 'all' || s.platform === platform,
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {isEdit ? 'Post bewerken' : 'Nieuwe post'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Titel */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Titel *</label>
            <input
              type="text"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className={FIELD}
              placeholder="Post titel"
            />
          </div>

          {/* Platform + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className={FIELD}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as PostType | '')} className={FIELD}>
                <option value="">— Selecteer —</option>
                {POST_TYPES.map((t) => <option key={t} value={t}>{POST_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>

          {/* Datum + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Publicatiedatum</label>
              <input
                type="date"
                value={publicatiedatum}
                onChange={(e) => setPublicatiedatum(e.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as PostStatus)} className={FIELD}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS_MKT[s]}</option>)}
              </select>
            </div>
          </div>

          {/* Caption */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Caption</label>
              <button
                onClick={openCaptionGenerator}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
              >
                {captionCopied
                  ? <><span className="text-green-500">✓</span> Prompt gekopieerd!</>
                  : <><span>✨</span> Genereer met Claude</>
                }
              </button>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className={`${FIELD} resize-none`}
              placeholder="Schrijf de post caption…"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Hashtags</label>
            <textarea
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              rows={2}
              className={`${FIELD} resize-none`}
              placeholder="#hashtag #example"
            />
            {relevantSets.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {relevantSets.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => appendHashtagSet(s)}
                    title={s.hashtags}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    + {s.naam}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Canva link */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Canva link</label>
            <input
              type="url"
              value={canvaLink}
              onChange={(e) => setCanvaLink(e.target.value)}
              className={FIELD}
              placeholder="https://www.canva.com/design/…"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 gap-3">
          {isEdit && onDelete ? (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Verwijderen…' : 'Verwijderen'}
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              disabled={!titel.trim() || saving}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              {saving ? 'Opslaan…' : 'Opslaan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
