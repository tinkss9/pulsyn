CREATE OR REPLACE FUNCTION _pulsyn_exec_v2(sql TEXT, params JSONB DEFAULT '[]'::JSONB)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '[]'::JSONB;
  rec RECORD;
  param_count INT;
  param_values TEXT[];
BEGIN
  -- Convert JSONB array to TEXT array
  SELECT array_agg(value::TEXT) INTO param_values FROM jsonb_array_elements(params);
  param_count := COALESCE(array_length(param_values, 1), 0);

  IF param_count = 0 THEN
    FOR rec IN EXECUTE sql LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 1 THEN
    FOR rec IN EXECUTE sql USING param_values[1] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 2 THEN
    FOR rec IN EXECUTE sql USING param_values[1], param_values[2] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 3 THEN
    FOR rec IN EXECUTE sql USING param_values[1], param_values[2], param_values[3] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 4 THEN
    FOR rec IN EXECUTE sql USING param_values[1], param_values[2], param_values[3], param_values[4] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 5 THEN
    FOR rec IN EXECUTE sql USING param_values[1], param_values[2], param_values[3], param_values[4], param_values[5] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count = 6 THEN
    FOR rec IN EXECUTE sql USING param_values[1], param_values[2], param_values[3], param_values[4], param_values[5], param_values[6] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  ELSIF param_count >= 7 THEN
    FOR rec IN EXECUTE sql USING param_values[1], param_values[2], param_values[3], param_values[4], param_values[5], param_values[6], param_values[7] LOOP
      result := result || to_jsonb(rec);
    END LOOP;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
