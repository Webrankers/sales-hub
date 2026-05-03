import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('submission_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json()
  const tekst = typeof body.tekst === 'string' ? body.tekst.trim() : ''

  if (!tekst) return NextResponse.json({ error: 'tekst is required' }, { status: 422 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('notes')
    .insert({ submission_id: id, tekst })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
