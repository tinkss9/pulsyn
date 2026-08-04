-- Production audit logging for AI chat requests
CREATE TABLE IF NOT EXISTS ai_request_log (
  id          TEXT PRIMARY KEY DEFAULT ('req-' || EXTRACT(EPOCH FROM NOW()) * 1000 || '-' || substr(md5(random()::text), 1, 6)),
  api_key_hash TEXT NOT NULL,
  org_id      TEXT,
  message_length INTEGER,
  has_rag_context BOOLEAN DEFAULT false,
  llm_provider TEXT,
  llm_model   TEXT,
  llm_tokens_in INTEGER DEFAULT 0,
  llm_tokens_out INTEGER DEFAULT 0,
  llm_latency_ms INTEGER DEFAULT 0,
  confidence  NUMERIC(3,2),
  error       TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_log_key ON ai_request_log (api_key_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_log_org ON ai_request_log (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_log_time ON ai_request_log (created_at DESC);

-- Org spending limits
CREATE TABLE IF NOT EXISTS ai_spending_limits (
  org_id      TEXT PRIMARY KEY,
  daily_limit_usd  NUMERIC(10,2) DEFAULT 10.00,
  monthly_limit_usd NUMERIC(10,2) DEFAULT 100.00,
  daily_spend_usd   NUMERIC(10,2) DEFAULT 0.00,
  monthly_spend_usd NUMERIC(10,2) DEFAULT 0.00,
  daily_reset_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 day',
  monthly_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
