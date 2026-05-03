# Sales Hub — Setup gids

## Vereisten
- Node.js 18+ (download: https://nodejs.org)
- Supabase account (gratis: https://supabase.com)
- Vercel account (gratis: https://vercel.com)

---

## Stap 1 — Supabase project aanmaken

1. Ga naar https://supabase.com en maak een nieuw project aan.
2. Wacht tot het project klaar is.
3. Ga naar **SQL Editor** en plak de inhoud van `supabase/schema.sql` en voer uit.
4. Ga naar **Project Settings → API** en kopieer:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Stap 2 — Lokaal draaien

```bash
# 1. Dependencies installeren
npm install

# 2. Environment variabelen instellen
cp .env.local.example .env.local
# → vul de waarden in .env.local in

# 3. Dev server starten
npm run dev
# → open http://localhost:3000
```

---

## Stap 3 — Deployen op Vercel

```bash
npm i -g vercel
vercel
```

Of via de Vercel website:
1. Importeer de GitHub repo.
2. Voeg de environment variabelen toe (zelfde als `.env.local`).
3. Deploy.

---

## Stap 4 — Webhook instellen op je websites

Stuur een `POST` request naar:

```
https://jouw-app.vercel.app/api/webhook
```

### Headers
```
Content-Type: application/json
x-webhook-secret: <jouw WEBHOOK_SECRET>
```

### Body (minimaal)
```json
{
  "source": "holy_moly_breda",
  "name": "Jan Janssen",
  "email": "jan@example.com",
  "phone": "06-12345678",
  "message": "Ik heb interesse in jullie diensten."
}
```

Voor Spinola: gebruik `"source": "spinola_breda"`.

Alle extra velden worden opgeslagen in `raw_data` (JSONB).

### Testverzoek (curl)
```bash
curl -X POST https://jouw-app.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: jouw-secret" \
  -d '{"source":"holy_moly_breda","name":"Test Persoon","email":"test@example.com","message":"Hallo!"}'
```

---

## Status overzicht

| Status | Betekenis | Archief |
|---|---|---|
| Actie ondernemen | Nieuw, directe actie vereist | Nee |
| Wachten op reactie | Mail verstuurd, wacht op klant | Nee |
| Afgewezen | Niet geïnteresseerd | Ja |
| Afgerond | Deal gesloten / follow-up gedaan | Ja + Google Calendar link |

---

## Realtime

Supabase Realtime is ingeschakeld. Nieuwe inzendingen verschijnen direct in de lijst zonder pagina te vernieuwen.
