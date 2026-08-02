// infinite-campus Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/infinite-campus';

const config: ConnectorTestConfig = {
  connectorId: 'test-infinite-campus',
  connectorType: 'source',
  engine: 'infinite-campus',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
