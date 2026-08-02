// greenhouse Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/greenhouse';

const config: ConnectorTestConfig = {
  connectorId: 'test-greenhouse',
  connectorType: 'source',
  engine: 'greenhouse',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
