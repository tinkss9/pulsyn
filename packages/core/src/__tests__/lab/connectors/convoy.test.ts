// convoy Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/convoy';

const config: ConnectorTestConfig = {
  connectorId: 'test-convoy',
  connectorType: 'source',
  engine: 'convoy',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
