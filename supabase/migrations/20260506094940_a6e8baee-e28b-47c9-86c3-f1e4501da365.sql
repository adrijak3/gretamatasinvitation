CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.wedding_admin_sessions (
  token TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '8 hours')
);

CREATE TABLE public.wedding_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  greeting TEXT NOT NULL,
  partner_name TEXT,
  party_size INTEGER NOT NULL DEFAULT 1 CHECK (party_size IN (1, 2)),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.wedding_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.wedding_guests(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  partner_first_name TEXT,
  partner_last_name TEXT,
  attending BOOLEAN NOT NULL,
  meal_choice TEXT,
  partner_meal_choice TEXT,
  dietary_notes TEXT,
  message TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (guest_id)
);

CREATE OR REPLACE FUNCTION public.update_wedding_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER wedding_guests_updated_at
BEFORE UPDATE ON public.wedding_guests
FOR EACH ROW EXECUTE FUNCTION public.update_wedding_updated_at();

CREATE TRIGGER wedding_rsvps_updated_at
BEFORE UPDATE ON public.wedding_rsvps
FOR EACH ROW EXECUTE FUNCTION public.update_wedding_updated_at();

CREATE OR REPLACE FUNCTION public.is_wedding_admin(_token TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wedding_admin_sessions
    WHERE token = _token
      AND expires_at > now()
  );
$$;

CREATE OR REPLACE FUNCTION public.create_wedding_admin_session(_password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token TEXT;
BEGIN
  IF _password IS DISTINCT FROM 'MatasGreta2026' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM public.wedding_admin_sessions WHERE expires_at <= now();
  new_token := encode(gen_random_bytes(24), 'hex');
  INSERT INTO public.wedding_admin_sessions(token) VALUES (new_token);
  RETURN new_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_wedding_guest(_slug TEXT)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  display_name TEXT,
  greeting TEXT,
  partner_name TEXT,
  party_size INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.slug, g.display_name, g.greeting, g.partner_name, g.party_size
  FROM public.wedding_guests g
  WHERE g.slug = _slug;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_wedding_guests(_token TEXT)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  display_name TEXT,
  greeting TEXT,
  partner_name TEXT,
  party_size INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.slug, g.display_name, g.greeting, g.partner_name, g.party_size, g.notes, g.created_at, g.updated_at
  FROM public.wedding_guests g
  WHERE public.is_wedding_admin(_token)
  ORDER BY g.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_wedding_rsvps(_token TEXT)
RETURNS TABLE (
  id UUID,
  guest_id UUID,
  guest_display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  partner_first_name TEXT,
  partner_last_name TEXT,
  attending BOOLEAN,
  meal_choice TEXT,
  partner_meal_choice TEXT,
  dietary_notes TEXT,
  message TEXT,
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.guest_id, g.display_name, r.first_name, r.last_name, r.partner_first_name, r.partner_last_name,
         r.attending, r.meal_choice, r.partner_meal_choice, r.dietary_notes, r.message, r.submitted_at, r.updated_at
  FROM public.wedding_rsvps r
  JOIN public.wedding_guests g ON g.id = r.guest_id
  WHERE public.is_wedding_admin(_token)
  ORDER BY r.submitted_at DESC;
$$;

ALTER TABLE public.wedding_admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can submit their own RSVP"
ON public.wedding_rsvps
FOR INSERT
TO anon, authenticated
WITH CHECK (guest_id IN (SELECT id FROM public.wedding_guests));

CREATE POLICY "Guests can update their own RSVP"
ON public.wedding_rsvps
FOR UPDATE
TO anon, authenticated
USING (guest_id IN (SELECT id FROM public.wedding_guests))
WITH CHECK (guest_id IN (SELECT id FROM public.wedding_guests));

CREATE POLICY "No direct admin session access"
ON public.wedding_admin_sessions
FOR ALL
USING (false)
WITH CHECK (false);

CREATE POLICY "Admin token can manage guests"
ON public.wedding_guests
FOR ALL
TO anon, authenticated
USING (public.is_wedding_admin(current_setting('request.headers', true)::json ->> 'x-admin-token'))
WITH CHECK (public.is_wedding_admin(current_setting('request.headers', true)::json ->> 'x-admin-token'));

CREATE POLICY "Admin token can manage RSVPs"
ON public.wedding_rsvps
FOR ALL
TO anon, authenticated
USING (public.is_wedding_admin(current_setting('request.headers', true)::json ->> 'x-admin-token'))
WITH CHECK (public.is_wedding_admin(current_setting('request.headers', true)::json ->> 'x-admin-token'));

INSERT INTO public.wedding_guests (slug, display_name, greeting, party_size)
VALUES ('mieli-sveciai', 'Mieli svečiai', 'Mieli svečiai,', 2)
ON CONFLICT (slug) DO NOTHING;