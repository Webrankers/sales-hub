import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('admin_notities')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json()
  const { data, error } = await supabase
    .from('admin_notities')
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
