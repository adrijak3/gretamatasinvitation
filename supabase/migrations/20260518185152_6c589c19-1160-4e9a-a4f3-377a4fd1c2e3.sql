CREATE OR REPLACE FUNCTION public.submit_public_wedding_rsvp(
  _slug text,
  _display_name text,
  _greeting text,
  _party_size integer,
  _first_name text,
  _last_name text,
  _partner_first_name text,
  _partner_last_name text,
  _attending boolean,
  _meal_choice text,
  _partner_meal_choice text,
  _dietary_notes text,
  _message text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  found_guest_id UUID;
  clean_slug TEXT;
  saved_id UUID;
BEGIN
  IF now() >= TIMESTAMPTZ '2026-07-07 00:00:00+03' THEN
    RAISE EXCEPTION 'RSVP_CLOSED';
  END IF;

  clean_slug := lower(regexp_replace(coalesce(trim(_slug), ''), '[^a-zA-Z0-9-]+', '-', 'g'));
  IF clean_slug = '' OR clean_slug IS NULL THEN
    clean_slug := 'sveciai-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  END IF;

  SELECT id INTO found_guest_id FROM public.wedding_guests WHERE slug = clean_slug;

  IF found_guest_id IS NULL THEN
    INSERT INTO public.wedding_guests (slug, display_name, greeting, party_size)
    VALUES (
      clean_slug,
      left(trim(coalesce(nullif(_display_name, ''), 'Svečias')), 120),
      left(trim(coalesce(nullif(_greeting, ''), 'Mieli svečiai,')), 160),
      greatest(1, least(4, coalesce(_party_size, 1)))
    )
    RETURNING id INTO found_guest_id;
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