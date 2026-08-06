// NBA API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nba-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-nba-api',
  connectorType: 'source',
  engine: 'nba-api',
  config: {
    host: 'https://www.balldontlie.io/api/v1',
  },
  testTables: ['players', 'teams'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
