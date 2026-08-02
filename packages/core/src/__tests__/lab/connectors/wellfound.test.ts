// wellfound Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/wellfound';

const config: ConnectorTestConfig = {
  connectorId: 'test-wellfound',
  connectorType: 'source',
  engine: 'wellfound',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
