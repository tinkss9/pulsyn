// balsamiq Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/balsamiq';

const config: ConnectorTestConfig = {
  connectorId: 'test-balsamiq',
  connectorType: 'source',
  engine: 'balsamiq',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
