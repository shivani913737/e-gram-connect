
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Regions table (state > district > block > village hierarchy)
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  block TEXT NOT NULL,
  village TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read regions" ON public.regions
  FOR SELECT USING (true);

-- Villages table
CREATE TABLE public.villages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  block TEXT NOT NULL,
  population INTEGER DEFAULT 0,
  area_sq_km NUMERIC DEFAULT 0,
  water_sources INTEGER DEFAULT 0,
  schools INTEGER DEFAULT 0,
  health_centers INTEGER DEFAULT 0,
  roads_km NUMERIC DEFAULT 0,
  electricity_coverage NUMERIC DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read villages" ON public.villages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert villages" ON public.villages
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update villages" ON public.villages
  FOR UPDATE TO authenticated USING (true);

-- Audit records table
CREATE TABLE public.audit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id UUID REFERENCES public.villages(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read audit records" ON public.audit_records
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert audit records" ON public.audit_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = recorded_by);
