-- Safe parameterized SQL execution function for Supabase client
-- Returns results as a JSONB array of row objects
-- Handles SELECT, INSERT...RETURNING, UPDATE...RETURNING, DELETE...RETURNING
CREATE OR REPLACE FUNCTION _pulsyn_exec(sql TEXT, params TEXT[] DEFAULT '{}')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  result JSONB := '[]'::JSONB;
  param_count INT := COALESCE(array_length(params, 1), 0);
BEGIN
  IF param_count = 0 THEN
    FOR rec IN EXECUTE sql LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 1 THEN
    FOR rec IN EXECUTE sql USING params[1] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 2 THEN
    FOR rec IN EXECUTE sql USING params[1], params[2] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 3 THEN
    FOR rec IN EXECUTE sql USING params[1], params[2], params[3] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 4 THEN
    FOR rec IN EXECUTE sql USING params[1], params[2], params[3], params[4] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 5 THEN
    FOR rec IN EXECUTE sql USING params[1], params[2], params[3], params[4], params[5] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 6 THEN
    FOR rec IN EXECUTE sql USING params[1], params[2], params[3], params[4], params[5], params[6] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 7 THEN
    FOR rec IN EXECUTE sql USING params[1], params[2], params[3], params[4], params[5], params[6], params[7] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 8 THEN
    FOR rec IN EXECUTE sql USING params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 9 THEN
    FOR rec IN EXECUTE sql USING params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count >= 10 THEN
    FOR rec IN EXECUTE sql USING params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9], params[10] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  END IF;

  RETURN result;
END;
$$;

-- Revoke public access — only service_role can call
REVOKE EXECUTE ON FUNCTION _pulsyn_exec(TEXT, TEXT[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION _pulsyn_exec(TEXT, TEXT[]) FROM anon;
REVOKE EXECUTE ON FUNCTION _pulsyn_exec(TEXT, TEXT[]) FROM authenticated;
