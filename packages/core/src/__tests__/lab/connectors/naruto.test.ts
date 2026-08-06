// Naruto API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/naruto';

const config: ConnectorTestConfig = {
  connectorId: 'test-naruto',
  connectorType: 'source',
  engine: 'naruto',
  config: {
    host: 'https://narutodb.xyz/api',
  },
  testTables: ['characters'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
