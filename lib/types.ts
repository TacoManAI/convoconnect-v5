// Database types based on the schema
export interface User {
  id: string
  email?: string
  phone?: string
}

export interface CarePlan {
  id: string
  created_at: string
  user_id: string
  original_instructions: string
  simplified_plan_json?: SimplifiedPlan
  is_active: boolean
}

export interface CheckIn {
  id: string
  created_at: string
  care_plan_id: string
  pain_level?: number
  medication_confirmed?: boolean
  emotional_state?: string
  red_flag_check_response?: string
  conversation_transcript?: string
}

export interface UnansweredQuestion {
  id: string
  created_at: string
  care_plan_id: string
  question_text: string
}

// Simplified plan structure as defined in the PRD
export interface SimplifiedPlan {
  red_flags: PlanInstruction[]
  medications: PlanInstruction[]
  activities: PlanInstruction[]
  follow_up: PlanInstruction[]
  other: PlanInstruction[]
}

export interface PlanInstruction {
  icon: 'siren' | 'phone-call' | 'pill' | 'ban' | 'walk' | 'calendar' | 'info'
  instruction: string
}