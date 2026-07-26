-- Test admin login logging
SELECT log_security_event('admin_login_failure', NULL, '1.2.3.4', 'test', '/admin', 'POST', '{"reason": "test"}'::jsonb);
