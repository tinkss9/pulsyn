-- Add error tracking columns to _pulsyn_changes
ALTER TABLE _pulsyn_changes ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0;
ALTER TABLE _pulsyn_changes ADD COLUMN IF NOT EXISTS max_retries INT DEFAULT 3;
ALTER TABLE _pulsyn_changes ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE _pulsyn_changes ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ;

-- Error log table for detailed error tracking
CREATE TABLE IF NOT EXISTS _pulsyn_errors (
  id SERIAL PRIMARY KEY,
  change_id BIGINT REFERENCES _pulsyn_changes(id),
  error_message TEXT NOT NULL,
  error_detail TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pulsyn_errors_change ON _pulsyn_errors(change_id);

-- Updated replication processor with retry logic and error tracking
CREATE OR REPLACE FUNCTION process_pulsyn_changes()
RETURNS TABLE(processed_count BIGINT, error_count BIGINT, skipped_count BIGINT, error_details JSONB) AS $$
DECLARE
  change_rec RECORD;
  proc_count BIGINT := 0;
  err_count BIGINT := 0;
  skip_count BIGINT := 0;
  err_details JSONB := '[]'::JSONB;
  err_msg TEXT;
BEGIN
  FOR change_rec IN
    SELECT c.id, c.table_name, c.operation, c.row_data, c.old_data, c.retry_count, c.max_retries
    FROM _pulsyn_changes c
    WHERE c.processed = FALSE
      AND c.retry_count < c.max_retries
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

      -- Mark as processed, clear error state
      UPDATE _pulsyn_changes
      SET processed = TRUE,
          error_message = NULL,
          failed_at = NULL
      WHERE _pulsyn_changes.id = change_rec.id;

      proc_count := proc_count + 1;

    EXCEPTION WHEN OTHERS THEN
      err_msg := SQLERRM;
      err_count := err_count + 1;

      -- Update retry count and error message
      UPDATE _pulsyn_changes
      SET retry_count = retry_count + 1,
          error_message = err_msg,
          failed_at = NOW()
      WHERE _pulsyn_changes.id = change_rec.id;

      -- Log detailed error
      INSERT INTO _pulsyn_errors (change_id, error_message, error_detail, retry_count)
      VALUES (change_rec.id, err_msg, SQLSTATE, change_rec.retry_count + 1);

      -- Add to error details output
      err_details := err_details || jsonb_build_object(
        'change_id', change_rec.id,
        'table', change_rec.table_name,
        'operation', change_rec.operation,
        'error', err_msg,
        'retry_count', change_rec.retry_count + 1,
        'max_retries', change_rec.max_retries
      );
    END;
  END LOOP;

  -- Count skipped changes (max retries exceeded)
  SELECT COUNT(*) INTO skip_count
  FROM _pulsyn_changes
  WHERE processed = FALSE AND retry_count >= max_retries;

  RETURN QUERY SELECT proc_count, err_count, skip_count, err_details;
END;
$$ LANGUAGE plpgsql;

-- Function to reset failed changes for retry
CREATE OR REPLACE FUNCTION reset_failed_changes()
RETURNS BIGINT AS $$
DECLARE
  reset_count BIGINT;
BEGIN
  UPDATE _pulsyn_changes
  SET retry_count = 0,
      error_message = NULL,
      failed_at = NULL
  WHERE processed = FALSE
    AND retry_count >= max_retries;

  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RETURN reset_count;
END;
$$ LANGUAGE plpgsql;

-- View for failed changes (easy debugging)
CREATE OR REPLACE VIEW v_pulsyn_failed_changes AS
SELECT
  c.id,
  c.table_name,
  c.operation,
  c.row_data,
  c.retry_count,
  c.max_retries,
  c.error_message,
  c.failed_at,
  c.changed_at,
  (SELECT COUNT(*) FROM _pulsyn_errors e WHERE e.change_id = c.id) as error_log_count
FROM _pulsyn_changes c
WHERE c.processed = FALSE
  AND c.retry_count >= c.max_retries
ORDER BY c.id;
