-- Update profiles table structure for VibeTune
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS placement_test_completed BOOLEAN DEFAULT FALSE;

-- Update messages table structure
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS prosody_feedback JSONB;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS vocab_suggestions JSONB;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS guidance TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS retry_of_message_id UUID;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Update conversations table structure
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_placement_test BOOLEAN DEFAULT FALSE;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITHOUT TIME ZONE;

-- Create analytics_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID,
  event_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_events
CREATE POLICY "Users can view their own analytics" 
ON public.analytics_events 
FOR SELECT 
USING (profile_id = auth.uid());

CREATE POLICY "Users can create their own analytics" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (profile_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;