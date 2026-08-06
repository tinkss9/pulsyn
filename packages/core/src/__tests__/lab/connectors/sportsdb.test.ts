// TheSportsDB — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sportsdb';

const config: ConnectorTestConfig = {
  connectorId: 'test-sportsdb',
  connectorType: 'source',
  engine: 'sportsdb',
  config: {
    host: 'https://www.thesportsdb.com/api/v1/json/3',
  },
  testTables: ['leagues', 'teams'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
