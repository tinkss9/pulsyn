// intercom-support Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/intercom-support';

const config: ConnectorTestConfig = {
  connectorId: 'test-intercom-support',
  connectorType: 'source',
  engine: 'intercom-support',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
