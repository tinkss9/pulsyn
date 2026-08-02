// planetscale-api Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/planetscale-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-planetscale-api',
  connectorType: 'source',
  engine: 'planetscale-api',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
