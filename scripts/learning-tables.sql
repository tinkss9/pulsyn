-- Pulsyn Self-Learning LLM — Track B: Learning Tables
-- Run against Supabase: supabase db query --linked --file scripts/learning-tables.sql

-- Learning snapshots: stores timestamped metric snapshots for any resource
CREATE TABLE IF NOT EXISTS ai_learning_snapshots (
  id          TEXT PRIMARY KEY,
  org_id      TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   TEXT NOT NULL,
  metrics     JSONB NOT NULL DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_lookup
  ON ai_learning_snapshots (org_id, resource_type, resource_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_snapshots_recorded
  ON ai_learning_snapshots (recorded_at DESC);

-- Learned patterns: stores pattern data with confidence scores
CREATE TABLE IF NOT EXISTS ai_patterns (
  id           TEXT PRIMARY KEY,
  org_id       TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL DEFAULT '{}',
  confidence   NUMERIC(5,4) NOT NULL DEFAULT 0,
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patterns_lookup
  ON ai_patterns (org_id, pattern_type, confidence DESC);

-- Anomaly baselines: stores mean/stddev per metric for z-score detection
CREATE TABLE IF NOT EXISTS ai_anomaly_baselines (
  id           TEXT PRIMARY KEY,
  org_id       TEXT NOT NULL,
  metric_name  TEXT NOT NULL,
  mean         NUMERIC NOT NULL DEFAULT 0,
  stddev       NUMERIC NOT NULL DEFAULT 0,
  sample_count INTEGER NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_baselines_metric
  ON ai_anomaly_baselines (org_id, metric_name);
