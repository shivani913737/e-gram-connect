
-- Drop overly permissive policies
DROP POLICY "Authenticated users can insert villages" ON public.villages;
DROP POLICY "Authenticated users can update villages" ON public.villages;

-- More restrictive policies
CREATE POLICY "Authenticated users can insert villages" ON public.villages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update villages" ON public.villages
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
