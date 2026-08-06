// Beeceptor Sample — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/beeceptor';

const config: ConnectorTestConfig = {
  connectorId: 'test-beeceptor',
  connectorType: 'source',
  engine: 'beeceptor',
  config: {
    host: 'https://jsonplaceholder.beeceptor.com',
  },
  testTables: ['posts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
