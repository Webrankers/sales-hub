import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getSessionUser }       from '@/lib/supabase-session'

/** GET /api/aanvragen — returns only the current user's aanvragen */
export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('marketing_aanvragen')
    .select('*')
    .eq('aanvrager_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json(data)
}

/** POST /api/aanvragen — create a new aanvraag */
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('marketing_aanvragen')
    .insert({ ...body, aanvrager_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
