import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// Normalize source identifier from incoming webhook payload
function normalizeSource(raw: string): 'holy_moly_breda' | 'spinola_breda' | null {
  const s = raw.toLowerCase().replace(/\s+/g, '_')
  if (s.includes('holy') || s.includes('holy_moly')) return 'holy_moly_breda'
  if (s.includes('spinola')) return 'spinola_breda'
  return null
}

interface EmailContext {
  name: string
  source: string
  message: string | null
  onderwerp: string | null
  aantal_personen: number | null
}

function generateDraftEmail(ctx: EmailContext): string {
  const { name, source, message, onderwerp, aantal_personen } = ctx
  const sourceName = source === 'holy_moly_breda' ? 'Holy Moly Breda' : 'Spinola Breda'
  const firstName = name.split(' ')[0]

  // Opening — verwijs direct naar het onderwerp of bericht als dat er is
  let opening: string
  if (onderwerp) {
    opening = `Je nam contact op via onze website over "${onderwerp}". Leuk dat je interesse hebt!`
  } else if (message) {
    opening = `Je nam contact op via onze website. We hebben je bericht goed gelezen.`
  } else {
    opening = `Je nam contact op via onze website. Goed dat je de weg naar ons weet te vinden!`
  }

  // Inhoudelijke reactie op het bericht
  let messageReaction = ''
  if (message) {
    messageReaction = `\n\nJe schrijft: "${message}"\n\nDat klinkt als iets waar wij absoluut bij kunnen helpen.`
  }

  // Specifieke vermelding van het aantal personen als dat relevant is
  let persoonDetail = ''
  if (aantal_personen !== null && aantal_personen > 0) {
    persoonDetail = ` voor ${aantal_personen} ${aantal_personen === 1 ? 'persoon' : 'personen'}`
  }

  // Afsluiting met concrete uitnodiging
  const closing = persoonDetail
    ? `Zou je tijd hebben voor een kort gesprek? Dan kijk ik graag met je mee wat we${persoonDetail} kunnen betekenen.`
    : `Zou je tijd hebben voor een kort gesprek? Dan vertel ik je graag wat de mogelijkheden zijn.`

  return `Hoi ${firstName},

${opening}${messageReaction}

${closing}

Je kunt me gewoon terugmailen of bellen — wat jij het fijnst vindt. Ik hoor graag van je!

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
  const onderwerp = body.onderwerp ? String(body.onderwerp) : null
  const aantal_personen = body.aantal_personen != null ? Number(body.aantal_personen) : null

  const draft_email = generateDraftEmail({ name, source, message, onderwerp, aantal_personen })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('submissions')
    .insert({ source, name, email, phone, onderwerp, aantal_personen, message, raw_data: body, draft_email })
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
