// MTG API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/magicthegathering';

const config: ConnectorTestConfig = {
  connectorId: 'test-magicthegathering',
  connectorType: 'source',
  engine: 'magicthegathering',
  config: {
    host: 'https://api.magicthegathering.io/v1',
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
