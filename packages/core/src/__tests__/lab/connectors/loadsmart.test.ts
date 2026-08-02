// loadsmart Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/loadsmart';

const config: ConnectorTestConfig = {
  connectorId: 'test-loadsmart',
  connectorType: 'source',
  engine: 'loadsmart',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
