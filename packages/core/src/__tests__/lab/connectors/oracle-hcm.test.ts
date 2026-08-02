// oracle-hcm Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/oracle-hcm';

const config: ConnectorTestConfig = {
  connectorId: 'test-oracle-hcm',
  connectorType: 'source',
  engine: 'oracle-hcm',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
