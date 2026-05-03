import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// Normalize source identifier from incoming webhook payload
function normalizeSource(raw: string): 'holy_moly_breda' | 'spinola_breda' | null {
  const s = raw.toLowerCase().replace(/\s+/g, '_')
  if (s.includes('holy') || s.includes('holy_moly')) return 'holy_moly_breda'
  if (s.includes('spinola')) return 'spinola_breda'
  return null
}

function generateDraftEmail(name: string, source: string, message: string | null): string {
  const sourceName = source === 'holy_moly_breda' ? 'Holy Moly Breda' : 'Spinola Breda'
  const firstName = name.split(' ')[0]

  const messageBlock = message
    ? `U liet het volgende bericht achter:\n\n"${message}"\n\nWe hebben dit goed ontvangen en gaan hier graag op in.`
    : `We hebben uw aanvraag in goede orde ontvangen en nemen graag contact met u op.`

  return `Beste ${firstName},

Hartelijk dank voor uw interesse in ${sourceName}. ${messageBlock}

Zou u tijd hebben voor een kort kennismakingsgesprek? Ik help u graag verder en bespreek met u wat wij voor u kunnen betekenen.

U kunt mij bereiken via dit e-mailadres of telefonisch. Ik kijk uit naar uw reactie!

Met vriendelijke groet,
Het ${sourceName} team`
}

export async function POST(req: NextRequest) {
  // Optional webhook secret validation
  const secret = process.env.WEBHOOK_SECRET
  if (secret) {
    const incoming = req.headers.get('x-webhook-secret')
    if (incoming !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const rawSource = String(body.source ?? '').trim()

  if (!name || !email || !rawSource) {
    return NextResponse.json(
      { error: 'Missing required fields: name, email, source' },
      { status: 422 },
    )
  }

  const source = normalizeSource(rawSource)
  if (!source) {
    return NextResponse.json(
      { error: `Unknown source "${rawSource}". Use "holy_moly_breda" or "spinola_breda".` },
      { status: 422 },
    )
  }

  const phone = body.phone ? String(body.phone) : null
  const message = body.message ? String(body.message) : null
  const datum = body.datum ? String(body.datum) : null
  const aantal_personen = body.aantal_personen != null ? Number(body.aantal_personen) : null

  const draft_email = generateDraftEmail(name, source, message)

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('submissions')
    .insert({ source, name, email, phone, datum, aantal_personen, message, raw_data: body, draft_email })
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
