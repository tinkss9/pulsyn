-- Demo: Set up CDC on local PostgreSQL
-- Creates source table and change tracking

CREATE TABLE IF NOT EXISTS demo_customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS _pulsyn_changes (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    row_data JSONB,
    old_data JSONB,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE
);

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

DROP TRIGGER IF EXISTS _pulsyn_trigger_customers ON demo_customers;
CREATE TRIGGER _pulsyn_trigger_customers
    AFTER INSERT OR UPDATE OR DELETE ON demo_customers
    FOR EACH ROW
    EXECUTE FUNCTION _pulsyn_capture_changes();
