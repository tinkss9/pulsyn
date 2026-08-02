// convertkit-newsletter Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/convertkit-newsletter';

const config: ConnectorTestConfig = {
  connectorId: 'test-convertkit-newsletter',
  connectorType: 'source',
  engine: 'convertkit-newsletter',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
