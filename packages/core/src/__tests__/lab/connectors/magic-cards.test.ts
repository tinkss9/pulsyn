// MTG Cards — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/magic-cards';

const config: ConnectorTestConfig = {
  connectorId: 'test-magic-cards',
  connectorType: 'source',
  engine: 'magic-cards',
  config: { host: 'https://api.magicthegathering.io/v1' },
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
