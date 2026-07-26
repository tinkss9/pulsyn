-- IP blocking table
CREATE TABLE IF NOT EXISTS _pulsyn_blocked_ips (
  id SERIAL PRIMARY KEY,
  ip_address TEXT UNIQUE NOT NULL,
  reason TEXT NOT NULL,
  blocked_by TEXT DEFAULT 'auto',
  failure_count INT DEFAULT 0,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  unblocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON _pulsyn_blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_expires ON _pulsyn_blocked_ips(expires_at);

-- Auto-block threshold config
CREATE TABLE IF NOT EXISTS _pulsyn_block_config (
  id SERIAL PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value INT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default config: block after 10 failures in 1 hour, block for 24 hours
INSERT INTO _pulsyn_block_config (config_key, config_value, description) VALUES
  ('failure_threshold', 10, 'Number of failures before auto-block'),
  ('failure_window_seconds', 3600, 'Time window for counting failures (seconds)'),
  ('block_duration_hours', 24, 'How long to block IP (hours)')
ON CONFLICT (config_key) DO NOTHING;

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION is_ip_blocked(p_ip_address TEXT)
RETURNS TABLE(blocked BOOLEAN, reason TEXT, blocked_at TIMESTAMPTZ, expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_blocked RECORD;
BEGIN
  -- Check for active block (not expired)
  SELECT * INTO v_blocked
  FROM _pulsyn_blocked_ips
  WHERE ip_address = p_ip_address
    AND unblocked_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW());

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, v_blocked.reason, v_blocked.blocked_at, v_blocked.expires_at;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-block IP if threshold exceeded
CREATE OR REPLACE FUNCTION check_and_auto_block(p_ip_address TEXT)
RETURNS TABLE(was_blocked BOOLEAN, block_reason TEXT) AS $$
DECLARE
  v_threshold INT;
  v_window INT;
  v_duration INT;
  v_failure_count INT;
  v_already_blocked BOOLEAN;
BEGIN
  -- Get config
  SELECT config_value INTO v_threshold FROM _pulsyn_block_config WHERE config_key = 'failure_threshold';
  SELECT config_value INTO v_window FROM _pulsyn_block_config WHERE config_key = 'failure_window_seconds';
  SELECT config_value INTO v_duration FROM _pulsyn_block_config WHERE config_key = 'block_duration_hours';

  v_threshold := COALESCE(v_threshold, 10);
  v_window := COALESCE(v_window, 3600);
  v_duration := COALESCE(v_duration, 24);

  -- Check if already blocked
  SELECT EXISTS(
    SELECT 1 FROM _pulsyn_blocked_ips
    WHERE ip_address = p_ip_address
      AND unblocked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_already_blocked;

  IF v_already_blocked THEN
    RETURN QUERY SELECT FALSE, 'already_blocked'::TEXT;
    RETURN;
  END IF;

  -- Count failures in window
  SELECT COUNT(*) INTO v_failure_count
  FROM _pulsyn_security_log
  WHERE ip_address = p_ip_address
    AND event_type IN ('auth_failure', 'invalid_key', 'cron_auth_failure')
    AND created_at > NOW() - (v_window || ' seconds')::INTERVAL;

  -- Auto-block if threshold exceeded
  IF v_failure_count >= v_threshold THEN
    INSERT INTO _pulsyn_blocked_ips (ip_address, reason, failure_count, expires_at)
    VALUES (
      p_ip_address,
      'Auto-blocked: ' || v_failure_count || ' failures in ' || (v_window / 60) || ' minutes',
      v_failure_count,
      NOW() + (v_duration || ' hours')::INTERVAL
    )
    ON CONFLICT (ip_address) DO UPDATE SET
      failure_count = EXCLUDED.failure_count,
      blocked_at = NOW(),
      expires_at = EXCLUDED.expires_at,
      unblocked_at = NULL,
      reason = EXCLUDED.reason;

    -- Log the auto-block event
    PERFORM log_security_event(
      'suspicious_activity',
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      jsonb_build_object(
        'action', 'auto_block',
        'ip', p_ip_address,
        'failure_count', v_failure_count,
        'threshold', v_threshold,
        'blocked_for_hours', v_duration
      )
    );

    RETURN QUERY SELECT TRUE, ('Auto-blocked: ' || v_failure_count || ' failures')::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, ('Under threshold: ' || v_failure_count || '/' || v_threshold)::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to manually unblock an IP
CREATE OR REPLACE FUNCTION unblock_ip(p_ip_address TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INT;
BEGIN
  UPDATE _pulsyn_blocked_ips
  SET unblocked_at = NOW()
  WHERE ip_address = p_ip_address
    AND unblocked_at IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired blocks
CREATE OR REPLACE FUNCTION cleanup_expired_blocks()
RETURNS INT AS $$
DECLARE
  v_cleaned INT;
BEGIN
  UPDATE _pulsyn_blocked_ips
  SET unblocked_at = NOW()
  WHERE expires_at < NOW()
    AND unblocked_at IS NULL;

  GET DIAGNOSTICS v_cleaned = ROW_COUNT;
  RETURN v_cleaned;
END;
$$ LANGUAGE plpgsql;

-- View for blocked IPs
CREATE OR REPLACE VIEW v_pulsyn_blocked_ips AS
SELECT
  id,
  ip_address,
  reason,
  blocked_by,
  failure_count,
  blocked_at,
  expires_at,
  unblocked_at,
  CASE
    WHEN unblocked_at IS NOT NULL THEN 'unblocked'
    WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 'expired'
    ELSE 'active'
  END as status
FROM _pulsyn_blocked_ips
ORDER BY blocked_at DESC;
