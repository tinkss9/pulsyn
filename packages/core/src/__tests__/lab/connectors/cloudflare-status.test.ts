// Cloudflare Status — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cloudflare-status';

const config: ConnectorTestConfig = {
  connectorId: 'test-cloudflare-status',
  connectorType: 'source',
  engine: 'cloudflare-status',
  config: { host: 'https://www.cloudflarestatus.com/api/v2' },
  testTables: ['status'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
