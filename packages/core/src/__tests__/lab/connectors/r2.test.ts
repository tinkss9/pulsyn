// Cloudflare R2 Connector — Full Lab Test Suite
// R2 is S3-compatible, so we reuse the S3 connector with R2 credentials
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/s3';

const R2_ENDPOINT = process.env.R2_ENDPOINT || 'https://6dd1ca085679d94d268a005899fe9388.r2.cloudflarestorage.com';
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID || 'e588dabfcd4c6527fe5136f84bbb24b2';
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY || '1c1a84067fb5376a8edb35d0ab40b35ea5f37c7ded8ffaeb754ae44f28adefd3';
const R2_BUCKET = process.env.R2_BUCKET || 'inaimedia-uat';

const config: ConnectorTestConfig = {
  connectorId: 'test-r2',
  connectorType: 'source',
  engine: 's3',
  config: {
    host: 'r2.cloudflarestorage.com',
    port: 443,
    database: R2_BUCKET,
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
    endpoint: R2_ENDPOINT,
    forcePathStyle: true,
    region: 'auto',
    ssl: true,
    prefix: 'pulsyn-test/',
  } as any,
  testTables: ['pulsyn-test/data/users.csv', 'pulsyn-test/data/orders.json'],
  skipCDC: true,
  skipBenchmark: false,
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 1,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
