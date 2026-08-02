// snowflake Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/snowflake';

const config: ConnectorTestConfig = {
  connectorId: 'test-snowflake',
  connectorType: 'source',
  engine: 'snowflake',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
