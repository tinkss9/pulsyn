// Greenhouse API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/greenhouse-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-greenhouse-api',
  connectorType: 'source',
  engine: 'greenhouse-api',
  config: { host: 'https://harvest.greenhouse.io/v1' },
  testTables: ['jobs'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
