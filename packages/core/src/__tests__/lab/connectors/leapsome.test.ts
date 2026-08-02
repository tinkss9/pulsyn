// leapsome Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/leapsome';

const config: ConnectorTestConfig = {
  connectorId: 'test-leapsome',
  connectorType: 'source',
  engine: 'leapsome',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
