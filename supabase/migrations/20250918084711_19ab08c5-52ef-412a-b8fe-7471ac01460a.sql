-- Fix security issues: Add missing RLS policies for analytics_events

-- Add missing UPDATE policy for analytics_events
CREATE POLICY "Users can update their own analytics" 
ON public.analytics_events 
FOR UPDATE 
USING (profile_id = auth.uid());

-- Add missing DELETE policy for analytics_events  
CREATE POLICY "Users can delete their own analytics" 
ON public.analytics_events 
FOR DELETE 
USING (profile_id = auth.uid());