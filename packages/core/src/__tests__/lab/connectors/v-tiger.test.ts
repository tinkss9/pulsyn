// v-tiger Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/v-tiger';

const config: ConnectorTestConfig = {
  connectorId: 'test-v-tiger',
  connectorType: 'source',
  engine: 'v-tiger',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
