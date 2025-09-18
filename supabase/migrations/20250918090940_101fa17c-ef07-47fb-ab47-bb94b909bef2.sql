-- Fix the kv_store table RLS issue by adding a policy
CREATE POLICY "Allow anonymous access to kv_store"
  ON public.kv_store_b2083953
  FOR ALL
  USING (true)
  WITH CHECK (true);