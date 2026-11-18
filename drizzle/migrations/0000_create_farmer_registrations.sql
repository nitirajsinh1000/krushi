CREATE TABLE public.farmer_registrations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
 mobile text NOT NULL CHECK (mobile ~ '^\+?[0-9 ()-]{7,20}$'),
 question text NOT NULL DEFAULT '' CHECK (char_length(question) <= 2000),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.farmer_registrations TO anon;
GRANT ALL ON public.farmer_registrations TO service_role;
ALTER TABLE public.farmer_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can submit registrations only" ON public.farmer_registrations FOR INSERT TO anon WITH CHECK (true);