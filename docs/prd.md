- **Version:** 1.1 (AI-Optimized)
- **Purpose:** This document provides technical specifications for an AI coding assistant to build the "Aftercare Companion" PoC application. Follow each instruction precisely.

### **1. Global Setup & Tech Stack**

1. **Frameworks:** Use Next.js, Shadcn/UI, and TailwindCSS for the frontend.
2. **Backend:** Use Supabase for the database, authentication, and backend functions.
3. **AI Services:**
    - **Text Simplification:** Use the `o3-mini` model via an OpenRouter API call.
    - **Voice AI:** Use the [Tavus.io](http://tavus.io/) API for voice interaction.
4. **UI Components:** Unless otherwise specified, use components from the Shadcn/UI library (e.g., `<Button>`, `<Card>`, `<Input>`).

### **2. Database Schema (Supabase)**

Create the following tables. All tables should include default `id` (UUID, primary key) and `created_at` (timestamp) columns.

1. **`users` Table:**
    - `email` (text)
    - `phone` (text)
    - Corresponds to Supabase Auth users.
2. **`care_plans` Table:**
    - `user_id` (foreign key to `users.id`)
    - `original_instructions` (text): The raw text pasted by the user.
    - `simplified_plan_json` (jsonb): The structured JSON output from the LLM.
    - `is_active` (boolean, default: true)
3. **`check_ins` Table:**
    - `care_plan_id` (foreign key to `care_plans.id`)
    - `pain_level` (integer, 0-10)
    - `medication_confirmed` (boolean)
    - `emotional_state` (text)
    - `red_flag_check_response` (text)
    - `conversation_transcript` (text)
4. **`unanswered_questions` Table:**
    - `care_plan_id` (foreign key to `care_plans.id`)
    - `question_text` (text): The question the user asked that the AI could not answer.

---

### **3. Feature Specifications**

### **Feature 1: User Authentication & Plan Ingestion**

**Objective:** Implement user login and the process for creating a simplified care plan from raw text.

**Implementation Steps:**

1. **Authentication UI:** Create a login page. It must contain a single input field for email or phone number and a "Send Magic Link" button.
2. **Auth Logic:** Use `supabase.auth.signInWithOtp()` to implement the magic link functionality.
3. **Plan Input UI:** After login, if no active care plan exists, present a page with a large `<Textarea>` component and a "Create Plan" button.
4. **Plan Ingestion Backend Logic:**
    - When the user submits the text, create a new row in the `care_plans` table, storing the raw text in `original_instructions`.
    - Make an API call to the LLM (`o3-mini` via OpenRouter) with the following system prompt and the user's raw text.
        - **System Prompt:** `You are an expert at simplifying medical discharge instructions for a patient with a 4th-grade reading level. Your task is to analyze the provided text and convert it into a structured JSON object. The JSON must follow this exact schema. Do not add any medical advice. Preserve all critical details like medication names, dosages, and specific warning signs. Categorize each instruction into one of the following categories: "red_flags", "medications", "activities", "follow_up", or "other".`
    - **Target JSON Schema:** The LLM output MUST be valid JSON conforming to this structure:
        
        ```json
        {
          "red_flags": [
            {"icon": "siren", "instruction": "Call 911 if you have chest pain or trouble breathing."},
            {"icon": "phone-call", "instruction": "Call your doctor if your pain gets worse suddenly."}
          ],
          "medications": [
            {"icon": "pill", "instruction": "Take Ibuprofen 400mg every 6 hours as needed for pain."}
          ],
          "activities": [
            {"icon": "ban", "instruction": "Do not lift anything heavier than a milk jug with your injured arm."},
            {"icon": "walk", "instruction": "You can go for short walks."}
          ],
          "follow_up": [
            {"icon": "calendar", "instruction": "Follow up with Dr. Smith in 2 weeks."}
          ],
          "other": [
            {"icon": "info", "instruction": "Keep your wrist splint clean and dry."}
          ]
        }
        
        ```
        
    - Save the validated JSON response to the `simplified_plan_json` column for the user's active care plan.
    - **On Success:** Redirect the user to the "Simplified Plan View".

---

### **Feature 2: Screen 1 - Simplified Plan View**

**Objective:** Display the simplified care plan in a read-only format.

**Implementation Steps:**

1. **Component:** Create a React component named `PlanView`. It receives the `simplified_plan_json` object as a prop.
2. **Rendering Logic:**
    - The view must be a single, non-collapsible list.
    - Render sections in this **exact order**: Red Flags, Medications, Activities, Follow-up, Other.
    - For each section, display a heading (e.g., "Red Flags").
    - Under each heading, map over the array of instructions for that category.
    - Each instruction item must display its corresponding icon and text. Use large, high-contrast fonts (e.g., `text-lg` or `text-xl` in TailwindCSS).
3. **Icon Mapping:** Use the `lucide-react` library. Map the `icon` string from the JSON to the corresponding `lucide-react` component.
    - `siren` -> `<Siren />`
    - `phone-call` -> `<PhoneCall />`
    - `pill` -> `<Pill />`
    - `ban` -> `<Ban />`
    - `walk` -> `<Walk />`
    - `calendar` -> `<CalendarDays />`
    - `info` -> `<Info />`

---

### **Feature 3: Screen 2 - AI Assistant View & Check-in**

**Objective:** Implement a voice-driven, scripted check-in and Q&A flow.

**Implementation Steps:**

1. **UI:** Display a prominent button with the text "Start Check-in".
2. **Scripted Check-in Flow:** When the user starts a check-in, initiate the voice AI (Tavus) and follow this script precisely. Store the entire conversation transcript.
    - **Step A (Pain):** AI says: "Hello, it's time for your check-in. On a scale of 0 to 10, how is your pain right now?"
        - Listen for a number. Save it to a new row in the `check_ins` table under `pain_level`.
    - **Step B (Meds):** AI says: "According to your plan, you've been prescribed medications. Are you taking those medications according to the instructions?"
        - Listen for a "yes" or "no" response. Save the result to the `check_ins` table as `medication_confirmed` (boolean).
    - **Step C (Emotion):** AI says: "How are you feeling emotionally today?"
        - Listen for the user's response. Save the transcribed word(s) (e.g., "good", "anxious") to the `check_ins` table as `emotional_state`.
    - **Step D (Red Flags):** AI says: "Are you experiencing any of the red flag symptoms listed in your plan?"
        - Listen for the user's response. Save the transcribed response to the `check_ins` table as `red_flag_check_response`.
3. **Gated Q&A Flow:**
    - After the script, AI asks: "Do you have any questions about your care plan?"
    - Implement a RAG (Retrieval-Augmented Generation) pattern. The knowledge base for the AI is **only** the content of the `original_instructions` object for the current user.
    - **If question is IN SCOPE:** Answer the question using the information from `original_instructions`.
    - **If question is OUT OF SCOPE:** The AI must respond with this exact phrase: "I'm sorry, I can only answer questions directly related to your discharge papers. I've made a note of your question for you to discuss with your doctor."
        - Then, add the user's transcribed question to the `unanswered_questions` table.
4. **Emergency Escape Hatch:**
    - For every user utterance during the conversation, check for the presence of the following keywords: `["chest pain", "can't breathe", "cannot breathe", "suicidal", "emergency", "911"]`.
    - If any of these keywords are detected, **immediately terminate the AI conversation**.
    - Replace the entire UI with a full-screen view containing:
        - **Header Text:** `This sounds serious.`
        - **Body Text:** `Please call 911 or your local emergency services now.`
        - **Button:** A large button with the text `CALL 911` that initiates a phone call to "911".

---

### **Feature 4: Screen 3 - Progress Summary View**

**Objective:** Create a dashboard to visualize progress and list questions for the doctor.

**Implementation Steps:**

1. **Component:** Create a React component named `SummaryView`.
2. **Pain Level Chart:**
    - Use a chart library (e.g., Recharts) to implement a Line Chart.
    - **Data Source:** Query the `check_ins` table for the current `care_plan_id`.
    - **X-Axis:** `created_at` (date of check-in).
    - **Y-Axis:** `pain_level`.
3. **Medication Compliance:**
    - Display a `<Card>` component.
    - **Logic:** Fetch all `check_ins` for the plan. Calculate the percentage of records where `medication_confirmed` is `true`.
    - **Display Text:** `Medication Compliance: [Calculated Percentage]%` (e.g., "Medication Compliance: 80%").
4. **Questions for Your Doctor:**
    - Display a section with the heading "Questions for Your Doctor".
    - **Data Source:** Query the `unanswered_questions` table for the current `care_plan_id`.
    - **Display:** Render each `question_text` as a list item.