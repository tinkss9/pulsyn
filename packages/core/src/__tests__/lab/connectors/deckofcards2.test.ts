// Deck of Cards — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/deckofcards2';

const config: ConnectorTestConfig = {
  connectorId: 'test-deckofcards2',
  connectorType: 'source',
  engine: 'deckofcards2',
  config: {
    host: 'https://deckofcardsapi.com/api/deck',
  },
  testTables: ['deck'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
