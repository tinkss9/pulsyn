-- Replication processor function
-- Reads unprocessed changes from _pulsyn_changes and applies to target tables
CREATE OR REPLACE FUNCTION process_pulsyn_changes()
RETURNS TABLE(processed_count BIGINT, error_count BIGINT) AS $$
DECLARE
  change_rec RECORD;
  processed BIGINT := 0;
  errors BIGINT := 0;
  sql_text TEXT;
  col_names TEXT[];
  col_values TEXT[];
  set_clause TEXT;
  where_clause TEXT;
  key_col TEXT;
BEGIN
  FOR change_rec IN
    SELECT id, table_name, operation, row_data, old_data
    FROM _pulsyn_changes
    WHERE processed = FALSE
    ORDER BY id ASC
    LIMIT 100
  LOOP
    BEGIN
      -- Map source table to target table
      IF change_rec.table_name = 'source_users' THEN
        CASE change_rec.operation
          WHEN 'INSERT' THEN
            INSERT INTO target_users (id, name, email, created_at)
            VALUES (
              (change_rec.row_data->>'id')::INT,
              change_rec.row_data->>'name',
              change_rec.row_data->>'email',
              (change_rec.row_data->>'created_at')::TIMESTAMPTZ
            )
            ON CONFLICT (id) DO NOTHING;

          WHEN 'UPDATE' THEN
            UPDATE target_users
            SET name = change_rec.row_data->>'name',
                email = change_rec.row_data->>'email',
                created_at = (change_rec.row_data->>'created_at')::TIMESTAMPTZ
            WHERE id = (change_rec.row_data->>'id')::INT;

          WHEN 'DELETE' THEN
            DELETE FROM target_users
            WHERE id = (change_rec.row_data->>'id')::INT;
        END CASE;
      END IF;

      -- Mark as processed
      UPDATE _pulsyn_changes SET processed = TRUE WHERE id = change_rec.id;
      processed := processed + 1;

    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      -- Log error but continue processing
      RAISE NOTICE 'Error processing change %: %', change_rec.id, SQLERRM;
    END;
  END LOOP;

  RETURN QUERY SELECT processed, errors;
END;
$$ LANGUAGE plpgsql;
