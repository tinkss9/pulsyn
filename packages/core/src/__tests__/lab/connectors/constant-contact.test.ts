// constant-contact Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/constant-contact';

const config: ConnectorTestConfig = {
  connectorId: 'test-constant-contact',
  connectorType: 'source',
  engine: 'constant-contact',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
