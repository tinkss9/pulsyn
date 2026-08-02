// bigquery Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bigquery';

const config: ConnectorTestConfig = {
  connectorId: 'test-bigquery',
  connectorType: 'source',
  engine: 'bigquery',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
