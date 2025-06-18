# Aftercare Companion - Development Tasks

## Phase 1: Project Foundation & Setup

### Task 1.1: Initialize Next.js Project
- [x] Create new Next.js project with TypeScript
- [x] Configure Tailwind CSS
- [x] Install and configure Shadcn/UI
- [x] Install lucide-react for icons
- [x] Set up basic project structure

### Task 1.2: Supabase Setup
- [x] Create Supabase project
- [x] Configure environment variables (.env.local)
- [x] Set up Supabase client configuration
- [x] Test connection to Supabase

## Phase 2: Database Schema & Authentication

### Task 2.1: Database Schema Creation
- [x] Create `users` table with email, phone fields
- [x] Create `care_plans` table with user_id, original_instructions, simplified_plan_json, is_active
- [x] Create `check_ins` table with care_plan_id, pain_level, medication_confirmed, emotional_state, red_flag_check_response, conversation_transcript
- [x] Create `unanswered_questions` table with care_plan_id, question_text
- [x] Set up Row Level Security (RLS) policies for all tables

### Task 2.2: Authentication System
- [x] Create login page UI with email/phone input and "Send Magic Link" button
- [x] Implement magic link authentication using supabase.auth.signInWithOtp()
- [x] Create auth callback handler
- [x] Set up protected route middleware
- [x] Test authentication flow

### Task 2.3: Authentication Testing ✅
- [x] Resolve authentication testing issues preventing full end-to-end testing
- [x] Investigate magic link email delivery in development environment
- [x] Test complete authentication flow from login to dashboard
- [x] Verify user creation and session persistence
- [x] Document authentication testing procedures

## Phase 3: Core Features - Plan Management

### Task 3.1: Plan Input Interface
- [ ] Create plan input page with large textarea
- [ ] Add "Create Plan" button
- [ ] Implement form validation
- [ ] Add loading states and error handling

### Task 3.2: AI Text Simplification Backend
- [ ] Create Supabase Edge Function for plan ingestion
- [ ] Integrate OpenRouter API with o3-mini model
- [ ] Implement system prompt for medical text simplification
- [ ] Add JSON validation for LLM response
- [ ] Store original and simplified plans in database
- [ ] Test with sample medical discharge instructions

### Task 3.3: Simplified Plan View (Screen 1)
- [ ] Create PlanView component
- [ ] Implement icon mapping for lucide-react icons (siren, phone-call, pill, ban, walk, calendar, info)
- [ ] Design responsive layout with large, high-contrast fonts
- [ ] Render sections in order: Red Flags, Medications, Activities, Follow-up, Other
- [ ] Create plan display page
- [ ] Test with various plan structures

## Phase 4: AI Assistant & Voice Integration

### Task 4.1: Voice AI Setup
- [ ] Research and integrate Tavus.io API
- [ ] Create Supabase Edge Function for voice interaction
- [ ] Set up audio input/output handling
- [ ] Test basic voice conversation flow

### Task 4.2: Scripted Check-in Flow
- [ ] Implement "Start Check-in" button and UI
- [ ] Create scripted conversation flow:
  - [ ] Pain level assessment (0-10 scale)
  - [ ] Medication confirmation (yes/no)
  - [ ] Emotional state inquiry
  - [ ] Red flag symptoms check
- [ ] Store check-in responses in database
- [ ] Save conversation transcripts

### Task 4.3: Q&A System with RAG
- [ ] Implement RAG pattern using original_instructions as knowledge base
- [ ] Create in-scope vs out-of-scope question detection
- [ ] Handle out-of-scope questions with specific response
- [ ] Store unanswered questions in database
- [ ] Test Q&A accuracy and scope detection

### Task 4.4: Emergency Escape Hatch
- [ ] Implement keyword detection for emergency terms
- [ ] Create emergency UI overlay
- [ ] Add "CALL 911" button with phone call functionality
- [ ] Test emergency detection and response

## Phase 5: Progress Tracking & Analytics

### Task 5.1: Progress Summary Dashboard
- [ ] Install and configure Recharts library
- [ ] Create SummaryView component
- [ ] Implement pain level line chart
- [ ] Calculate and display medication compliance percentage
- [ ] Display unanswered questions list
- [ ] Create summary page

### Task 5.2: Data Visualization
- [ ] Design responsive chart layouts
- [ ] Add date range filtering
- [ ] Implement data aggregation logic
- [ ] Add loading states for charts
- [ ] Test with sample check-in data

## Phase 6: UI/UX Polish & Testing

### Task 6.1: Design System Implementation
- [ ] Create consistent color scheme and typography
- [ ] Implement responsive design for all screens
- [ ] Add loading states and error handling throughout
- [ ] Ensure accessibility compliance
- [ ] Add smooth transitions and micro-interactions

### Task 6.2: Navigation & User Flow
- [ ] Implement navigation between screens
- [ ] Add breadcrumbs or progress indicators
- [ ] Handle edge cases (no active plan, no check-ins, etc.)
- [ ] Test complete user journey

### Task 6.3: Error Handling & Validation
- [ ] Add comprehensive error handling for API calls
- [ ] Implement form validation throughout
- [ ] Add user feedback for all actions
- [ ] Test error scenarios

## Phase 7: Integration Testing & Deployment

### Task 7.1: End-to-End Testing
- [ ] Test complete user flow from registration to summary
- [ ] Verify AI integrations work correctly
- [ ] Test emergency scenarios
- [ ] Validate data persistence and retrieval

### Task 7.2: Performance & Security
- [ ] Optimize API calls and database queries
- [ ] Implement proper error logging
- [ ] Review and test RLS policies
- [ ] Ensure sensitive data protection

### Task 7.3: Deployment Preparation
- [ ] Configure production environment variables
- [ ] Set up deployment pipeline
- [ ] Test in production-like environment
- [ ] Create deployment documentation

---

## Current Blockers

### ⚠️ Authentication Testing Issues
**Status:** Active Blocker  
**Impact:** Prevents full end-to-end testing of authentication flow  
**Description:** While authentication system is implemented, testing is currently blocked due to issues with magic link email delivery and/or session verification in the development environment.

**Next Steps:**
1. Investigate email delivery configuration
2. Test authentication flow thoroughly
3. Verify user creation and session persistence
4. Document proper testing procedures

---

## Development Notes

### Key Dependencies
- Next.js (React framework)
- Supabase (Backend/Database)
- Shadcn/UI (UI components)
- TailwindCSS (Styling)
- Lucide React (Icons)
- Recharts (Data visualization)
- OpenRouter API (AI text processing)
- Tavus.io API (Voice AI)

### Critical Requirements
- All medical information must be handled securely
- Emergency detection must be reliable and immediate
- Voice AI must follow exact scripted flow
- JSON schema validation is mandatory for LLM responses
- RLS must be properly configured for data security

### Success Criteria
- Users can successfully create simplified care plans from discharge instructions
- Voice check-ins work reliably and store data correctly
- Emergency detection triggers appropriate response
- Progress tracking provides meaningful insights
- Application is responsive and accessible