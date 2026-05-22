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
  new_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  INSERT INTO public.wedding_admin_sessions(token) VALUES (new_token);
  RETURN new_token;
END;
$$;