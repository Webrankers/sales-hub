import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('taken')
    .select('*')
    .order('deadline', { ascending: true, nullsFirst: false })
  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json()
  const { data, error } = await supabase
    .from('taken')
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
