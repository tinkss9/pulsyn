// Vercel Status — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/vercel-status';

const config: ConnectorTestConfig = {
  connectorId: 'test-vercel-status',
  connectorType: 'source',
  engine: 'vercel-status',
  config: { host: 'https://www.vercel-status.com/api/v2' },
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
