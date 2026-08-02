// qualtrics Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/qualtrics';

const config: ConnectorTestConfig = {
  connectorId: 'test-qualtrics',
  connectorType: 'source',
  engine: 'qualtrics',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
