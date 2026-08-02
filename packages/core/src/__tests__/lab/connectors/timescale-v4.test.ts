// timescale-v4 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/timescale-v4';

const config: ConnectorTestConfig = {
  connectorId: 'test-timescale-v4',
  connectorType: 'source',
  engine: 'timescale-v4',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
