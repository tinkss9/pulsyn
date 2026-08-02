// oracle-gov Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/oracle-gov';

const config: ConnectorTestConfig = {
  connectorId: 'test-oracle-gov',
  connectorType: 'source',
  engine: 'oracle-gov',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
