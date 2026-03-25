
CREATE TABLE public.village_officials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id uuid REFERENCES public.villages(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  designation text NOT NULL,
  age integer,
  gender text,
  education text,
  contact text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.village_officials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read village officials"
  ON public.village_officials FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert village officials"
  ON public.village_officials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
