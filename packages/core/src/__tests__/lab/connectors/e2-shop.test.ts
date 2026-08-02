// e2-shop Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/e2-shop';

const config: ConnectorTestConfig = {
  connectorId: 'test-e2-shop',
  connectorType: 'source',
  engine: 'e2-shop',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
