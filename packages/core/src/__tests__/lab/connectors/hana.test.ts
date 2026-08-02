// hana Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hana';

const config: ConnectorTestConfig = {
  connectorId: 'test-hana',
  connectorType: 'source',
  engine: 'hana',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
