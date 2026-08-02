// athenahealth Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/athenahealth';

const config: ConnectorTestConfig = {
  connectorId: 'test-athenahealth',
  connectorType: 'source',
  engine: 'athenahealth',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
