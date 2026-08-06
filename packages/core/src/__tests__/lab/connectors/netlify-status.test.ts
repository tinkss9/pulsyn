// Netlify Status — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/netlify-status';

const config: ConnectorTestConfig = {
  connectorId: 'test-netlify-status',
  connectorType: 'source',
  engine: 'netlify-status',
  config: { host: 'https://www.netlifystatus.com/api/v2' },
  testTables: ['status'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
