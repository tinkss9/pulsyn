// timescale-v5 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/timescale-v5';

const config: ConnectorTestConfig = {
  connectorId: 'test-timescale-v5',
  connectorType: 'source',
  engine: 'timescale-v5',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
