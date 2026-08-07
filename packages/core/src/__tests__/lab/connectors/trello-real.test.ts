// Trello API v1 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/trello-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-trello-real',
  connectorType: 'source',
  engine: 'trello-real',
  config: { host: 'https://api.trello.com/1' },
  testTables: ['boards', 'lists', 'cards'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
