CREATE OR REPLACE FUNCTION public.create_wedding_admin_session(_password text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_token TEXT;
BEGIN
  IF _password IS DISTINCT FROM 'GretaMatas' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM public.wedding_admin_sessions WHERE expires_at <= now();
  new_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  INSERT INTO public.wedding_admin_sessions(token) VALUES (new_token);
  RETURN new_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_save_wedding_guest(_token text, _id uuid, _slug text, _display_name text, _greeting text, _partner_name text, _party_size integer, _notes text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      greatest(1, least(4, coalesce(_party_size, 1))),
      nullif(left(trim(coalesce(_notes, '')), 400), '')
    ) RETURNING id INTO saved_id;
  ELSE
    UPDATE public.wedding_guests
    SET slug = lower(regexp_replace(trim(_slug), '[^a-zA-Z0-9-]+', '-', 'g')),
        display_name = left(trim(_display_name), 120),
        greeting = left(trim(_greeting), 160),
        partner_name = nullif(left(trim(coalesce(_partner_name, '')), 120), ''),
        party_size = greatest(1, least(4, coalesce(_party_size, 1))),
        notes = nullif(left(trim(coalesce(_notes, '')), 400), '')
    WHERE id = _id
    RETURNING id INTO saved_id;
  END IF;

  RETURN saved_id;
END;
$function$;