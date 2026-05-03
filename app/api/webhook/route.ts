import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

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

  let opening: string
  if (onderwerp) {
    opening = `Je nam contact op via onze website over "${onderwerp}". Leuk dat je interesse hebt!`
  } else if (message) {
    opening = `Je nam contact op via onze website. We hebben je bericht goed gelezen.`
  } else {
    opening = `Je nam contact op via onze website. Goed dat je de weg naar ons weet te vinden!`
  }

  const messageReaction = message
    ? `\n\nJe schrijft: "${message}"\n\nDat klinkt als iets waar wij absoluut bij kunnen helpen.`
    : ''

  const persoonDetail =
    aantal_personen !== null && aantal_personen > 0
      ? ` voor ${aantal_personen} ${aantal_personen === 1 ? 'persoon' : 'personen'}`
      : ''

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

/** Parse request body regardless of Content-Type.
 *  Supports application/json and application/x-www-form-urlencoded.
 *  Returns a flat key→string record plus the raw text for debugging. */
async function parseBody(req: NextRequest): Promise<{
  fields: Record<string, string>
  rawText: string
  contentType: string
}> {
  const contentType = req.headers.get('content-type') ?? ''
  const rawText = await req.text()

  let fields: Record<string, string> = {}

  if (contentType.includes('application/json')) {
    try {
      const parsed = JSON.parse(rawText)
      // Flatten: keep only string-coercible leaf values
      for (const [k, v] of Object.entries(parsed)) {
        if (v !== null && v !== undefined) fields[k] = String(v)
      }
    } catch {
      // Leave fields empty — validation will catch missing required fields
    }
  } else {
    // application/x-www-form-urlencoded (Elementor default) or multipart fallback
    const params = new URLSearchParams(rawText)
    for (const [k, v] of params.entries()) {
      fields[k] = v
    }
  }

  return { fields, rawText, contentType }
}

export async function POST(req: NextRequest) {
  // Optional webhook secret — accept header or ?secret= URL param
  const secret = process.env.WEBHOOK_SECRET
  if (secret) {
    const incoming =
      req.headers.get('x-webhook-secret') ??
      req.nextUrl.searchParams.get('secret')
    if (incoming !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const { fields, rawText, contentType } = await parseBody(req)

  // Temporary debug log — remove once Elementor field mapping is confirmed
  console.log('[webhook] content-type:', contentType)
  console.log('[webhook] raw body:', rawText)
  console.log('[webhook] parsed fields:', fields)

  const name      = (fields.name ?? '').trim()
  const email     = (fields.email ?? '').trim()
  const rawSource = (fields.source ?? '').trim()

  if (!name || !email || !rawSource) {
    console.warn('[webhook] missing required fields — name:', name, 'email:', email, 'source:', rawSource)
    return NextResponse.json(
      { error: 'Missing required fields: name, email, source', received: fields },
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

  const phone           = fields.phone    ? fields.phone.trim()                  : null
  const message         = fields.message  ? fields.message.trim()                : null
  const onderwerp       = fields.onderwerp ? fields.onderwerp.trim()              : null
  const aantal_personen = fields.aantal_personen ? Number(fields.aantal_personen) : null

  const draft_email = generateDraftEmail({ name, source, message, onderwerp, aantal_personen })

  // Store raw fields as raw_data for traceability
  const raw_data: Record<string, string> = { ...fields, _contentType: contentType }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('submissions')
    .insert({ source, name, email, phone, onderwerp, aantal_personen, message, raw_data, draft_email })
    .select()
    .single()

  if (error) {
    console.error('[webhook] Supabase insert error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
