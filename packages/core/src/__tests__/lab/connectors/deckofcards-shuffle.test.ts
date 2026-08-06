// Deck of Cards Shuffle — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/deckofcards-shuffle';

const config: ConnectorTestConfig = {
  connectorId: 'test-deckofcards-shuffle',
  connectorType: 'source',
  engine: 'deckofcards-shuffle',
  config: { host: 'https://deckofcardsapi.com/api/deck' },
  testTables: ['deck'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
