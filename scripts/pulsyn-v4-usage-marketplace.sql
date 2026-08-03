-- Pulsyn v4 — Usage Tracking in CDC Processor + Marketplace Tables
-- Run: supabase db query --linked --file scripts/pulsyn-v4-usage-marketplace.sql

-- ═══════════════════════════════════════════════════════════════
-- PART 1: Update CDC processor to track rows replicated
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION process_pulsyn_changes()
RETURNS TABLE(processed_count BIGINT, error_count BIGINT, skipped_count BIGINT, error_details JSONB) AS $$
DECLARE
  change_rec RECORD;
  pipeline_rec RECORD;
  target_table TEXT;
  proc_count BIGINT := 0;
  err_count BIGINT := 0;
  skip_count BIGINT := 0;
  err_details JSONB := '[]'::JSONB;
  err_msg TEXT;
  set_clause TEXT;
  where_clause TEXT;
  sql TEXT;
BEGIN
  FOR change_rec IN
    SELECT c.id, c.table_name, c.operation, c.row_data, c.old_data,
           c.pipeline_id, c.retry_count, c.max_retries
    FROM _pulsyn_changes c
    WHERE c.processed = FALSE
      AND c.retry_count < c.max_retries
    ORDER BY c.id ASC
    LIMIT 100
  LOOP
    BEGIN
      -- Resolve target table from pipeline config tableMapping
      target_table := change_rec.table_name;
      IF change_rec.pipeline_id IS NOT NULL THEN
        SELECT * INTO pipeline_rec FROM pipelines WHERE id = change_rec.pipeline_id;
        IF FOUND AND pipeline_rec.config IS NOT NULL THEN
          IF pipeline_rec.config ? 'tableMapping' 
             AND pipeline_rec.config->'tableMapping' ? change_rec.table_name THEN
            target_table := pipeline_rec.config->'tableMapping'->>change_rec.table_name;
          ELSIF pipeline_rec.config ? 'table_mapping' 
                AND pipeline_rec.config->'table_mapping' ? change_rec.table_name THEN
            target_table := pipeline_rec.config->'table_mapping'->>change_rec.table_name;
          END IF;
        END IF;
      END IF;

      -- Apply the change
      CASE change_rec.operation
        WHEN 'INSERT' THEN
          SELECT INTO set_clause, where_clause
            string_agg(quote_ident(key), ', '),
            string_agg(format('%L', value), ', ')
          FROM jsonb_each_text(change_rec.row_data);
          sql := format('INSERT INTO %I (%s) VALUES (%s) ON CONFLICT DO NOTHING', target_table, set_clause, where_clause);
          EXECUTE sql;

        WHEN 'UPDATE' THEN
          IF change_rec.old_data IS NOT NULL AND change_rec.old_data ? 'id' THEN
            SELECT INTO set_clause
              string_agg(format('%I = %L', key, value), ', ')
            FROM jsonb_each_text(change_rec.row_data)
            WHERE key != 'id';
            sql := format('UPDATE %I SET %s WHERE id = %L', target_table, set_clause, change_rec.old_data->>'id');
            EXECUTE sql;
          END IF;

        WHEN 'DELETE' THEN
          IF change_rec.old_data IS NOT NULL AND change_rec.old_data ? 'id' THEN
            sql := format('DELETE FROM %I WHERE id = %L', target_table, change_rec.old_data->>'id');
            EXECUTE sql;
          END IF;
      END CASE;

      -- Mark processed
      UPDATE _pulsyn_changes SET processed = TRUE, error_message = NULL, failed_at = NULL
      WHERE _pulsyn_changes.id = change_rec.id;

      -- Track usage: record rows replicated for the pipeline's organization
      IF change_rec.pipeline_id IS NOT NULL AND pipeline_rec.organization_id IS NOT NULL THEN
        INSERT INTO usage_records (organization_id, metric, quantity)
        VALUES (pipeline_rec.organization_id, 'rows_replicated', 1);
      END IF;

      proc_count := proc_count + 1;

    EXCEPTION WHEN OTHERS THEN
      err_msg := SQLERRM;
      err_count := err_count + 1;
      UPDATE _pulsyn_changes
      SET retry_count = retry_count + 1, error_message = err_msg, failed_at = NOW()
      WHERE _pulsyn_changes.id = change_rec.id;
      INSERT INTO _pulsyn_errors (change_id, error_message, error_detail, retry_count)
      VALUES (change_rec.id, err_msg, SQLSTATE, change_rec.retry_count + 1);
      err_details := err_details || jsonb_build_object('change_id', change_rec.id, 'table', change_rec.table_name, 'operation', change_rec.operation, 'error', err_msg);
    END;
  END LOOP;

  SELECT COUNT(*) INTO skip_count FROM _pulsyn_changes WHERE processed = FALSE AND retry_count >= max_retries;
  RETURN QUERY SELECT proc_count, err_count, skip_count, err_details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════
-- PART 2: Connector Marketplace Tables
-- ═══════════════════════════════════════════════════════════════

-- Published connectors in the marketplace
CREATE TABLE IF NOT EXISTS marketplace_connectors (
  id TEXT PRIMARY KEY,
  publisher_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  engine TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  icon_url TEXT,
  config_template JSONB NOT NULL DEFAULT '{}',
  schema_definition JSONB NOT NULL DEFAULT '{}',
  version TEXT NOT NULL DEFAULT '1.0.0',
  is_verified BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  download_count BIGINT DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  price_cents INT DEFAULT 0,  -- 0 = free
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mc_slug ON marketplace_connectors(slug);
CREATE INDEX IF NOT EXISTS idx_mc_category ON marketplace_connectors(category);
CREATE INDEX IF NOT EXISTS idx_mc_published ON marketplace_connectors(is_published, is_verified);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id TEXT PRIMARY KEY,
  connector_id TEXT NOT NULL REFERENCES marketplace_connectors(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mr_connector ON marketplace_reviews(connector_id, created_at DESC);

-- Connector installations (who installed what)
CREATE TABLE IF NOT EXISTS marketplace_installations (
  id TEXT PRIMARY KEY,
  connector_id TEXT NOT NULL REFERENCES marketplace_connectors(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  installed_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  config JSONB DEFAULT '{}',
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mi_org ON marketplace_installations(organization_id);
CREATE INDEX IF NOT EXISTS idx_mi_connector ON marketplace_installations(connector_id);

-- Revenue sharing ledger
CREATE TABLE IF NOT EXISTS marketplace_revenue (
  id BIGSERIAL PRIMARY KEY,
  connector_id TEXT NOT NULL REFERENCES marketplace_connectors(id),
  publisher_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  amount_cents INT NOT NULL,
  platform_fee_cents INT NOT NULL,  -- 30% platform cut
  publisher_payout_cents INT NOT NULL,  -- 70% to publisher
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending / paid / failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mrev_publisher ON marketplace_revenue(publisher_id, created_at DESC);

-- RLS
ALTER TABLE marketplace_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_revenue ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['marketplace_connectors', 'marketplace_reviews', 'marketplace_installations', 'marketplace_revenue']) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_' || t AND tablename = t) THEN
      EXECUTE format('CREATE POLICY "service_role_all_%s" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', t, t);
    END IF;
  END LOOP;
END $$;

-- Update avg_rating when reviews change
CREATE OR REPLACE FUNCTION update_connector_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_connectors
  SET avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM marketplace_reviews WHERE connector_id = COALESCE(NEW.connector_id, OLD.connector_id)),
      rating_count = (SELECT COUNT(*) FROM marketplace_reviews WHERE connector_id = COALESCE(NEW.connector_id, OLD.connector_id)),
      updated_at = NOW()
  WHERE id = COALESCE(NEW.connector_id, OLD.connector_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_rating ON marketplace_reviews;
CREATE TRIGGER trg_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON marketplace_reviews
  FOR EACH ROW EXECUTE FUNCTION update_connector_rating();


-- ═══════════════════════════════════════════════════════════════
-- PART 3: Seed marketplace with forex connector templates
-- ═══════════════════════════════════════════════════════════════

INSERT INTO marketplace_connectors (id, publisher_id, name, slug, description, engine, category, config_template, is_verified, is_published, version)
VALUES
  ('mkt-cmc-markets', 'pulsyn-team', 'CMC Markets', 'cmc-markets',
   'Real-time forex, indices, and commodities data from CMC Markets CFD API. Streams price ticks, OHLCV candles, and account positions.',
   'cmc-markets', 'forex',
   '{"baseUrl":"https://api-capital.backend-capital.com/api/v1","authType":"apikey","resources":[{"name":"prices","endpoint":"/prices/{epic}","idField":"epic","modifiedField":"timestamp"},{"name":"candles","endpoint":"/prices/{epic}/resolution/{resolution}","idField":"snapshotTime","modifiedField":"snapshotTime"},{"name":"positions","endpoint":"positions","idField":"positionId","modifiedField":"updated"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  ('mkt-oanda', 'pulsyn-team', 'OANDA Forex', 'oanda-forex',
   'Real-time forex streaming from OANDA v20 API. Supports candlestick data, order book, positioning ratios, and trade execution.',
   'oanda', 'forex',
   '{"baseUrl":"https://api-fxtrade.oanda.com/v3","authType":"apikey","resources":[{"name":"candles","endpoint":"/instruments/{instrument}/candles","idField":"time","modifiedField":"time"},{"name":"trades","endpoint":"/accounts/{accountId}/trades","idField":"id","modifiedField":"openTime"},{"name":"orders","endpoint":"/accounts/{accountId}/orders","idField":"id","modifiedField":"createTime"}],"rateLimit":{"requestsPerSecond":10}}',
   true, true, '1.0.0'),

  ('mkt-polygon-io', 'pulsyn-team', 'Polygon.io', 'polygon-io',
   'Stocks, forex, and crypto market data from Polygon.io. Real-time WebSocket streaming plus REST snapshots, aggregates, and tick data.',
   'polygon-io', 'finance',
   '{"baseUrl":"https://api.polygon.io","authType":"apikey","resources":[{"name":"aggregates","endpoint":"/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}","idField":"t","modifiedField":"t"},{"name":"trades","endpoint":"/v3/trades/{ticker}","idField":"id","modifiedField":"sip_timestamp"},{"name":"quotes","endpoint":"/v3/quotes/{ticker}","idField":"id","modifiedField":"sip_timestamp"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  ('mkt-alpha-vantage', 'pulsyn-team', 'Alpha Vantage', 'alpha-vantage',
   'Free and premium stock, forex, and crypto data from Alpha Vantage. Includes technical indicators, fundamental data, and sector performance.',
   'alpha-vantage', 'finance',
   '{"baseUrl":"https://www.alphavantage.co/query","authType":"apikey","resources":[{"name":"forex_daily","endpoint":"?function=FX_DAILY&from_symbol={from}&to_symbol={to}","idField":"timestamp","modifiedField":"timestamp"},{"name":"crypto_daily","endpoint":"?function=DIGITAL_CURRENCY_DAILY&symbol={symbol}&market={market}","idField":"timestamp","modifiedField":"timestamp"},{"name":"stocks_intraday","endpoint":"?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval={interval}","idField":"timestamp","modifiedField":"timestamp"}],"rateLimit":{"requestsPerSecond":5}}',
   true, true, '1.0.0'),

  ('mkt-dexscreener', 'pulsyn-team', 'DexScreener', 'dexscreener',
   'Real-time DEX trading data from DexScreener. Token prices, liquidity, volume, and pair discovery across Solana, Ethereum, Base, and 30+ chains.',
   'dexscreener', 'crypto',
   '{"baseUrl":"https://api.dexscreener.com","authType":"none","resources":[{"name":"pairs","endpoint":"/latest/dex/pairs/{chainId}/{pairAddress}","idField":"pairAddress","modifiedField":"pairCreatedAt"},{"name":"tokens","endpoint":"/latest/dex/tokens/{tokenAddress}","idField":"tokenAddress","modifiedField":"info"},{"name":"search","endpoint":"/latest/dex/search?q={query}","idField":"pairAddress","modifiedField":"pairCreatedAt"}],"rateLimit":{"requestsPerSecond":30}}',
   true, true, '1.0.0'),

  ('mkt-binance', 'pulsyn-team', 'Binance', 'binance',
   'Real-time cryptocurrency market data from Binance. Klines, trades, ticker, order book depth, and WebSocket streaming.',
   'binance', 'crypto',
   '{"baseUrl":"https://api.binance.com/api/v3","authType":"none","resources":[{"name":"klines","endpoint":"/klines?symbol={symbol}&interval={interval}","idField":"openTime","modifiedField":"openTime"},{"name":"trades","endpoint":"/trades?symbol={symbol}","idField":"id","modifiedField":"time"},{"name":"ticker","endpoint":"/ticker/24hr?symbol={symbol}","idField":"symbol","modifiedField":"closeTime"}],"rateLimit":{"requestsPerSecond":20}}',
   true, true, '1.0.0')

ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- PART 4: Get usage summary function for API
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_organization_usage(p_org_id TEXT, p_days INT DEFAULT 30)
RETURNS TABLE(
  metric TEXT,
  total BIGINT,
  today BIGINT,
  this_month BIGINT,
  avg_daily NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.metric,
    COALESCE(SUM(ur.quantity), 0)::BIGINT as total,
    COALESCE(SUM(CASE WHEN ur.created_at >= CURRENT_DATE THEN ur.quantity ELSE 0 END), 0)::BIGINT as today,
    COALESCE(SUM(CASE WHEN ur.created_at >= date_trunc('month', CURRENT_DATE) THEN ur.quantity ELSE 0 END), 0)::BIGINT as this_month,
    COALESCE(AVG(daily.total), 0)::NUMERIC as avg_daily
  FROM usage_records ur
  LEFT JOIN LATERAL (
    SELECT SUM(quantity) as total
    FROM usage_records
    WHERE organization_id = p_org_id AND metric = ur.metric
      AND created_at >= CURRENT_DATE - p_days
    GROUP BY date_trunc('day', created_at)
  ) daily ON true
  WHERE ur.organization_id = p_org_id
    AND ur.created_at >= CURRENT_DATE - p_days
  GROUP BY ur.metric;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
