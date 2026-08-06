// Scryfall Cards — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/scryfall-cards';

const config: ConnectorTestConfig = {
  connectorId: 'test-scryfall-cards',
  connectorType: 'source',
  engine: 'scryfall-cards',
  config: { host: 'https://api.scryfall.com' },
  testTables: ['cards'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
