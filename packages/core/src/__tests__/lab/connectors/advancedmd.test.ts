// advancedmd Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/advancedmd';

const config: ConnectorTestConfig = {
  connectorId: 'test-advancedmd',
  connectorType: 'source',
  engine: 'advancedmd',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
