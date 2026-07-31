CREATE OR REPLACE FUNCTION _pulsyn_capture_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO _pulsyn_changes (table_name, operation, row_data)
        VALUES (TG_TABLE_NAME, 'DELETE', row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO _pulsyn_changes (table_name, operation, row_data, old_data)
        VALUES (TG_TABLE_NAME, 'UPDATE', row_to_json(NEW), row_to_json(OLD));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO _pulsyn_changes (table_name, operation, row_data)
        VALUES (TG_TABLE_NAME, 'INSERT', row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER _pulsyn_trigger_customers
    AFTER INSERT OR UPDATE OR DELETE ON demo_customers
    FOR EACH ROW
    EXECUTE FUNCTION _pulsyn_capture_changes();
