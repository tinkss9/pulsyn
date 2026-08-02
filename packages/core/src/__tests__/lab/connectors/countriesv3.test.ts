// countriesv3 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/countriesv3';

const config: ConnectorTestConfig = {
  connectorId: 'test-countriesv3',
  connectorType: 'source',
  engine: 'countriesv3',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
