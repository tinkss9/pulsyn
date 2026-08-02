// linkedin-recruit Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/linkedin-recruit';

const config: ConnectorTestConfig = {
  connectorId: 'test-linkedin-recruit',
  connectorType: 'source',
  engine: 'linkedin-recruit',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
