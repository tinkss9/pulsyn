// oceanbase-mysql Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/oceanbase-mysql';

const config: ConnectorTestConfig = {
  connectorId: 'test-oceanbase-mysql',
  connectorType: 'source',
  engine: 'oceanbase-mysql',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
