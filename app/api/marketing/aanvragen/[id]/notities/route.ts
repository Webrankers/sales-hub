import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getSessionUser }       from '@/lib/supabase-session'

async function checkRole(userId: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', userId)
    .single()
  return data?.rol
}

/** GET /api/marketing/aanvragen/[id]/notities */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rol = await checkRole(user.id)
  if (rol !== 'marketing' && rol !== 'eigenaar')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('marketing_notities')
    .select('*')
    .eq('aanvraag_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json(data)
}

/** POST /api/marketing/aanvragen/[id]/notities */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rol = await checkRole(user.id)
  if (rol !== 'marketing' && rol !== 'eigenaar')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id }   = await params
  const { tekst, auteur } = await req.json()

  if (!tekst?.trim())
    return NextResponse.json({ error: 'tekst is required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('marketing_notities')
    .insert({ aanvraag_id: id, tekst: tekst.trim(), auteur: auteur ?? 'marketing' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
