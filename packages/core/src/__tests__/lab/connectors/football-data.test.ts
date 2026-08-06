// Football Data — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/football-data';

const config: ConnectorTestConfig = {
  connectorId: 'test-football-data',
  connectorType: 'source',
  engine: 'football-data',
  config: {
    host: 'https://api.football-data.org/v4',
  },
  testTables: ['competitions'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
