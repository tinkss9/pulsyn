// Greenhouse Harvest API v1 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/greenhouse-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-greenhouse-real',
  connectorType: 'source',
  engine: 'greenhouse-real',
  config: { host: 'https://harvest.greenhouse.io/v1' },
  testTables: ['jobs', 'candidates', 'applications'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
