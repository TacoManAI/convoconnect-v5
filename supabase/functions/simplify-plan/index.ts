// @ts-nocheck

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

/*
  Edge Function: simplify-plan
  ----------------------------
  • Accepts POST { care_plan_id: string, original_instructions: string }
  • Calls OpenRouter API (o3-mini) with a system prompt to simplify medical
    discharge instructions into a structured JSON object.
  • Validates the LLM response and stores the JSON in
    care_plans.simplified_plan_json.
*/

interface RequestPayload {
  care_plan_id: string
  original_instructions: string
}

const REQUIRED_KEYS = [
  'red_flags',
  'medications',
  'activities',
  'follow_up',
  'other',
]

type SimplifiedPlan = Record<string, unknown>

serve(async (req) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let payload: RequestPayload
  try {
    payload = await req.json()
  } catch (_) {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const { care_plan_id, original_instructions } = payload

  if (!care_plan_id || !original_instructions) {
    return new Response('Missing required fields', { status: 400 })
  }

  const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')

  if (!OPENROUTER_API_KEY || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing environment variables')
    return new Response('Server misconfiguration', { status: 500 })
  }

  // Build the prompt
  const messages = [
    {
      role: 'system',
      content:
        'You are a medical discharge simplifier. Return a JSON object with the keys red_flags, medications, activities, follow_up, other. Each key should map to an array of short, patient-friendly sentences extracted from the text.',
    },
    {
      role: 'user',
      content: original_instructions,
    },
  ]

  // Call OpenRouter
  const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://aftercare.example.com',
      'X-Title': 'Aftercare Companion',
    },
    body: JSON.stringify({
      model: 'openrouter/o3-mini',
      messages,
      temperature: 0.2,
    }),
  })

  if (!openRouterRes.ok) {
    console.error('OpenRouter error', await openRouterRes.text())
    return new Response('LLM error', { status: 502 })
  }

  const completion = await openRouterRes.json()
  const assistantMessage = completion.choices?.[0]?.message?.content as string | undefined

  if (!assistantMessage) {
    console.error('No assistant message received')
    return new Response('LLM error', { status: 502 })
  }

  let simplified: SimplifiedPlan
  try {
    simplified = JSON.parse(assistantMessage)
  } catch (_) {
    console.error('Assistant returned non-JSON content:', assistantMessage)
    return new Response('Invalid LLM output', { status: 502 })
  }

  // Basic schema validation
  const valid = REQUIRED_KEYS.every((key) => Array.isArray(simplified[key]))
  if (!valid) {
    console.error('LLM JSON failed validation:', simplified)
    return new Response('Malformed simplification', { status: 502 })
  }

  // Store into Supabase
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const { error } = await supabase
    .from('care_plans')
    .update({ simplified_plan_json: simplified })
    .eq('id', care_plan_id)

  if (error) {
    console.error('DB update error', error)
    return new Response('Database error', { status: 500 })
  }

  return new Response(JSON.stringify({ success: true, simplified }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}) 