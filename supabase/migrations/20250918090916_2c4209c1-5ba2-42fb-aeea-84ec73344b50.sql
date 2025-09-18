-- Add missing INSERT policy for profiles table so the trigger can create profiles
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Fix the kv_store table RLS issue
CREATE POLICY "Allow anonymous access to kv_store"
  ON public.kv_store_b2083953
  FOR ALL
  USING (true)
  WITH CHECK (true);