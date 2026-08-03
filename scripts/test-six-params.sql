CREATE OR REPLACE FUNCTION test_six_params()
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  EXECUTE 'SELECT $1 || $2 || $3 || $4 || $5 || $6'
  INTO result
  USING 'a', 'b', 'c', 'd', 'e', 'f';
  RETURN result;
END;
$$ LANGUAGE plpgsql;

SELECT test_six_params();
