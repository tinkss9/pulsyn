// Trello API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/trello-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-trello-api',
  connectorType: 'source',
  engine: 'trello-api',
  config: { host: 'https://api.trello.com/1' },
  testTables: ['boards'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
