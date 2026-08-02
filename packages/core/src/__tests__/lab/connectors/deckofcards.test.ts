// deckofcards Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/deckofcards';

const config: ConnectorTestConfig = {
  connectorId: 'test-deckofcards',
  connectorType: 'source',
  engine: 'deckofcards',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
