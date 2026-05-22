DROP POLICY IF EXISTS "Guests can submit their own RSVP" ON public.wedding_rsvps;
DROP POLICY IF EXISTS "Guests can update their own RSVP" ON public.wedding_rsvps;
DROP POLICY IF EXISTS "Admin token can manage guests" ON public.wedding_guests;
DROP POLICY IF EXISTS "Admin token can manage RSVPs" ON public.wedding_rsvps;

CREATE POLICY "No direct guest table access"
ON public.wedding_guests
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No direct RSVP table access"
ON public.wedding_rsvps
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.submit_wedding_rsvp(
  _slug TEXT,
  _first_name TEXT,
  _last_name TEXT,
  _partner_first_name TEXT,
  _partner_last_name TEXT,
  _attending BOOLEAN,
  _meal_choice TEXT,
  _partner_meal_choice TEXT,
  _dietary_notes TEXT,
  _message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_guest_id UUID;
  saved_id UUID;
BEGIN
  IF now() >= TIMESTAMPTZ '2026-07-07 00:00:00+03' THEN
    RAISE EXCEPTION 'RSVP_CLOSED';
  END IF;

  SELECT id INTO found_guest_id
  FROM public.wedding_guests
  WHERE slug = _slug;

  IF found_guest_id IS NULL THEN
    RAISE EXCEPTION 'GUEST_NOT_FOUND';
  END IF;

  INSERT INTO public.wedding_rsvps (
    guest_id, first_name, last_name, partner_first_name, partner_last_name,
    attending, meal_choice, partner_meal_choice, dietary_notes, message
  ) VALUES (
    found_guest_id,
    left(trim(_first_name), 80),
    left(trim(_last_name), 80),
    nullif(left(trim(coalesce(_partner_first_name, '')), 80), ''),
    nullif(left(trim(coalesce(_partner_last_name, '')), 80), ''),
    _attending,
    nullif(left(trim(coalesce(_meal_choice, '')), 80), ''),
    nullif(left(trim(coalesce(_partner_meal_choice, '')), 80), ''),
    nullif(left(trim(coalesce(_dietary_notes, '')), 600), ''),
    nullif(left(trim(coalesce(_message, '')), 800), '')
  )
  ON CONFLICT (guest_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    partner_first_name = EXCLUDED.partner_first_name,
    partner_last_name = EXCLUDED.partner_last_name,
    attending = EXCLUDED.attending,
    meal_choice = EXCLUDED.meal_choice,
    partner_meal_choice = EXCLUDED.partner_meal_choice,
    dietary_notes = EXCLUDED.dietary_notes,
    message = EXCLUDED.message,
    updated_at = now()
  RETURNING id INTO saved_id;

  RETURN saved_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_wedding_guest(
  _token TEXT,
  _id UUID,
  _slug TEXT,
  _display_name TEXT,
  _greeting TEXT,
  _partner_name TEXT,
  _party_size INTEGER,
  _notes TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  saved_id UUID;
BEGIN
  IF NOT public.is_wedding_admin(_token) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF _id IS NULL THEN
    INSERT INTO public.wedding_guests (slug, display_name, greeting, partner_name, party_size, notes)
    VALUES (
      lower(regexp_replace(trim(_slug), '[^a-zA-Z0-9-]+', '-', 'g')),
      left(trim(_display_name), 120),
      left(trim(_greeting), 160),
      nullif(left(trim(coalesce(_partner_name, '')), 120), ''),
      greatest(1, least(2, coalesce(_party_size, 1))),
      nullif(left(trim(coalesce(_notes, '')), 400), '')
    ) RETURNING id INTO saved_id;
  ELSE
    UPDATE public.wedding_guests
    SET slug = lower(regexp_replace(trim(_slug), '[^a-zA-Z0-9-]+', '-', 'g')),
        display_name = left(trim(_display_name), 120),
        greeting = left(trim(_greeting), 160),
        partner_name = nullif(left(trim(coalesce(_partner_name, '')), 120), ''),
        party_size = greatest(1, least(2, coalesce(_party_size, 1))),
        notes = nullif(left(trim(coalesce(_notes, '')), 400), '')
    WHERE id = _id
    RETURNING id INTO saved_id;
  END IF;

  RETURN saved_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_wedding_guest(_token TEXT, _id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_wedding_admin(_token) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM public.wedding_guests WHERE id = _id;
  RETURN true;
END;
$$;