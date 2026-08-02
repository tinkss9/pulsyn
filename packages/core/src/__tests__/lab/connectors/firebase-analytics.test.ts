// firebase-analytics Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/firebase-analytics';

const config: ConnectorTestConfig = {
  connectorId: 'test-firebase-analytics',
  connectorType: 'source',
  engine: 'firebase-analytics',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
