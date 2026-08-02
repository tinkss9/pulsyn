// skyscanner Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/skyscanner';

const config: ConnectorTestConfig = {
  connectorId: 'test-skyscanner',
  connectorType: 'source',
  engine: 'skyscanner',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
