-- Test: Insert id=16 from change record
DO $$
DECLARE
  sql TEXT;
  set_clause TEXT;
  where_clause TEXT;
BEGIN
  SELECT INTO set_clause, where_clause
    string_agg(quote_ident(key), ', '),
    string_agg(format('%L', value), ', ')
  FROM jsonb_each_text(
    '{"id": "16", "name": "CDC Test v3", "email": "cdc-v3@pulsyn.io", "created_at": "2026-08-03T07:20:00+00:00"}'::jsonb
  );
  RAISE NOTICE 'cols=%, vals=%', set_clause, where_clause;
  sql := format('INSERT INTO target_users (%s) VALUES (%s) ON CONFLICT DO NOTHING', set_clause, where_clause);
  RAISE NOTICE 'sql=%', sql;
  EXECUTE sql;
  RAISE NOTICE 'done';
END $$;
