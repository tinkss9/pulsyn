-- Security audit log table
CREATE TABLE IF NOT EXISTS _pulsyn_security_log (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'auth_success',
    'auth_failure',
    'rate_limit_exceeded',
    'invalid_key',
    'cron_auth_failure',
    'suspicious_activity'
  )),
  api_key_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  endpoint TEXT,
  method TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_log_event ON _pulsyn_security_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_log_key ON _pulsyn_security_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_security_log_time ON _pulsyn_security_log(created_at);

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT,
  p_api_key_id TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_endpoint TEXT DEFAULT NULL,
  p_method TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO _pulsyn_security_log (event_type, api_key_id, ip_address, user_agent, endpoint, method, details)
  VALUES (p_event_type, p_api_key_id, p_ip_address, p_user_agent, p_endpoint, p_method, p_details);
END;
$$ LANGUAGE plpgsql;

-- View for recent security events
CREATE OR REPLACE VIEW v_pulsyn_security_events AS
SELECT
  id,
  event_type,
  api_key_id,
  ip_address,
  endpoint,
  method,
  details,
  created_at
FROM _pulsyn_security_log
ORDER BY created_at DESC
LIMIT 1000;

-- View for suspicious activity (multiple failures from same IP)
CREATE OR REPLACE VIEW v_pulsyn_suspicious_ips AS
SELECT
  ip_address,
  COUNT(*) as failure_count,
  COUNT(DISTINCT api_key_id) as distinct_keys,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM _pulsyn_security_log
WHERE event_type IN ('auth_failure', 'invalid_key', 'rate_limit_exceeded')
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 5
ORDER BY failure_count DESC;

-- View for rate limit violations by key
CREATE OR REPLACE VIEW v_pulsyn_rate_limit_violations AS
SELECT
  api_key_id,
  COUNT(*) as violation_count,
  MAX(created_at) as last_violation,
  details->>'endpoint' as endpoint
FROM _pulsyn_security_log
WHERE event_type = 'rate_limit_exceeded'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY api_key_id, details->>'endpoint'
ORDER BY violation_count DESC;
