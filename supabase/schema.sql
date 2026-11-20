
-- Caller Screen
-- Supabase database schema
-- Reference setup script based on the live project schema.
-- Run in a NEW Supabase project, not on the existing production database.

-- =========================================
-- 1. CALLS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT,
    current_stage INTEGER NOT NULL DEFAULT 1,
    last_stage_reached INTEGER NOT NULL DEFAULT 1,
    outcome TEXT,
    ai_summary TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID REFERENCES auth.users(id),

    CONSTRAINT valid_current_stage
        CHECK (current_stage >= 1 AND current_stage <= 8),

    CONSTRAINT valid_last_stage
        CHECK (last_stage_reached >= 1 AND last_stage_reached <= 8)
);

CREATE INDEX IF NOT EXISTS calls_user_id_idx
ON public.calls(user_id);


-- =========================================
-- 2. CALL STAGES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.call_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL,
    stage_number INTEGER NOT NULL,
    stage_name TEXT NOT NULL,
    result TEXT,
    prospect_words TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT call_stages_call_id_fkey
        FOREIGN KEY (call_id)
        REFERENCES public.calls(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_call_stage
        UNIQUE (call_id, stage_number),

    CONSTRAINT valid_stage_number
        CHECK (stage_number >= 1 AND stage_number <= 8)
);


-- =========================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =========================================

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_stages ENABLE ROW LEVEL SECURITY;


-- =========================================
-- 4. CALLS TABLE SECURITY POLICIES
-- =========================================

CREATE POLICY "Users can view own calls"
ON public.calls
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calls"
ON public.calls
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calls"
ON public.calls
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- =========================================
-- 5. CALL STAGES TABLE SECURITY POLICIES
-- =========================================

CREATE POLICY "Users can view own call stages"
ON public.call_stages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.calls
        WHERE calls.id = call_stages.call_id
          AND calls.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own call stages"
ON public.call_stages
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.calls
        WHERE calls.id = call_stages.call_id
          AND calls.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own call stages"
ON public.call_stages
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.calls
        WHERE calls.id = call_stages.call_id
          AND calls.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.calls
        WHERE calls.id = call_stages.call_id
          AND calls.user_id = auth.uid()
    )
);
