// backblaze-b2 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/backblaze-b2';

const config: ConnectorTestConfig = {
  connectorId: 'test-backblaze-b2',
  connectorType: 'source',
  engine: 'backblaze-b2',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
