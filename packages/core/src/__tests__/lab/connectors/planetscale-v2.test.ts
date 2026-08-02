// planetscale-v2 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/planetscale-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-planetscale-v2',
  connectorType: 'source',
  engine: 'planetscale-v2',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
