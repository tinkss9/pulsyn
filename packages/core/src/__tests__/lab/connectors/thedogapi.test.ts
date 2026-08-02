// thedogapi Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/thedogapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-thedogapi',
  connectorType: 'source',
  engine: 'thedogapi',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
