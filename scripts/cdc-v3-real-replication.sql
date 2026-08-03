-- Pulsyn CDC v3 — Real Replication
-- Generic change capture and replication for any pipeline
-- Run: supabase db query --linked --file scripts/cdc-v3-real-replication.sql

-- Add pipeline_id to _pulsyn_changes if missing
ALTER TABLE _pulsyn_changes ADD COLUMN IF NOT EXISTS pipeline_id TEXT;

-- Index for pipeline-based queries
CREATE INDEX IF NOT EXISTS idx_changes_pipeline_id ON _pulsyn_changes(pipeline_id);

-- Generic trigger function that captures changes with pipeline context
CREATE OR REPLACE FUNCTION _pulsyn_capture_changes()
RETURNS TRIGGER AS $$
DECLARE
  pipeline_rec RECORD;
  source_table TEXT;
BEGIN
  source_table := TG_TABLE_NAME;

  -- Find pipelines that include this source table
  FOR pipeline_rec IN
    SELECT id, source, target, tables
    FROM pipelines
    WHERE status = 'running'
      AND source IS NOT NULL
  LOOP
    -- Check if this table is in the pipeline's table list
    IF pipeline_rec.tables IS NULL
       OR jsonb_array_length(pipeline_rec.tables) = 0
       OR pipeline_rec.tables ? source_table
       OR pipeline_rec.tables @> ('["' || source_table || '"]')::jsonb
    THEN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO _pulsyn_changes (table_name, operation, row_data, pipeline_id)
        VALUES (source_table, 'INSERT', to_jsonb(NEW), pipeline_rec.id);
      ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO _pulsyn_changes (table_name, operation, row_data, old_data, pipeline_id)
        VALUES (source_table, 'UPDATE', to_jsonb(NEW), to_jsonb(OLD), pipeline_rec.id);
      ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO _pulsyn_changes (table_name, operation, row_data, old_data, pipeline_id)
        VALUES (source_table, 'DELETE', to_jsonb(OLD), to_jsonb(OLD), pipeline_rec.id);
      END IF;
    END IF;
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable CDC on a source table (idempotent)
CREATE OR REPLACE FUNCTION enable_cdc_on_table(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  -- Drop existing trigger if any
  EXECUTE format('DROP TRIGGER IF EXISTS _pulsyn_cdc_trigger ON %I', table_name);

  -- Create trigger
  EXECUTE format(
    'CREATE TRIGGER _pulsyn_cdc_trigger
     AFTER INSERT OR UPDATE OR DELETE ON %I
     FOR EACH ROW EXECUTE FUNCTION _pulsyn_capture_changes()',
    table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disable CDC on a source table
CREATE OR REPLACE FUNCTION disable_cdc_on_table(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('DROP TRIGGER IF EXISTS _pulsyn_cdc_trigger ON %I', table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic replication processor (reads pipeline config dynamically)
CREATE OR REPLACE FUNCTION process_pulsyn_changes()
RETURNS TABLE(processed_count BIGINT, error_count BIGINT, skipped_count BIGINT, error_details JSONB) AS $$
DECLARE
  change_rec RECORD;
  pipeline_rec RECORD;
  target_table TEXT;
  proc_count BIGINT := 0;
  err_count BIGINT := 0;
  skip_count BIGINT := 0;
  err_details JSONB := '[]'::JSONB;
  err_msg TEXT;
  col TEXT;
  val TEXT;
  set_clause TEXT;
  where_clause TEXT;
  columns TEXT[];
  values TEXT[];
  pk_col TEXT := 'id';
BEGIN
  FOR change_rec IN
    SELECT c.id, c.table_name, c.operation, c.row_data, c.old_data,
           c.pipeline_id, c.retry_count, c.max_retries
    FROM _pulsyn_changes c
    WHERE c.processed = FALSE
      AND c.retry_count < c.max_retries
    ORDER BY c.id ASC
    LIMIT 100
  LOOP
    BEGIN
      -- Get pipeline config for target table mapping
      IF change_rec.pipeline_id IS NOT NULL THEN
        SELECT * INTO pipeline_rec FROM pipelines WHERE id = change_rec.pipeline_id;
        IF FOUND AND pipeline_rec.target IS NOT NULL THEN
          -- Use same table name for target (can be customized via config)
          target_table := change_rec.table_name;
        ELSE
          target_table := change_rec.table_name;
        END IF;
      ELSE
        target_table := change_rec.table_name;
      END IF;

      -- Apply the change
      CASE change_rec.operation
        WHEN 'INSERT' THEN
          -- Build dynamic INSERT
          columns := ARRAY(SELECT jsonb_object_keys(change_rec.row_data));
          values := ARRAY(SELECT change_rec.row_data->>col FROM unnest(columns) AS col);

          EXECUTE format(
            'INSERT INTO %I (%s) VALUES (%s) ON CONFLICT DO NOTHING',
            target_table,
            array_to_string(ARRAY(SELECT format('%I', c) FROM unnest(columns) AS c), ', '),
            array_to_string(ARRAY(SELECT format('%L', v) FROM unnest(values) AS v), ', ')
          );

        WHEN 'UPDATE' THEN
          -- Build dynamic UPDATE
          IF change_rec.old_data IS NOT NULL THEN
            set_clause := '';
            where_clause := '';

            FOR col IN SELECT jsonb_object_keys(change_rec.row_data)
            LOOP
              val := change_rec.row_data->>col;
              IF col = pk_col THEN
                where_clause := format('%I = %L', col, val);
              ELSE
                IF set_clause != '' THEN set_clause := set_clause || ', '; END IF;
                set_clause := set_clause || format('%I = %L', col, val);
              END IF;
            END LOOP;

            IF where_clause = '' THEN
              -- Fallback: use first key as PK
              col := (SELECT jsonb_object_keys(change_rec.old_data) LIMIT 1);
              where_clause := format('%I = %L', col, change_rec.old_data->>col);
            END IF;

            IF set_clause != '' THEN
              EXECUTE format('UPDATE %I SET %s WHERE %s', target_table, set_clause, where_clause);
            END IF;
          END IF;

        WHEN 'DELETE' THEN
          -- Build dynamic DELETE
          IF change_rec.old_data IS NOT NULL THEN
            col := pk_col;
            val := change_rec.old_data->>col;
            IF val IS NULL THEN
              col := (SELECT jsonb_object_keys(change_rec.old_data) LIMIT 1);
              val := change_rec.old_data->>col;
            END IF;
            EXECUTE format('DELETE FROM %I WHERE %I = %L', target_table, col, val);
          END IF;
      END CASE;

      -- Mark processed
      UPDATE _pulsyn_changes
      SET processed = TRUE, error_message = NULL, failed_at = NULL
      WHERE _pulsyn_changes.id = change_rec.id;

      proc_count := proc_count + 1;

    EXCEPTION WHEN OTHERS THEN
      err_msg := SQLERRM;
      err_count := err_count + 1;

      UPDATE _pulsyn_changes
      SET retry_count = retry_count + 1,
          error_message = err_msg,
          failed_at = NOW()
      WHERE _pulsyn_changes.id = change_rec.id;

      INSERT INTO _pulsyn_errors (change_id, error_message, error_detail, retry_count)
      VALUES (change_rec.id, err_msg, SQLSTATE, change_rec.retry_count + 1);

      err_details := err_details || jsonb_build_object(
        'change_id', change_rec.id,
        'table', change_rec.table_name,
        'operation', change_rec.operation,
        'error', err_msg
      );
    END;
  END LOOP;

  SELECT COUNT(*) INTO skip_count
  FROM _pulsyn_changes
  WHERE processed = FALSE AND retry_count >= max_retries;

  RETURN QUERY SELECT proc_count, err_count, skip_count, err_details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get CDC stats for a pipeline
CREATE OR REPLACE FUNCTION get_cdc_stats(p_pipeline_id TEXT)
RETURNS TABLE(
  pending_changes BIGINT,
  processed_changes BIGINT,
  failed_changes BIGINT,
  total_changes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM _pulsyn_changes WHERE pipeline_id = p_pipeline_id AND processed = FALSE AND retry_count < max_retries),
    (SELECT COUNT(*) FROM _pulsyn_changes WHERE pipeline_id = p_pipeline_id AND processed = TRUE),
    (SELECT COUNT(*) FROM _pulsyn_changes WHERE pipeline_id = p_pipeline_id AND processed = FALSE AND retry_count >= max_retries),
    (SELECT COUNT(*) FROM _pulsyn_changes WHERE pipeline_id = p_pipeline_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
