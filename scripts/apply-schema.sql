-- Pulsyn Schema Migration
-- Creates all required tables for the Pulsyn CDC platform
-- Run: supabase db query --linked --file scripts/apply-schema.sql

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  company TEXT,
  plan_id TEXT NOT NULL DEFAULT 'community',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'API Key',
  plan_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);

-- API Usage Log (for rate limiting)
CREATE TABLE IF NOT EXISTS api_usage_log (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_log_org_time ON api_usage_log(organization_id, created_at);

-- Connectors
CREATE TABLE IF NOT EXISTS connectors (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  name TEXT NOT NULL,
  engine TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'disconnected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pipelines
CREATE TABLE IF NOT EXISTS pipelines (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  config JSONB NOT NULL DEFAULT '{}',
  stats JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checkpoints
CREATE TABLE IF NOT EXISTS checkpoints (
  id TEXT PRIMARY KEY,
  pipeline_id TEXT NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  lsn TEXT,
  tables JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_pipeline ON checkpoints(pipeline_id, created_at DESC);

-- Subscriptions (billing)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  plan_id TEXT NOT NULL DEFAULT 'community',
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);

-- Usage Records (billing metering)
CREATE TABLE IF NOT EXISTS usage_records (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
  metric TEXT NOT NULL,
  value BIGINT NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_records_org ON usage_records(organization_id, recorded_at);

-- CDC Changes (for event streaming)
CREATE TABLE IF NOT EXISTS _pulsyn_changes (
  id BIGSERIAL PRIMARY KEY,
  pipeline_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_changes_pipeline ON _pulsyn_changes(pipeline_id, created_at DESC);

-- Benchmark Reports
CREATE TABLE IF NOT EXISTS benchmark_reports (
  id TEXT PRIMARY KEY,
  connector_pair JSONB NOT NULL,
  results JSONB NOT NULL DEFAULT '[]',
  summary JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CDC Engines (persistent state for running pipelines)
CREATE TABLE IF NOT EXISTS cdc_engines (
  id TEXT PRIMARY KEY,
  pipeline_id TEXT NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'stopped',
  started_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
  events_processed BIGINT NOT NULL DEFAULT 0,
  batches_committed BIGINT NOT NULL DEFAULT 0,
  errors BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cdc_engines_pipeline ON cdc_engines(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_cdc_engines_status ON cdc_engines(status);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE _pulsyn_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cdc_engines ENABLE ROW LEVEL SECURITY;

-- Service role bypass policies (for API server)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'organizations', 'api_keys', 'api_usage_log', 'connectors',
    'pipelines', 'checkpoints', 'subscriptions', 'usage_records',
    '_pulsyn_changes', 'benchmark_reports', 'cdc_engines'
  ]) LOOP
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "service_role_all_%s" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      t, t
    );
  END LOOP;
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Create _pulsyn_exec RPC function for raw SQL execution
CREATE OR REPLACE FUNCTION _pulsyn_exec(sql TEXT, params TEXT[] DEFAULT '{}')
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  param_count INT;
BEGIN
  -- Count parameters in the SQL
  param_count := array_length(params, 1);

  -- Execute the query and return results as JSONB array
  IF param_count IS NULL OR param_count = 0 THEN
    EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || sql || ') t'
    INTO result;
  ELSE
    -- Use parameterized query with dynamic parameter substitution
    EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || sql || ') t'
    INTO result
    USING params[1], params[2], params[3], params[4], params[5],
          params[6], params[7], params[8], params[9], params[10];
  END IF;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
