// RAWG Video Games — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/rawg';

const config: ConnectorTestConfig = {
  connectorId: 'test-rawg',
  connectorType: 'source',
  engine: 'rawg',
  config: {
    host: 'https://api.rawg.io/api',
  },
  testTables: ['games', 'genres'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
