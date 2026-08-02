// amplitude-v3 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/amplitude-v3';

const config: ConnectorTestConfig = {
  connectorId: 'test-amplitude-v3',
  connectorType: 'source',
  engine: 'amplitude-v3',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
