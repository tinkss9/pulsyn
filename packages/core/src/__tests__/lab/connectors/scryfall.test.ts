// Scryfall MTG — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/scryfall';

const config: ConnectorTestConfig = {
  connectorId: 'test-scryfall',
  connectorType: 'source',
  engine: 'scryfall',
  config: {
    host: 'https://api.scryfall.com',
  },
  testTables: ['cards'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
