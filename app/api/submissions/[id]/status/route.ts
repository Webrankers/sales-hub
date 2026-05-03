import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import type { SubmissionStatus } from '@/types'

const VALID_STATUSES: SubmissionStatus[] = [
  'actie_ondernemen',
  'wachten_op_reactie',
  'afgewezen',
  'afgerond',
]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json()
  const status: SubmissionStatus = body.status

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 422 })
  }

  const supabase = createServiceClient()

  const update: Record<string, unknown> = { status }
  if (status === 'afgewezen' || status === 'afgerond') {
    update.archived_at = new Date().toISOString()
  } else {
    update.archived_at = null
  }

  const { error } = await supabase
    .from('submissions')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
