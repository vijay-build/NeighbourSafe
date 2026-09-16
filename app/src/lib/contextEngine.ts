import type { Priority, ZoneType } from './types'

export interface ContextInput {
  zoneType: ZoneType
  hour: number
  expectedActivity: boolean
  source: 'cctv_simulation' | 'community' | 'manual'
}

export interface ContextResult {
  priority: Priority
  reasoning: string
  confidence: number
}

const AFTER_HOURS_START = 22
const AFTER_HOURS_END = 6

function isAfterHours(hour: number) {
  return hour >= AFTER_HOURS_START || hour < AFTER_HOURS_END
}

/** Deterministic fallback context engine. Runs client-side and inside the edge function when Gemini is unavailable. */
export function evaluateContext(input: ContextInput): ContextResult {
  const { zoneType, expectedActivity, source } = input
  const afterHours = isAfterHours(input.hour)

  if (zoneType === 'restricted' && afterHours && !expectedActivity) {
    return {
      priority: 'high',
      reasoning:
        'Activity occurred in a restricted zone outside expected operating hours with no scheduled access. Human verification required.',
      confidence: 0.94,
    }
  }

  if (zoneType === 'sensitive') {
    return {
      priority: 'critical',
      reasoning:
        'Activity detected in a sensitive infrastructure zone. Immediate human verification required regardless of time window.',
      confidence: 0.97,
    }
  }

  if (zoneType === 'controlled' && afterHours && !expectedActivity) {
    return {
      priority: 'attention',
      reasoning: 'Unscheduled activity in a controlled zone outside normal hours. Flagged for dispatcher review.',
      confidence: 0.78,
    }
  }

  if (source === 'community') {
    return {
      priority: 'attention',
      reasoning: 'Community-submitted report queued for human triage and verification.',
      confidence: 0.6,
    }
  }

  return {
    priority: 'normal',
    reasoning: 'Activity is consistent with expected zone usage and operating hours. No elevated response required.',
    confidence: 0.55,
  }
}
