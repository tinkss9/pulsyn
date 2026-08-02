// culture-amp Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/culture-amp';

const config: ConnectorTestConfig = {
  connectorId: 'test-culture-amp',
  connectorType: 'source',
  engine: 'culture-amp',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
