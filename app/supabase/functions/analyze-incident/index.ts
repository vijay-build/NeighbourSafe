// Supabase Edge Function: analyze-incident
// Calls Gemini to summarise/prioritise an incident; falls back to a deterministic
// context engine (mirrored from src/lib/contextEngine.ts) if Gemini is unavailable.

// @ts-expect-error Deno remote import, resolved at deploy time
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'

interface RequestBody {
  zone: string
  zoneType: 'public' | 'controlled' | 'restricted' | 'sensitive'
  time: string // ISO timestamp
  source: 'cctv_simulation' | 'community' | 'manual'
  expectedActivity: boolean
  description: string
}

function deterministicFallback(body: RequestBody) {
  const hour = new Date(body.time).getUTCHours()
  const afterHours = hour >= 22 || hour < 6

  if (body.zoneType === 'restricted' && afterHours && !body.expectedActivity) {
    return {
      summary: `Unscheduled activity detected in ${body.zone} outside expected operating hours.`,
      priority: 'high',
      reasoning:
        'Activity occurred in a restricted zone outside expected operating hours with no scheduled access. Human verification required.',
      confidence: 0.94,
    }
  }
  if (body.zoneType === 'sensitive') {
    return {
      summary: `Activity detected in sensitive zone ${body.zone}.`,
      priority: 'critical',
      reasoning: 'Sensitive infrastructure zone triggers immediate human verification regardless of time window.',
      confidence: 0.97,
    }
  }
  if (body.zoneType === 'controlled' && afterHours && !body.expectedActivity) {
    return {
      summary: `Unscheduled activity in controlled zone ${body.zone} after hours.`,
      priority: 'attention',
      reasoning: 'Unscheduled activity in a controlled zone outside normal hours. Flagged for dispatcher review.',
      confidence: 0.78,
    }
  }
  return {
    summary: `Activity reported at ${body.zone}.`,
    priority: 'normal',
    reasoning: 'Activity is consistent with expected zone usage and operating hours.',
    confidence: 0.55,
  }
}

serve(async (req: Request) => {
  try {
    const body = (await req.json()) as RequestBody
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiKey) {
      return new Response(JSON.stringify(deterministicFallback(body)), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    try {
      const prompt = `You are a campus safety context engine. Never claim guilt or criminal intent. Given:
Zone: ${body.zone} (${body.zoneType})
Time: ${body.time}
Source: ${body.source}
Expected activity scheduled: ${body.expectedActivity}
Description: ${body.description}

Return strict JSON: {"summary": string, "priority": "normal"|"attention"|"high"|"critical", "reasoning": string, "confidence": number between 0 and 1}`

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        },
      )

      if (!res.ok) throw new Error(`Gemini error ${res.status}`)
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw new Error('Empty Gemini response')
      const parsed = JSON.parse(text)
      return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } })
    } catch (geminiError) {
      console.error('Gemini failed, using fallback', geminiError)
      return new Response(JSON.stringify(deterministicFallback(body)), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 400 })
  }
})
