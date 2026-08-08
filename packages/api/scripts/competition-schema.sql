-- Pulsyn Competition Leaderboard Schema

CREATE TABLE IF NOT EXISTS public.competition_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name TEXT NOT NULL,
  email TEXT,
  country_code TEXT,
  rows_per_sec NUMERIC NOT NULL DEFAULT 0,
  score NUMERIC NOT NULL DEFAULT 0,
  phase TEXT NOT NULL DEFAULT 'qualifiers',
  week INTEGER NOT NULL DEFAULT 1,
  data_integrity_pct NUMERIC DEFAULT 100,
  checkpoint_recovery_pct NUMERIC DEFAULT 100,
  masking_efficiency_pct NUMERIC DEFAULT 100,
  latency_p99_ms NUMERIC DEFAULT 0,
  error_rate NUMERIC DEFAULT 0,
  source_engine TEXT,
  target_engine TEXT,
  total_rows BIGINT DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  benchmark_run_id TEXT,
  verified BOOLEAN DEFAULT false,
  disqualified BOOLEAN DEFAULT false,
  disqualify_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competition_leaderboard_score
  ON public.competition_leaderboard (score DESC, rows_per_sec DESC);

CREATE TABLE IF NOT EXISTS public.competition_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key TEXT UNIQUE NOT NULL,
  stat_value NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.competition_stats (stat_key, stat_value) VALUES
  ('total_competitors', 0),
  ('peak_rows_per_sec', 0),
  ('total_countries', 0),
  ('total_rows_replicated', 0)
ON CONFLICT (stat_key) DO NOTHING;

ALTER TABLE public.competition_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_leaderboard') THEN
    CREATE POLICY public_read_leaderboard ON public.competition_leaderboard FOR SELECT USING (NOT disqualified);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_stats') THEN
    CREATE POLICY public_read_stats ON public.competition_stats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_all_leaderboard') THEN
    CREATE POLICY service_all_leaderboard ON public.competition_leaderboard FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_all_stats') THEN
    CREATE POLICY service_all_stats ON public.competition_stats FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION refresh_competition_stats()
RETURNS void AS $$
BEGIN
  UPDATE competition_stats SET stat_value = (
    SELECT COUNT(DISTINCT competitor_name) FROM competition_leaderboard WHERE NOT disqualified
  ), updated_at = now() WHERE stat_key = 'total_competitors';

  UPDATE competition_stats SET stat_value = (
    SELECT COALESCE(MAX(rows_per_sec), 0) FROM competition_leaderboard WHERE NOT disqualified
  ), updated_at = now() WHERE stat_key = 'peak_rows_per_sec';

  UPDATE competition_stats SET stat_value = (
    SELECT COUNT(DISTINCT country_code) FROM competition_leaderboard WHERE NOT disqualified AND country_code IS NOT NULL
  ), updated_at = now() WHERE stat_key = 'total_countries';

  UPDATE competition_stats SET stat_value = (
    SELECT COALESCE(SUM(total_rows), 0) FROM competition_leaderboard WHERE NOT disqualified
  ), updated_at = now() WHERE stat_key = 'total_rows_replicated';
END;
$$ LANGUAGE plpgsql;
