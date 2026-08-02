// agency-matrix Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/agency-matrix';

const config: ConnectorTestConfig = {
  connectorId: 'test-agency-matrix',
  connectorType: 'source',
  engine: 'agency-matrix',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
