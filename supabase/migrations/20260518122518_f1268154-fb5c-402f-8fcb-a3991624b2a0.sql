DO $$ BEGIN
  CREATE TYPE public.appointment_origin AS ENUM ('manual', 'site');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS origin public.appointment_origin NOT NULL DEFAULT 'manual';

ALTER TABLE public.appointments ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.services     ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.professionals ALTER COLUMN owner_id DROP NOT NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

DROP POLICY IF EXISTS "own appointments all" ON public.appointments;
DROP POLICY IF EXISTS "own services all" ON public.services;
DROP POLICY IF EXISTS "own professionals all" ON public.professionals;
DROP POLICY IF EXISTS "own profile select" ON public.profiles;
DROP POLICY IF EXISTS "own profile insert" ON public.profiles;
DROP POLICY IF EXISTS "own profile update" ON public.profiles;

CREATE POLICY "public appointments all" ON public.appointments
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public services all" ON public.services
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public professionals all" ON public.professionals
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public profiles all" ON public.profiles
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.profiles (id, salon_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Cia da Beleza')
ON CONFLICT (id) DO NOTHING;