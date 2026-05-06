import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getSessionUser }       from '@/lib/supabase-session'

/** GET /api/aanvragen/[id] — fetch one aanvraag (must belong to current user) with its notities */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()

  const { data: aanvraag, error } = await supabase
    .from('marketing_aanvragen')
    .select('*')
    .eq('id', id)
    .eq('aanvrager_id', user.id)   // own record only
    .single()

  if (error || !aanvraag)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: notities } = await supabase
    .from('marketing_notities')
    .select('*')
    .eq('aanvraag_id', id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ ...aanvraag, notities: notities ?? [] })
}
