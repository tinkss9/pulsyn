// nationalize Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nationalize';

const config: ConnectorTestConfig = {
  connectorId: 'test-nationalize',
  connectorType: 'source',
  engine: 'nationalize',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
