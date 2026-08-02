// perfectgym Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/perfectgym';

const config: ConnectorTestConfig = {
  connectorId: 'test-perfectgym',
  connectorType: 'source',
  engine: 'perfectgym',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
