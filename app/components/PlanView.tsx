import React from 'react'
import {
  Siren,
  PhoneCall,
  Pill,
  Ban,
  Footprints,
  CalendarDays,
  Info,
} from 'lucide-react'

import type { SimplifiedPlan, PlanInstruction } from '@/lib/types'

interface PlanViewProps {
  plan: SimplifiedPlan
}

const ICON_MAP: Record<PlanInstruction['icon'], React.ElementType> = {
  siren: Siren,
  'phone-call': PhoneCall,
  pill: Pill,
  ban: Ban,
  walk: Footprints,
  calendar: CalendarDays,
  info: Info,
}

const SECTION_CONFIG: Array<{
  key: keyof SimplifiedPlan
  heading: string
}> = [
  { key: 'red_flags', heading: 'Red Flags' },
  { key: 'medications', heading: 'Medications' },
  { key: 'activities', heading: 'Activities' },
  { key: 'follow_up', heading: 'Follow-up' },
  { key: 'other', heading: 'Other' },
]

export function PlanView({ plan }: PlanViewProps) {
  if (!plan) return null

  const normalizeSection = (
    instructions: any,
  ): PlanInstruction[] => {
    if (!instructions) return []

    if (Array.isArray(instructions)) {
      return instructions.map((ins) =>
        typeof ins === 'string'
          ? { icon: 'info', instruction: ins }
          : (ins as PlanInstruction),
      )
    }

    // If the backend returned a plain string (e.g., for `other`)
    if (typeof instructions === 'string') {
      return [{ icon: 'info', instruction: instructions }]
    }

    // Fallback – attempt to coerce into PlanInstruction
    return [instructions as PlanInstruction]
  }

  return (
    <div className="space-y-8">
      {SECTION_CONFIG.map(({ key, heading }) => {
        const items = normalizeSection(plan[key])
        if (!items.length) return null
        return (
          <section key={key} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">{heading}</h2>
            <ul className="space-y-3">
              {items.map((item, idx) => {
                const Icon = ICON_MAP[item.icon] || Info
                return (
                  <li key={`${key}-${idx}`} className="flex items-start space-x-3">
                    <Icon className="h-6 w-6 flex-shrink-0 text-primary" />
                    <span className="text-lg text-gray-800 leading-relaxed">
                      {item.instruction}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
} 