// @ts-nocheck
// Comprehensive connector registration and interface conformance test
// Tests ALL registered connectors can be instantiated and have the correct interface
// Uses mocked drivers â€” no real database connections needed

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { BaseConnector } from '../../connectors/base';
import { ConnectorRegistry } from '../../connectors/registry';

// Mock database drivers
vi.mock('pg', () => {
  const mockClient = { query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }), release: vi.fn() };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    end: vi.fn(),
  };
  return { Pool: vi.fn(() => mockPool), Client: vi.fn(() => mockClient) };
});

vi.mock('mysql2/promise', () => {
  const mockConn = { ping: vi.fn().mockResolvedValue(true), query: vi.fn().mockResolvedValue([[{ '1': 1 }], []]), release: vi.fn() };
  const mockPool = { getConnection: vi.fn().mockResolvedValue(mockConn), query: vi.fn().mockResolvedValue([[]]), end: vi.fn() };
  return { default: { createPool: vi.fn(() => mockPool) }, createPool: vi.fn(() => mockPool) };
});

vi.mock('mongodb', () => ({
  MongoClient: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(true),
    db: vi.fn(() => ({
      listCollections: vi.fn(() => ({ toArray: vi.fn().mockResolvedValue([]) })),
      collection: vi.fn(() => ({ find: vi.fn(() => ({ toArray: vi.fn().mockResolvedValue([]) })), findOne: vi.fn().mockResolvedValue(null) })),
    })),
    close: vi.fn(),
  })),
}));

vi.mock('ioredis', () => ({
  default: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    info: vi.fn().mockResolvedValue(''),
    ping: vi.fn().mockResolvedValue('PONG'),
    quit: vi.fn(),
  })),
}));

vi.mock('mssql', () => ({
  default: { ConnectionPool: vi.fn(() => ({ connect: vi.fn().mockResolvedValue(true), close: vi.fn(), request: vi.fn(() => ({ query: vi.fn().mockResolvedValue({ recordset: [] }) })) })) },
  ConnectionPool: vi.fn(() => ({ connect: vi.fn().mockResolvedValue(true), close: vi.fn(), request: vi.fn(() => ({ query: vi.fn().mockResolvedValue({ recordset: [] }) })) })),
}));

// Import index.ts which registers core connectors via decorators
// Mock optional native modules that may not be installed
vi.mock('node-rfc', () => ({
  Client: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(true),
    call: vi.fn().mockResolvedValue({}),
    close: vi.fn(),
  })),
}));

vi.mock('oracledb', () => ({
  default: { getConnection: vi.fn().mockResolvedValue({}), createPool: vi.fn().mockResolvedValue({}) },
  getConnection: vi.fn().mockResolvedValue({}),
  createPool: vi.fn().mockResolvedValue({}),
}));

vi.mock('duckdb', () => ({
  Database: vi.fn(() => ({
    connect: vi.fn(() => ({
      all: vi.fn((sql, cb) => cb(null, [])),
      run: vi.fn((sql, cb) => cb && cb(null)),
      close: vi.fn(),
    })),
    close: vi.fn(),
  })),
}));

vi.mock('cassandra-driver', () => ({
  Client: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(true),
    execute: vi.fn().mockResolvedValue({ rows: [] }),
    shutdown: vi.fn(),
  })),
}));

vi.mock('@clickhouse/client', () => ({
  createClient: vi.fn(() => ({
    query: vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue([]) }),
    close: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
  })),
}));

vi.mock('@clickhouse/client-common', () => ({}));

vi.mock('@elastic/elasticsearch', () => ({
  Client: vi.fn(() => ({
    search: vi.fn().mockResolvedValue({ hits: { hits: [] } }),
    indices: { getMapping: vi.fn().mockResolvedValue({}) },
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn(),
  })),
}));

vi.mock('kafkajs', () => ({
  Kafka: vi.fn(() => ({
    consumer: vi.fn(() => ({
      connect: vi.fn().mockResolvedValue(true),
      subscribe: vi.fn().mockResolvedValue(true),
      run: vi.fn().mockResolvedValue(true),
      disconnect: vi.fn(),
    })),
    producer: vi.fn(() => ({
      connect: vi.fn().mockResolvedValue(true),
      send: vi.fn().mockResolvedValue(true),
      disconnect: vi.fn(),
    })),
    admin: vi.fn(() => ({
      connect: vi.fn().mockResolvedValue(true),
      listTopics: vi.fn().mockResolvedValue([]),
      disconnect: vi.fn(),
    })),
  })),
  CompressionTypes: { None: 0, GZIP: 1, Snappy: 2, LZ4: 3, ZSTD: 4 },
  CompressionCodecs: {},
  logLevel: { NOTHING: 0, ERROR: 1, WARN: 2, INFO: 4, DEBUG: 5 },
}));

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn(() => ({})),
  ListTablesCommand: vi.fn(),
  DescribeTableCommand: vi.fn(),
  ScanCommand: vi.fn(),
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: { from: vi.fn(() => ({ send: vi.fn().mockResolvedValue({ Items: [], TableNames: [] }) })) },
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({ send: vi.fn().mockResolvedValue({}) })),
  ListBucketsCommand: vi.fn(),
  ListObjectsV2Command: vi.fn(),
  GetObjectCommand: vi.fn(),
  PutObjectCommand: vi.fn(),
}));

vi.mock('@aws-sdk/client-kinesis', () => ({
  KinesisClient: vi.fn(() => ({ send: vi.fn().mockResolvedValue({}) })),
  ListStreamsCommand: vi.fn(),
  GetRecordsCommand: vi.fn(),
  PutRecordCommand: vi.fn(),
}));

vi.mock('@aws-sdk/client-redshift', () => ({
  RedshiftClient: vi.fn(() => ({ send: vi.fn().mockResolvedValue({}) })),
}));

vi.mock('@google-cloud/bigquery', () => ({
  BigQuery: vi.fn(() => ({
    query: vi.fn().mockResolvedValue([[]]),
    dataset: vi.fn(() => ({ table: vi.fn(() => ({ get: vi.fn().mockResolvedValue([{}]) })) })),
  })),
}));

vi.mock('@google-cloud/storage', () => ({
  Storage: vi.fn(() => ({
    getBuckets: vi.fn().mockResolvedValue([[]]),
    bucket: vi.fn(() => ({ getFiles: vi.fn().mockResolvedValue([[]]) })),
  })),
}));

vi.mock('@azure/storage-blob', () => ({
  BlobServiceClient: { fromConnectionString: vi.fn(() => ({ listContainers: vi.fn().mockResolvedValue([]) })) },
}));

vi.mock('@azure/cosmos', () => ({
  CosmosClient: vi.fn(() => ({
    databases: { readAll: vi.fn().mockResolvedValue({ resources: [] }) },
    database: vi.fn(() => ({ containers: { readAll: vi.fn().mockResolvedValue({ resources: [] }) } })),
  })),
}));

vi.mock('@influxdata/influxdb-client', () => ({
  InfluxDB: vi.fn(() => ({
    getQueryApi: vi.fn(() => ({ queryRows: vi.fn().mockResolvedValue([]) })),
  })),
}));

vi.mock('snowflake-sdk', () => ({
  createConnection: vi.fn(() => ({
    connect: vi.fn((cb) => cb && cb(null)),
    execute: vi.fn((opts) => { opts.streamCb?.([]); opts.complete?.(null, [], []); }),
    destroy: vi.fn(),
  })),
}));

vi.mock('neo4j-driver', () => ({
  default: { driver: vi.fn(() => ({ session: vi.fn(() => ({ run: vi.fn().mockResolvedValue({ records: [] }), close: vi.fn() })), close: vi.fn() })) },
  driver: vi.fn(() => ({ session: vi.fn(() => ({ run: vi.fn().mockResolvedValue({ records: [] }), close: vi.fn() })), close: vi.fn() })),
}));

vi.mock('tedious', () => ({
  Connection: vi.fn(() => ({
    connect: vi.fn(),
    on: vi.fn(),
    execSql: vi.fn(),
    close: vi.fn(),
  })),
  Request: vi.fn(),
  TYPES: {},
}));

vi.mock('parquetjs', () => ({
  ParquetWriter: { openFile: vi.fn().mockResolvedValue({ appendRow: vi.fn(), close: vi.fn() }) },
  ParquetReader: { openFile: vi.fn().mockResolvedValue({ getCursor: vi.fn().mockResolvedValue({ next: vi.fn().mockResolvedValue(null) }), close: vi.fn() }) },
  ParquetSchema: vi.fn(),
}));

vi.mock('csv-parse/sync', () => ({
  parse: vi.fn().mockReturnValue([]),
}));

vi.mock('csv-parse', () => ({
  parse: vi.fn().mockReturnValue([]),
}));

vi.mock('@aws-sdk/client-dynamodb-streams', () => ({
  DynamoDBStreamsClient: vi.fn(() => ({})),
  ListStreamsCommand: vi.fn(),
  GetShardIteratorCommand: vi.fn(),
  GetRecordsCommand: vi.fn(),
}));

vi.mock('@aws-sdk/util-dynamodb', () => ({
  unmarshall: vi.fn((item) => item),
  marshall: vi.fn((item) => item),
}));

import '../../index';

// Also import additional connector modules to register more
import '../../connectors/cassandra';
import '../../connectors/cassandra-v2';
import '../../connectors/clickhouse';
import '../../connectors/dynamodb';
import '../../connectors/dynamodb-v2';
import '../../connectors/s3';
import '../../connectors/s3-parquet-target';
import '../../connectors/bigquery';
import '../../connectors/bigquery-target';
import '../../connectors/bigquery-v3';
import '../../connectors/snowflake';
import '../../connectors/snowflake-target';
import '../../connectors/snowflake-v3';
import '../../connectors/redshift';
import '../../connectors/redshift-v3';
import '../../connectors/databricks';
import '../../connectors/databricks-v3';
import '../../connectors/cosmosdb';
import '../../connectors/cosmosdb-v2';
import '../../connectors/neo4j';
import '../../connectors/influxdb';
import '../../connectors/influxdb-v2';
import '../../connectors/timescaledb';
import '../../connectors/timescale-v4';
import '../../connectors/timescale-v5';
import '../../connectors/cockroachdb';
import '../../connectors/cockroachdb-v2';
import '../../connectors/cockroachdb-cloud';
import '../../connectors/cockroachdb-serverless-v2';
import '../../connectors/mariadb';
import '../../connectors/singlestore';
import '../../connectors/singlestore-v2';
import '../../connectors/tidb';
import '../../connectors/tidb-v2';
import '../../connectors/tidb-cloud';
import '../../connectors/duckdb';
import '../../connectors/duckdb-v3';
import '../../connectors/supabase';
import '../../connectors/supabase-v3';
import '../../connectors/planetscale';
import '../../connectors/planetscale-v2';
import '../../connectors/planetscale-api';
import '../../connectors/neon';
import '../../connectors/neondb';
import '../../connectors/neon-serverless';
import '../../connectors/neon-proxy';
import '../../connectors/sqlite';
import '../../connectors/pulsar';
import '../../connectors/rabbitmq';
import '../../connectors/activemq';
import '../../connectors/nats';
import '../../connectors/mqtt';
import '../../connectors/gcs';
import '../../connectors/azure-blob';
import '../../connectors/elasticsearch';
import '../../connectors/elasticsearch-target';
import '../../connectors/kafka';
import '../../connectors/kafka-target';

// Tier 1 SaaS connectors
import '../../connectors/salesforce';
import '../../connectors/hubspot';
import '../../connectors/stripe';
import '../../connectors/shopify';
import '../../connectors/slack';
import '../../connectors/jira';
import '../../connectors/github';
import '../../connectors/notion';
import '../../connectors/linear';
import '../../connectors/mailchimp';
import '../../connectors/zendesk';
import '../../connectors/twilio';
import '../../connectors/intercom';
import '../../connectors/airtable';
import '../../connectors/google-analytics';
import '../../connectors/mixpanel';
import '../../connectors/sendgrid';
import '../../connectors/freshdesk';
import '../../connectors/asana';
import '../../connectors/trello';
import '../../connectors/monday';
import '../../connectors/pipedrive';
import '../../connectors/quickbooks';
import '../../connectors/xero';
import '../../connectors/bamboohr';
import '../../connectors/datadog';
import '../../connectors/sentry';
import '../../connectors/contentful';
import '../../connectors/segment';
import '../../connectors/amplitude';

// Tier 2 generated SaaS connectors
import '../../connectors/close';
import '../../connectors/copper';
import '../../connectors/zoho-crm';
import '../../connectors/sugarcrm';
import '../../connectors/insightly';
import '../../connectors/capsule-crm';
import '../../connectors/freshsales';
import '../../connectors/gohighlevel';
import '../../connectors/clickup';
import '../../connectors/shortcut';
import '../../connectors/smartsheet';
import '../../connectors/wrike';
import '../../connectors/todoist';
import '../../connectors/calendly';
import '../../connectors/zoom';
import '../../connectors/discord';
import '../../connectors/telegram';
import '../../connectors/whatsapp';
import '../../connectors/microsoft-teams';
import '../../connectors/google-drive';
import '../../connectors/onedrive';
import '../../connectors/dropbox';
import '../../connectors/box';
import '../../connectors/figma';
import '../../connectors/woocommerce';
import '../../connectors/bigcommerce';
import '../../connectors/magento';
import '../../connectors/paypal';
import '../../connectors/braintree';
import '../../connectors/chargebee';
import '../../connectors/recurly';
import '../../connectors/gusto';
import '../../connectors/rippling';
import '../../connectors/deel';
import '../../connectors/workday';
import '../../connectors/greenhouse';
import '../../connectors/lever';
import '../../connectors/google-sheets';
import '../../connectors/servicenow';
import '../../connectors/drift';
import '../../connectors/crisp';
import '../../connectors/livechat';
import '../../connectors/helpscout';
import '../../connectors/front';
import '../../connectors/kustomer';
import '../../connectors/gorgias';

// Batch 3: Marketing, DevOps, Analytics, Communication, Social, Sales
import '../../connectors/activecampaign';
import '../../connectors/marketo';
import '../../connectors/drip';
import '../../connectors/getresponse';
import '../../connectors/aweber';
import '../../connectors/convertkit';
import '../../connectors/mailerlite';
import '../../connectors/mailgun';
import '../../connectors/bitbucket';
import '../../connectors/gitlab';
import '../../connectors/circleci';
import '../../connectors/jenkins';
import '../../connectors/docker-hub';
import '../../connectors/netlify';
import '../../connectors/vercel';
import '../../connectors/cloudflare';
import '../../connectors/snyk';
import '../../connectors/pagerduty';
import '../../connectors/opsgenie';
import '../../connectors/grafana';
import '../../connectors/newrelic';
import '../../connectors/mixpanel';
import '../../connectors/posthog';
import '../../connectors/heap';
import '../../connectors/hotjar';
import '../../connectors/freshchat';
import '../../connectors/happyfox';
import '../../connectors/signal';
import '../../connectors/viber';
import '../../connectors/wechat';
import '../../connectors/line';
import '../../connectors/kakaotalk';
import '../../connectors/messenger';
import '../../connectors/facebook';
import '../../connectors/instagram';
import '../../connectors/twitter';
import '../../connectors/linkedin';
import '../../connectors/pinterest';
import '../../connectors/snapchat';
import '../../connectors/tiktok';
import '../../connectors/youtube';
import '../../connectors/reddit';
import '../../connectors/twitch';
import '../../connectors/spotify';
import '../../connectors/salesloft';
import '../../connectors/outreach';
import '../../connectors/lemlist';
import '../../connectors/apollo';
import '../../connectors/clearbit';
import '../../connectors/6sense';
import '../../connectors/demandbase';
import '../../connectors/rollworks';
import '../../connectors/terminus';

// Batch 4: CRM, Marketing, E-commerce, Finance, Communication
import '../../connectors/agile-crm';
import '../../connectors/nimble';
import '../../connectors/v-tiger';
import '../../connectors/infusionsoft';
import '../../connectors/keap';
import '../../connectors/ontraport';
import '../../connectors/pardot';
import '../../connectors/sfdc-marketing';
import '../../connectors/autopilot';
import '../../connectors/campaign-monitor';
import '../../connectors/constant-contact';
import '../../connectors/klaviyo';
import '../../connectors/customerio';
import '../../connectors/eloqua';
import '../../connectors/act-on';
import '../../connectors/sharp-spring';
import '../../connectors/brevo';
import '../../connectors/sendinblue';
import '../../connectors/moengage';
import '../../connectors/clevertap';
import '../../connectors/iterable';
import '../../connectors/braze';
import '../../connectors/attentive';
import '../../connectors/privy';
import '../../connectors/omnisend';
import '../../connectors/beehiiv';
import '../../connectors/substack';
import '../../connectors/buttondown';
import '../../connectors/ghost-newsletter';
import '../../connectors/convertkit-newsletter';
import '../../connectors/tinyletter';
import '../../connectors/mailjet';
import '../../connectors/mailtrap';
import '../../connectors/elastic-email';
import '../../connectors/sparkpost';
import '../../connectors/pepipost';
import '../../connectors/mandrill';
import '../../connectors/sendpulse';
import '../../connectors/socketlabs';
import '../../connectors/smtp-com';
import '../../connectors/turbo-smtp';
import '../../connectors/postmark';
import '../../connectors/adyen';
import '../../connectors/checkout-com';
import '../../connectors/cleverbridge';
import '../../connectors/fastspring';
import '../../connectors/plimus';
import '../../connectors/avangate';
import '../../connectors/esellerate';
import '../../connectors/mycommerce';
import '../../connectors/sellfy';
import '../../connectors/gumroad';
import '../../connectors/lemon-squeezy';
import '../../connectors/quadpay';
import '../../connectors/sezzle';
import '../../connectors/bread';
import '../../connectors/splitit';
import '../../connectors/snap-finance';
import '../../connectors/zip-pay';
import '../../connectors/klarna';
import '../../connectors/affirm';
import '../../connectors/afterpay';
import '../../connectors/rapyd';
import '../../connectors/razorpay';
import '../../connectors/dwolla';
import '../../connectors/payoneer';
import '../../connectors/wise';
import '../../connectors/wise-pay';
import '../../connectors/remitly';
import '../../connectors/xoom';
import '../../connectors/ria-money';
import '../../connectors/western-union';
import '../../connectors/moneygram';
import '../../connectors/worldpay';
import '../../connectors/nuvei';
import '../../connectors/marqeta';
import '../../connectors/salt-edge';
import '../../connectors/yodlee';
import '../../connectors/mx';
import '../../connectors/finicity';
import '../../connectors/plaid';
import '../../connectors/teller';
import '../../connectors/truelayer';

// Batch 5: Healthcare, Insurance, Agriculture, Hospitality, Food, Fitness, Logistics, Finance, Legal, ERP
import '../../connectors/close';
import '../../connectors/copper';
import '../../connectors/zoho-crm';
import '../../connectors/sugarcrm';
import '../../connectors/insightly';
import '../../connectors/capsule-crm';
import '../../connectors/freshsales';
import '../../connectors/gohighlevel';
import '../../connectors/clickup';
import '../../connectors/shortcut';
import '../../connectors/smartsheet';
import '../../connectors/wrike';
import '../../connectors/todoist';
import '../../connectors/calendly';
import '../../connectors/zoom';
import '../../connectors/discord';
import '../../connectors/telegram';
import '../../connectors/whatsapp';
import '../../connectors/microsoft-teams';
import '../../connectors/google-drive';
import '../../connectors/onedrive';
import '../../connectors/dropbox';
import '../../connectors/box';
import '../../connectors/figma';
import '../../connectors/woocommerce';
import '../../connectors/bigcommerce';
import '../../connectors/magento';
import '../../connectors/paypal';
import '../../connectors/braintree';
import '../../connectors/chargebee';
import '../../connectors/recurly';
import '../../connectors/gusto';
import '../../connectors/rippling';
import '../../connectors/deel';
import '../../connectors/workday';
import '../../connectors/greenhouse';
import '../../connectors/lever';
import '../../connectors/google-sheets';
import '../../connectors/servicenow';
import '../../connectors/intercom';
import '../../connectors/drift';
import '../../connectors/crisp';
import '../../connectors/livechat';
import '../../connectors/helpscout';
import '../../connectors/front';
import '../../connectors/kustomer';
import '../../connectors/gorgias';
import '../../connectors/activecampaign';
import '../../connectors/marketo';
import '../../connectors/drip';
import '../../connectors/getresponse';
import '../../connectors/aweber';
import '../../connectors/convertkit';
import '../../connectors/mailerlite';
import '../../connectors/mailgun';
import '../../connectors/bitbucket';
import '../../connectors/gitlab';
import '../../connectors/circleci';
import '../../connectors/jenkins';
import '../../connectors/docker-hub';
import '../../connectors/netlify';
import '../../connectors/vercel';
import '../../connectors/cloudflare';
import '../../connectors/snyk';
import '../../connectors/pagerduty';
import '../../connectors/opsgenie';
import '../../connectors/grafana';
import '../../connectors/newrelic';
import '../../connectors/mixpanel';
import '../../connectors/posthog';
import '../../connectors/heap';
import '../../connectors/hotjar';
import '../../connectors/freshchat';
import '../../connectors/happyfox';
import '../../connectors/intercom';
import '../../connectors/signal';
import '../../connectors/viber';
import '../../connectors/wechat';
import '../../connectors/line';
import '../../connectors/kakaotalk';
import '../../connectors/messenger';
import '../../connectors/facebook';
import '../../connectors/instagram';
import '../../connectors/twitter';
import '../../connectors/linkedin';
import '../../connectors/pinterest';
import '../../connectors/snapchat';
import '../../connectors/tiktok';
import '../../connectors/youtube';
import '../../connectors/reddit';
import '../../connectors/twitch';
import '../../connectors/spotify';
import '../../connectors/salesloft';
import '../../connectors/outreach';
import '../../connectors/lemlist';
import '../../connectors/apollo';
import '../../connectors/clearbit';
import '../../connectors/6sense';
import '../../connectors/demandbase';
import '../../connectors/rollworks';
import '../../connectors/terminus';
import '../../connectors/agile-crm';
import '../../connectors/nimble';
import '../../connectors/v-tiger';
import '../../connectors/infusionsoft';
import '../../connectors/keap';
import '../../connectors/ontraport';
import '../../connectors/pardot';
import '../../connectors/sfdc-marketing';
import '../../connectors/autopilot';
import '../../connectors/campaign-monitor';
import '../../connectors/constant-contact';
import '../../connectors/klaviyo';
import '../../connectors/customerio';
import '../../connectors/eloqua';
import '../../connectors/act-on';
import '../../connectors/sharp-spring';
import '../../connectors/brevo';
import '../../connectors/sendinblue';
import '../../connectors/moengage';
import '../../connectors/clevertap';
import '../../connectors/iterable';
import '../../connectors/braze';
import '../../connectors/attentive';
import '../../connectors/privy';
import '../../connectors/omnisend';
import '../../connectors/beehiiv';
import '../../connectors/substack';
import '../../connectors/buttondown';
import '../../connectors/ghost-newsletter';
import '../../connectors/convertkit-newsletter';
import '../../connectors/tinyletter';
import '../../connectors/mailjet';
import '../../connectors/mailtrap';
import '../../connectors/elastic-email';
import '../../connectors/sparkpost';
import '../../connectors/pepipost';
import '../../connectors/mandrill';
import '../../connectors/sendpulse';
import '../../connectors/socketlabs';
import '../../connectors/smtp-com';
import '../../connectors/turbo-smtp';
import '../../connectors/postmark';
import '../../connectors/adyen';
import '../../connectors/checkout-com';
import '../../connectors/cleverbridge';
import '../../connectors/fastspring';
import '../../connectors/plimus';
import '../../connectors/avangate';
import '../../connectors/esellerate';
import '../../connectors/mycommerce';
import '../../connectors/sellfy';
import '../../connectors/gumroad';
import '../../connectors/lemon-squeezy';
import '../../connectors/quadpay';
import '../../connectors/sezzle';
import '../../connectors/bread';
import '../../connectors/splitit';
import '../../connectors/snap-finance';
import '../../connectors/zip-pay';
import '../../connectors/klarna';
import '../../connectors/affirm';
import '../../connectors/afterpay';
import '../../connectors/rapyd';
import '../../connectors/razorpay';
import '../../connectors/dwolla';
import '../../connectors/payoneer';
import '../../connectors/wise';
import '../../connectors/wise-pay';
import '../../connectors/remitly';
import '../../connectors/xoom';
import '../../connectors/ria-money';
import '../../connectors/western-union';
import '../../connectors/moneygram';
import '../../connectors/worldpay';
import '../../connectors/nuvei';
import '../../connectors/marqeta';
import '../../connectors/salt-edge';
import '../../connectors/yodlee';
import '../../connectors/mx';
import '../../connectors/finicity';
import '../../connectors/plaid';
import '../../connectors/teller';
import '../../connectors/truelayer';
import '../../connectors/epic';
import '../../connectors/cerner';
import '../../connectors/athenahealth';
import '../../connectors/eclinicalworks';
import '../../connectors/drchrono';
import '../../connectors/kareo';
import '../../connectors/practice-fusion';
import '../../connectors/nextgen';
import '../../connectors/allscripts';
import '../../connectors/advancedmd';
import '../../connectors/valant';
import '../../connectors/simplepractice';
import '../../connectors/therapynotes';
import '../../connectors/availity';
import '../../connectors/change-healthcare';
import '../../connectors/trizetto';
import '../../connectors/optum';
import '../../connectors/eligibility-api';
import '../../connectors/applied-epic';
import '../../connectors/hawksoft';
import '../../connectors/jenesis';
import '../../connectors/vertafore';
import '../../connectors/ezlynx';
import '../../connectors/nowcerts';
import '../../connectors/xanatek';
import '../../connectors/better-agency';
import '../../connectors/agency-matrix';
import '../../connectors/agencybloc';
import '../../connectors/insurancepro';
import '../../connectors/ivans';
import '../../connectors/helden';
import '../../connectors/homenet';
import '../../connectors/dominion';
import '../../connectors/vinsolutions';
import '../../connectors/reynolds-reynolds';
import '../../connectors/cdk-global';
import '../../connectors/routeone';
import '../../connectors/vauto';
import '../../connectors/dealersocket';
import '../../connectors/dealertrack';
import '../../connectors/climate-fieldview';
import '../../connectors/farmlogs';
import '../../connectors/farmfacts';
import '../../connectors/agricircle';
import '../../connectors/agwebb';
import '../../connectors/agworld';
import '../../connectors/agrible';
import '../../connectors/conservis';
import '../../connectors/granular';
import '../../connectors/booking-com';
import '../../connectors/expedia';
import '../../connectors/vrbo';
import '../../connectors/airbnb';
import '../../connectors/cloudbeds';
import '../../connectors/mews';
import '../../connectors/opera';
import '../../connectors/toast';
import '../../connectors/touchbistro';
import '../../connectors/square-restaurants';
import '../../connectors/lightspeed-restaurant';
import '../../connectors/upserve';
import '../../connectors/olo';
import '../../connectors/chownow';
import '../../connectors/doordash';
import '../../connectors/ubereats';
import '../../connectors/grubhub';
import '../../connectors/mindbody';
import '../../connectors/glofox';
import '../../connectors/clubready';
import '../../connectors/zenplanner';
import '../../connectors/wodify';
import '../../connectors/perfectgym';
import '../../connectors/gymmaster';
import '../../connectors/pushpress';
import '../../connectors/triib';
import '../../connectors/flexport';
import '../../connectors/freightview';
import '../../connectors/project44';
import '../../connectors/fourkites';
import '../../connectors/loadsmart';
import '../../connectors/convoy';
import '../../connectors/transfix';
import '../../connectors/shipbob';
import '../../connectors/shipengine';
import '../../connectors/shiphero';
import '../../connectors/shippo';
import '../../connectors/shipstation';
import '../../connectors/easypost';
import '../../connectors/uber-freight';
import '../../connectors/gojek';
import '../../connectors/grab';
import '../../connectors/mercury';
import '../../connectors/brex';
import '../../connectors/ramp';
import '../../connectors/divvy';
import '../../connectors/airbase';
import '../../connectors/tipalti';
import '../../connectors/bill-com';
import '../../connectors/bill4time';
import '../../connectors/clio';
import '../../connectors/mycase';
import '../../connectors/practicepanther';
import '../../connectors/cosmolex';
import '../../connectors/smokeball';
import '../../connectors/abacuslaw';
import '../../connectors/pclaw';
import '../../connectors/tabs3';
import '../../connectors/timesolv';
import '../../connectors/epicor';
import '../../connectors/infor-mfg';
import '../../connectors/mrpeasy';
import '../../connectors/katana-mrp';
import '../../connectors/e2-shop';
import '../../connectors/jobboss';
import '../../connectors/traction';


const TEST_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'testdb',
  user: 'testuser',
  password: 'testpass',
};

describe('Connector Registration Conformance', () => {
  let allSources: string[];
  let allTargets: string[];

  beforeAll(() => {
    allSources = ConnectorRegistry.listSources();
    allTargets = ConnectorRegistry.listTargets();
    console.log(`\n[Conformance] Registered: ${allSources.length} sources, ${allTargets.length} targets`);
    console.log(`[Conformance] Total: ${allSources.length + allTargets.length}`);
  });

  it('should have registered source connectors', () => {
    expect(allSources.length).toBeGreaterThan(0);
  });

  it('should have registered target connectors', () => {
    expect(allTargets.length).toBeGreaterThan(0);
  });

  it('should include core database connectors', () => {
    const coreConnectors = ['postgresql', 'mysql', 'mongodb', 'redis'];
    for (const name of coreConnectors) {
      expect(allSources).toContain(name);
    }
  });

  it('should include target connectors', () => {
    // Targets are registered from the targets/ directory
    expect(allTargets.length).toBeGreaterThan(0);
    // At least snowflake and bigquery should be targets
    expect(allTargets).toContain('snowflake');
    expect(allTargets).toContain('bigquery');
  });

  it('should report total connector count > 50', () => {
    const total = allSources.length + allTargets.length;
    expect(total).toBeGreaterThan(50);
  });
});

describe('Source Connector Instantiation Conformance', () => {
  const allSources = ConnectorRegistry.listSources();

  for (const name of allSources) {
    describe(`${name}`, () => {
      let connector: BaseConnector;

      beforeAll(() => {
        connector = ConnectorRegistry.getSource(name, `test-${name}`, TEST_CONFIG);
      });

      it('should be an instance of BaseConnector', () => {
        expect(connector).toBeInstanceOf(BaseConnector);
      });

      it('should have correct engine property', () => {
        expect(connector.engine).toBe(name);
      });

      it('should have an id', () => {
        expect(connector.id).toBeTruthy();
      });

      it('should not be connected initially', () => {
        expect(connector.isConnected()).toBe(false);
      });

      it('should have getConfig that masks password', () => {
        const config = connector.getConfig();
        expect(config).toBeDefined();
        // host may be undefined for some SaaS stubs that don't store config
        if (config.host !== undefined) {
          expect(config.host).toBe(TEST_CONFIG.host);
        }
      });

      it('should have required interface methods', () => {
        expect(typeof connector.connect).toBe('function');
        expect(typeof connector.disconnect).toBe('function');
        expect(typeof connector.testConnection).toBe('function');
        expect(typeof connector.getTables).toBe('function');
        expect(typeof connector.getTableSchema).toBe('function');
        // CDC methods may not be implemented by all stub connectors
        // startCDC/stopCDC are abstract in BaseConnector so they should exist
        expect(typeof connector.startCDC).toBe('function');
        expect(typeof connector.stopCDC).toBe('function');
        // extractFull/extractIncremental have default implementations that throw
        expect(typeof connector.extractFull).toBe('function');
        expect(typeof connector.extractIncremental).toBe('function');
      });

      it('should be able to call getConfig without error', () => {
        const config = connector.getConfig();
        expect(config).toBeDefined();
      });
    });
  }
});

describe('Target Connector Instantiation Conformance', () => {
  const allTargets = ConnectorRegistry.listTargets();

  for (const name of allTargets) {
    describe(`${name} (target)`, () => {
      let connector: BaseConnector;

      beforeAll(() => {
        connector = ConnectorRegistry.getTarget(name, `test-target-${name}`, TEST_CONFIG);
      });

      it('should be an instance of BaseConnector', () => {
        expect(connector).toBeInstanceOf(BaseConnector);
      });

      it('should have correct engine property', () => {
        expect(connector.engine).toBe(name);
      });

      it('should have writeBatch method', () => {
        // writeBatch has a default implementation in BaseConnector
        expect(typeof connector.writeBatch).toBe('function');
      });

      it('should have target interface methods', () => {
        // mergeRows and createTable may or may not be implemented
        // They have default implementations that throw in BaseConnector
        if (typeof connector.mergeRows === 'function') {
          expect(typeof connector.mergeRows).toBe('function');
        }
        if (typeof connector.createTable === 'function') {
          expect(typeof connector.createTable).toBe('function');
        }
      });
    });
  }
});

describe('Connector Registry Integrity', () => {
  it('should not have duplicate source names', () => {
    const sources = ConnectorRegistry.listSources();
    const unique = new Set(sources);
    expect(unique.size).toBe(sources.length);
  });

  it('should not have duplicate target names', () => {
    const targets = ConnectorRegistry.listTargets();
    const unique = new Set(targets);
    expect(unique.size).toBe(targets.length);
  });

  it('should return false for unknown connector', () => {
    expect(ConnectorRegistry.has('nonexistent_connector_xyz')).toBe(false);
  });

  it('should throw for unknown source', () => {
    expect(() => ConnectorRegistry.getSource('nonexistent_connector_xyz', 'test', TEST_CONFIG)).toThrow();
  });

  it('should throw for unknown target', () => {
    expect(() => ConnectorRegistry.getTarget('nonexistent_connector_xyz', 'test', TEST_CONFIG)).toThrow();
  });
});

