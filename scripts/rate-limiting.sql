-- Rate limiting table
CREATE TABLE IF NOT EXISTS _pulsyn_rate_limits (
  id SERIAL PRIMARY KEY,
  api_key_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INT DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key_endpoint ON _pulsyn_rate_limits(api_key_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON _pulsyn_rate_limits(window_start);

-- Rate limit config table
CREATE TABLE IF NOT EXISTS _pulsyn_rate_limit_config (
  id SERIAL PRIMARY KEY,
  api_key_id TEXT UNIQUE NOT NULL,
  requests_per_minute INT DEFAULT 100,
  requests_per_hour INT DEFAULT 1000,
  requests_per_day INT DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rate limit config
INSERT INTO _pulsyn_rate_limit_config (api_key_id, requests_per_minute, requests_per_hour, requests_per_day)
VALUES ('default', 100, 1000, 10000)
ON CONFLICT (api_key_id) DO NOTHING;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_api_key_id TEXT,
  p_endpoint TEXT,
  p_window_seconds INT DEFAULT 60
) RETURNS TABLE(allowed BOOLEAN, remaining INT, limit_val INT, reset_at TIMESTAMPTZ) AS $$
DECLARE
  v_config RECORD;
  v_count INT;
  v_window_start TIMESTAMPTZ;
  v_limit INT;
BEGIN
  -- Get rate limit config (use default if not specified)
  SELECT * INTO v_config
  FROM _pulsyn_rate_limit_config
  WHERE api_key_id = p_api_key_id OR api_key_id = 'default'
  ORDER BY CASE WHEN api_key_id = p_api_key_id THEN 0 ELSE 1 END
  LIMIT 1;

  v_limit := COALESCE(v_config.requests_per_minute, 100);
  v_window_start := NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  -- Count requests in current window
  SELECT COUNT(*) INTO v_count
  FROM _pulsyn_rate_limits
  WHERE api_key_id = p_api_key_id
    AND endpoint = p_endpoint
    AND window_start > v_window_start;

  -- Record this request
  INSERT INTO _pulsyn_rate_limits (api_key_id, endpoint, window_start)
  VALUES (p_api_key_id, p_endpoint, NOW());

  -- Clean up old entries (older than 1 hour)
  DELETE FROM _pulsyn_rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';

  -- Return result
  RETURN QUERY SELECT
    (v_count < v_limit) as allowed,
    GREATEST(0, v_limit - v_count - 1) as remaining,
    v_limit as limit_val,
    NOW() + (p_window_seconds || ' seconds')::INTERVAL as reset_at;
END;
$$ LANGUAGE plpgsql;
