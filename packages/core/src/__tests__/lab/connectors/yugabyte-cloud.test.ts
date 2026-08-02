// yugabyte-cloud Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/yugabyte-cloud';

const config: ConnectorTestConfig = {
  connectorId: 'test-yugabyte-cloud',
  connectorType: 'source',
  engine: 'yugabyte-cloud',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
