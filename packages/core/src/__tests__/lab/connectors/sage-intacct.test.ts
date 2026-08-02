// sage-intacct Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sage-intacct';

const config: ConnectorTestConfig = {
  connectorId: 'test-sage-intacct',
  connectorType: 'source',
  engine: 'sage-intacct',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
