// rest-api Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/rest-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-rest-api',
  connectorType: 'source',
  engine: 'rest-api',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
