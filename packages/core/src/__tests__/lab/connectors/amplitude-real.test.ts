// Amplitude API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/amplitude-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-amplitude-real',
  connectorType: 'source',
  engine: 'amplitude-real',
  config: { host: 'https://amplitude.com/api/2' },
  testTables: ['events', 'cohorts', 'funnels'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
