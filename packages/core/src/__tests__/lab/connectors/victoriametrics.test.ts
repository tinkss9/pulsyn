// victoriametrics Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/victoriametrics';

const config: ConnectorTestConfig = {
  connectorId: 'test-victoriametrics',
  connectorType: 'source',
  engine: 'victoriametrics',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
