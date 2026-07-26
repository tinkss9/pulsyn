-- Insert a test change that will trigger an error during replication
INSERT INTO _pulsyn_changes (table_name, operation, row_data)
VALUES ('source_users', 'INSERT', '{"id": "invalid", "name": "Test", "email": "test@test.com"}');
