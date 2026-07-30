-- Safe parameterized SQL execution function for Supabase client
-- Handles SELECT (cursor) and INSERT/UPDATE/DELETE...RETURNING (INTO) separately
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
  upper_sql TEXT;
  is_dml BOOLEAN;
BEGIN
  upper_sql := UPPER(TRIM(sql));
  is_dml := upper_sql LIKE 'INSERT %' OR upper_sql LIKE 'UPDATE %' OR upper_sql LIKE 'DELETE %';

  IF is_dml AND upper_sql LIKE '%RETURNING%' THEN
    -- DML with RETURNING: use EXECUTE INTO
    IF param_count = 0 THEN EXECUTE sql INTO rec;
    ELSIF param_count = 1 THEN EXECUTE sql INTO rec USING params[1];
    ELSIF param_count = 2 THEN EXECUTE sql INTO rec USING params[1], params[2];
    ELSIF param_count = 3 THEN EXECUTE sql INTO rec USING params[1], params[2], params[3];
    ELSIF param_count = 4 THEN EXECUTE sql INTO rec USING params[1], params[2], params[3], params[4];
    ELSIF param_count = 5 THEN EXECUTE sql INTO rec USING params[1], params[2], params[3], params[4], params[5];
    ELSIF param_count = 6 THEN EXECUTE sql INTO rec USING params[1], params[2], params[3], params[4], params[5], params[6];
    ELSIF param_count = 7 THEN EXECUTE sql INTO rec USING params[1], params[2], params[3], params[4], params[5], params[6], params[7];
    ELSIF param_count = 8 THEN EXECUTE sql INTO rec USING params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8];
    ELSIF param_count = 9 THEN EXECUTE sql INTO rec USING params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9];
    ELSIF param_count >= 10 THEN EXECUTE sql INTO rec USING params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9], params[10];
    END IF;
    IF rec IS NOT NULL THEN
      result := jsonb_build_array(to_jsonb(rec));
    END IF;
  ELSIF is_dml THEN
    -- DML without RETURNING: just execute, return empty array
    IF param_count = 0 THEN EXECUTE sql;
    ELSIF param_count = 1 THEN EXECUTE sql USING params[1];
    ELSIF param_count = 2 THEN EXECUTE sql USING params[1], params[2];
    ELSIF param_count = 3 THEN EXECUTE sql USING params[1], params[2], params[3];
    ELSIF param_count = 4 THEN EXECUTE sql USING params[1], params[2], params[3], params[4];
    ELSIF param_count >= 5 THEN EXECUTE sql USING params[1], params[2], params[3], params[4], params[5];
    END IF;
  ELSE
    -- SELECT: use cursor loop
    IF param_count = 0 THEN
      FOR rec IN EXECUTE sql LOOP result := result || to_jsonb(rec); END LOOP;
    ELSIF param_count = 1 THEN
      FOR rec IN EXECUTE sql USING params[1] LOOP result := result || to_jsonb(rec); END LOOP;
    ELSIF param_count = 2 THEN
      FOR rec IN EXECUTE sql USING params[1], params[2] LOOP result := result || to_jsonb(rec); END LOOP;
    ELSIF param_count = 3 THEN
      FOR rec IN EXECUTE sql USING params[1], params[2], params[3] LOOP result := result || to_jsonb(rec); END LOOP;
    ELSIF param_count = 4 THEN
      FOR rec IN EXECUTE sql USING params[1], params[2], params[3], params[4] LOOP result := result || to_jsonb(rec); END LOOP;
    ELSIF param_count = 5 THEN
      FOR rec IN EXECUTE sql USING params[1], params[2], params[3], params[4], params[5] LOOP result := result || to_jsonb(rec); END LOOP;
    ELSIF param_count = 6 THEN
      FOR rec IN EXECUTE sql USING params[1], params[2], params[3], params[4], params[5], params[6] LOOP result := result || to_jsonb(rec); END LOOP;
    ELSIF param_count >= 7 THEN
      FOR rec IN EXECUTE sql USING params[1], params[2], params[3], params[4], params[5], params[6], params[7] LOOP result := result || to_jsonb(rec); END LOOP;
    END IF;
  END IF;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION _pulsyn_exec(TEXT, TEXT[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION _pulsyn_exec(TEXT, TEXT[]) FROM anon;
REVOKE EXECUTE ON FUNCTION _pulsyn_exec(TEXT, TEXT[]) FROM authenticated;
