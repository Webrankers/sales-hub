import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createServiceClient()
  const { error } = await supabase.from('submissions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json()

  if (typeof body.notes !== 'string') {
    return NextResponse.json({ error: 'notes must be a string' }, { status: 422 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('submissions')
    .update({ notes: body.notes || null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
