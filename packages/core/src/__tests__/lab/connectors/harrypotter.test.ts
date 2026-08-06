// HP API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/harrypotter';

const config: ConnectorTestConfig = {
  connectorId: 'test-harrypotter',
  connectorType: 'source',
  engine: 'harrypotter',
  config: {
    host: 'https://hp-api.onrender.com/api',
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
