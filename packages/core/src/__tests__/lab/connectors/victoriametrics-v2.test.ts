// victoriametrics-v2 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/victoriametrics-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-victoriametrics-v2',
  connectorType: 'source',
  engine: 'victoriametrics-v2',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
