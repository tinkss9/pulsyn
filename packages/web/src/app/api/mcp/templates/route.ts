// MCP Forex Templates API — Pre-built forex data pipeline templates
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const FOREX_TEMPLATES: Record<string, {
  name: string;
  description: string;
  source: { engine: string; config: any };
  target: { engine: string; config: any };
  tables: string[];
  tableMapping: Record<string, string>;
}> = {
  'cmc-to-postgres': {
    name: 'CMC Markets → PostgreSQL',
    description: 'Stream forex prices, candles, and positions from CMC Markets into PostgreSQL for AI analysis.',
    source: {
      engine: 'cmc-markets',
      config: {
        baseUrl: 'https://api-capital.backend-capital.com/api/v1',
        authType: 'apikey',
        resources: [
          { name: 'prices', endpoint: '/prices/{epic}', idField: 'epic', modifiedField: 'timestamp' },
          { name: 'candles', endpoint: '/prices/{epic}/resolution/{resolution}', idField: 'snapshotTime', modifiedField: 'snapshotTime' },
          { name: 'positions', endpoint: '/positions', idField: 'positionId', modifiedField: 'updated' },
        ],
      },
    },
    target: { engine: 'postgresql', config: {} },
    tables: ['cmc_prices', 'cmc_candles', 'cmc_positions'],
    tableMapping: { cmc_prices: 'forex_prices', cmc_candles: 'forex_candles', cmc_positions: 'forex_positions' },
  },

  'oanda-to-postgres': {
    name: 'OANDA → PostgreSQL',
    description: 'Stream OANDA v20 candlestick data, trades, and order book into PostgreSQL.',
    source: {
      engine: 'oanda',
      config: {
        baseUrl: 'https://api-fxtrade.oanda.com/v3',
        authType: 'apikey',
        resources: [
          { name: 'candles', endpoint: '/instruments/{instrument}/candles', idField: 'time', modifiedField: 'time' },
          { name: 'trades', endpoint: '/accounts/{accountId}/trades', idField: 'id', modifiedField: 'openTime' },
          { name: 'orders', endpoint: '/accounts/{accountId}/orders', idField: 'id', modifiedField: 'createTime' },
        ],
      },
    },
    target: { engine: 'postgresql', config: {} },
    tables: ['oanda_candles', 'oanda_trades', 'oanda_orders'],
    tableMapping: { oanda_candles: 'forex_candles', oanda_trades: 'forex_trades', oanda_orders: 'forex_orders' },
  },

  'polygon-to-postgres': {
    name: 'Polygon.io → PostgreSQL',
    description: 'Stream stock, forex, and crypto aggregates and trades from Polygon.io.',
    source: {
      engine: 'polygon-io',
      config: {
        baseUrl: 'https://api.polygon.io',
        authType: 'apikey',
        resources: [
          { name: 'aggregates', endpoint: '/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}', idField: 't', modifiedField: 't' },
          { name: 'trades', endpoint: '/v3/trades/{ticker}', idField: 'id', modifiedField: 'sip_timestamp' },
          { name: 'quotes', endpoint: '/v3/quotes/{ticker}', idField: 'id', modifiedField: 'sip_timestamp' },
        ],
      },
    },
    target: { engine: 'postgresql', config: {} },
    tables: ['polygon_aggregates', 'polygon_trades', 'polygon_quotes'],
    tableMapping: { polygon_aggregates: 'market_aggregates', polygon_trades: 'market_trades', polygon_quotes: 'market_quotes' },
  },

  'dexscreener-to-postgres': {
    name: 'DexScreener → PostgreSQL',
    description: 'Stream DEX trading data (Solana, Ethereum, Base) from DexScreener for meme coin analysis.',
    source: {
      engine: 'dexscreener',
      config: {
        baseUrl: 'https://api.dexscreener.com',
        authType: 'none',
        resources: [
          { name: 'pairs', endpoint: '/latest/dex/pairs/{chainId}/{pairAddress}', idField: 'pairAddress', modifiedField: 'pairCreatedAt' },
          { name: 'tokens', endpoint: '/latest/dex/tokens/{tokenAddress}', idField: 'tokenAddress', modifiedField: 'info' },
          { name: 'search', endpoint: '/latest/dex/search?q={query}', idField: 'pairAddress', modifiedField: 'pairCreatedAt' },
        ],
      },
    },
    target: { engine: 'postgresql', config: {} },
    tables: ['dex_pairs', 'dex_tokens', 'dex_search'],
    tableMapping: { dex_pairs: 'crypto_pairs', dex_tokens: 'crypto_tokens', dex_search: 'crypto_search' },
  },

  'multi-forex-aggregator': {
    name: 'Multi-Forex Aggregator',
    description: 'Aggregate forex data from CMC + OANDA + Polygon into a unified schema. Best for AI models that need multi-source price consensus.',
    source: {
      engine: 'cmc-markets',
      config: {
        baseUrl: 'https://api-capital.backend-capital.com/api/v1',
        authType: 'apikey',
        resources: [
          { name: 'prices', endpoint: '/prices/{epic}', idField: 'epic', modifiedField: 'timestamp' },
        ],
      },
    },
    target: { engine: 'postgresql', config: {} },
    tables: ['cmc_prices'],
    tableMapping: { cmc_prices: 'unified_forex_prices' },
  },
};

// GET /api/mcp/templates — List available forex templates
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');

  let templates = Object.entries(FOREX_TEMPLATES).map(([id, t]) => ({
    id,
    name: t.name,
    description: t.description,
    sourceEngine: t.source.engine,
    tables: t.tables,
  }));

  if (category) {
    templates = templates.filter(t =>
      t.sourceEngine.includes(category) || t.name.toLowerCase().includes(category)
    );
  }

  return NextResponse.json({ data: templates, total: templates.length });
}

// POST /api/mcp/templates — Deploy a forex template (creates pipeline + connector)
export async function POST(req: NextRequest) {
  const { templateId, organizationId, targetConfig, sourceApiKey } = await req.json();

  if (!templateId || !organizationId) {
    return NextResponse.json({ error: 'Missing templateId or organizationId' }, { status: 400 });
  }

  const template = FOREX_TEMPLATES[templateId];
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  // Create source connector
  const sourceId = `conn-${Date.now()}-src`;
  const sourceConfig = { ...template.source.config };
  if (sourceApiKey) {
    sourceConfig.apiKey = sourceApiKey;
  }

  await query(
    `INSERT INTO connectors (id, name, engine, config, status, organization_id)
     VALUES ($1, $2, $3, $4::jsonb, 'disconnected', $5)`,
    [sourceId, `${template.name} Source`, template.source.engine, JSON.stringify(sourceConfig), organizationId]
  );

  // Create pipeline
  const pipelineId = `pipeline-${Date.now()}`;
  const pipelineConfig = {
    tableMapping: template.tableMapping,
    template: templateId,
  };

  await query(
    `INSERT INTO pipelines (id, name, source, target, tables, config, organization_id)
     VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7)`,
    [
      pipelineId,
      template.name,
      JSON.stringify(sourceConfig),
      JSON.stringify(targetConfig || {}),
      JSON.stringify(template.tables),
      JSON.stringify(pipelineConfig),
      organizationId,
    ]
  );

  return NextResponse.json({
    data: {
      pipelineId,
      sourceConnectorId: sourceId,
      name: template.name,
      tables: template.tables,
      tableMapping: template.tableMapping,
      message: `Template deployed! Pipeline ${pipelineId} created with source connector ${sourceId}. Start CDC when ready.`,
    },
  }, { status: 201 });
}
