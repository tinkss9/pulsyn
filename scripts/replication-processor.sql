-- Replication processor function
-- Reads unprocessed changes from _pulsyn_changes and applies to target tables
CREATE OR REPLACE FUNCTION process_pulsyn_changes()
RETURNS TABLE(processed_count BIGINT, error_count BIGINT) AS $$
DECLARE
  change_rec RECORD;
  proc_count BIGINT := 0;
  err_count BIGINT := 0;
BEGIN
  FOR change_rec IN
    SELECT c.id, c.table_name, c.operation, c.row_data, c.old_data
    FROM _pulsyn_changes c
    WHERE c.processed = FALSE
    ORDER BY c.id ASC
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
      UPDATE _pulsyn_changes SET processed = TRUE WHERE _pulsyn_changes.id = change_rec.id;
      proc_count := proc_count + 1;

    EXCEPTION WHEN OTHERS THEN
      err_count := err_count + 1;
      RAISE NOTICE 'Error processing change %: %', change_rec.id, SQLERRM;
    END;
  END LOOP;

  RETURN QUERY SELECT proc_count, err_count;
END;
$$ LANGUAGE plpgsql;
